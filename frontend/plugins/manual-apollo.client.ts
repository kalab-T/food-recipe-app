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
  const httpLink = new HttpLink({ uri: config.public.hasuraUrl as string })

  const authMiddleware = new ApolloLink((operation, forward) => {
    const headers: Record<string, string> = {}
    if (process.client) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else if (config.public.hasuraAdminSecret) {
        // DEVELOPMENT fallback: use admin secret when no token is present (remove in production)
        headers['x-hasura-admin-secret'] = config.public.hasuraAdminSecret as string
      } else {
        headers['x-hasura-role'] = 'public'
      }
    } else {
      // SSR (server-side) - use admin secret from runtime config to avoid Hasura rejecting during SSR
      if (config.public.hasuraAdminSecret) {
        headers['x-hasura-admin-secret'] = config.public.hasuraAdminSecret as string
      }
    }
    operation.setContext({ headers })
    return forward(operation)
  })

  const wsLink =
    process.client &&
    new GraphQLWsLink(
      createClient({
        url: config.public.hasuraWsUrl as string,
        connectionParams: () => {
          const token = localStorage.getItem('token')
          return token ? { Authorization: `Bearer ${token}` } : { 'x-hasura-admin-secret': config.public.hasuraAdminSecret as string }
        },
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
