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

  // No JWT for now — always use public role
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: { 'x-hasura-role': 'public' }
    })
    return forward(operation)
  })

  const wsLink =
    process.client &&
    new GraphQLWsLink(
      createClient({
        url: config.public.hasuraWsUrl as string,
        connectionParams: { 'x-hasura-role': 'public' },
        retryAttempts: 5,
      })
    )

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

  nuxtApp.vueApp.provide(DefaultApolloClient, apolloClient)
  nuxtApp.provide('publicApollo', apolloClient)
})
