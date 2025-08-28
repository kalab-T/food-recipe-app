import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  concat,
  split,
} from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const httpLink = new HttpLink({
    uri: config.public.hasuraUrl as string,
  })

  // Auth middleware: attach JWT if present, otherwise use public role
  const authMiddleware = new ApolloLink((operation, forward) => {
    let headers: Record<string, string> = {}
    if (process.client) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else {
        headers['x-hasura-role'] = 'public'
      }
    } else {
      headers['x-hasura-role'] = 'public'
    }
    operation.setContext({ headers })
    return forward(operation)
  })

  // GraphQL subscriptions (client-side only)
  const wsLink =
    process.client &&
    new GraphQLWsLink(
      createClient({
        url: config.public.hasuraWsUrl as string,
        connectionParams: () => {
          const token = localStorage.getItem('token')
          return token ? { Authorization: `Bearer ${token}` } : { 'x-hasura-role': 'public' }
        },
        retryAttempts: 5,
      })
    )

  // Split link for subscriptions
  const link =
    process.client && wsLink
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query)
            return def.kind === 'OperationDefinition' && def.operation === 'subscription'
          },
          wsLink,
          concat(authMiddleware, httpLink)
        )
      : concat(authMiddleware, httpLink)

  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  // Provide Apollo client globally
  nuxtApp.provide(DefaultApolloClient, apolloClient)
  nuxtApp.provide('publicApollo', apolloClient)

  return {
    provide: {
      apolloClient,
      publicApollo: apolloClient,
    },
  }
})
