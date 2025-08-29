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

  // --------------------
  // Public client (always x-hasura-role=public, never JWT)
  // --------------------
  const publicHttpLink = new HttpLink({
    uri: config.public.hasuraUrl as string,
    headers: { 'x-hasura-role': 'public' },
  })

  const publicClient = new ApolloClient({
    link: publicHttpLink,
    cache: new InMemoryCache(),
  })

  // --------------------
  // Authenticated client (JWT if available, else fallback public)
  // --------------------
  const authMiddleware = new ApolloLink((operation, forward) => {
    const headers: Record<string, string> = {}
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

  const httpLink = new HttpLink({ uri: config.public.hasuraUrl as string })

  // Subscriptions (authenticated client)
  const wsLink =
    process.client &&
    new GraphQLWsLink(
      createClient({
        url: config.public.hasuraWsUrl as string,
        connectionParams: () => {
          const token = localStorage.getItem('token')
          return token
            ? { Authorization: `Bearer ${token}` }
            : { 'x-hasura-role': 'public' }
        },
        retryAttempts: 5,
      })
    )

  const authLink =
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

  const authClient = new ApolloClient({
    link: authLink,
    cache: new InMemoryCache(),
  })

  // --------------------
  // Provide both clients
  // --------------------
  // Vue Apollo default = authenticated client
  nuxtApp.vueApp.provide(DefaultApolloClient, authClient)

  // Named clients
  nuxtApp.provide('authApollo', authClient)
  nuxtApp.provide('publicApollo', publicClient)
})
