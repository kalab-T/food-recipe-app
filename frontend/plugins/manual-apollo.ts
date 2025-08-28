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

  // ----------------------------
  // Public Apollo Client
  // ----------------------------
  const publicHttpLink = new HttpLink({
    uri: config.public.hasuraUrl as string,
  })

  const publicMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: { 'x-hasura-role': 'public' },
    })
    return forward(operation)
  })

  const publicApolloClient = new ApolloClient({
    link: concat(publicMiddleware, publicHttpLink),
    cache: new InMemoryCache(),
  })

  // ----------------------------
  // Authenticated Apollo Client
  // ----------------------------
  const authHttpLink = new HttpLink({ uri: config.public.hasuraUrl as string })

  const authMiddleware = new ApolloLink((operation, forward) => {
    let token: string | null = null
    if (process.client) token = localStorage.getItem('token')

    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : { 'x-hasura-role': 'public' }
    operation.setContext({ headers })
    return forward(operation)
  })

  const wsLink = process.client
    ? new GraphQLWsLink(
        createClient({
          url: config.public.hasuraWsUrl as string,
          connectionParams: () => {
            const token = localStorage.getItem('token')
            return token ? { Authorization: `Bearer ${token}` } : { 'x-hasura-role': 'public' }
          },
          retryAttempts: 5,
        })
      )
    : null

  const authLink =
    process.client && wsLink
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query)
            return def.kind === 'OperationDefinition' && def.operation === 'subscription'
          },
          wsLink,
          concat(authMiddleware, authHttpLink)
        )
      : concat(authMiddleware, authHttpLink)

  const authApolloClient = new ApolloClient({
    link: authLink,
    cache: new InMemoryCache(),
  })

  // ----------------------------
  // Provide clients safely
  // ----------------------------
  nuxtApp.vueApp.provide(DefaultApolloClient, publicApolloClient) // default
  if (!nuxtApp._provided || !('_publicApollo' in nuxtApp._provided)) nuxtApp.provide('publicApollo', publicApolloClient)
  if (!nuxtApp._provided || !('_authApollo' in nuxtApp._provided)) nuxtApp.provide('authApollo', authApolloClient)

  return {
    provide: {
      publicApollo: publicApolloClient,
      authApollo: authApolloClient,
    },
  }
})
