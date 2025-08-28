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

  // Public client
  const publicClient = new ApolloClient({
    link: concat(
      new ApolloLink((op, forward) => {
        op.setContext({ headers: { 'x-hasura-role': 'public' } })
        return forward(op)
      }),
      new HttpLink({ uri: config.public.hasuraUrl })
    ),
    cache: new InMemoryCache(),
  })

  // Auth client
  const authLink = new ApolloLink((op, forward) => {
    let headers: Record<string, string> = { 'x-hasura-role': 'public' }
    if (process.client) {
      const token = localStorage.getItem('token')
      if (token) headers = { Authorization: `Bearer ${token}` }
    }
    op.setContext({ headers })
    return forward(op)
  })

  const wsLink = process.client
    ? new GraphQLWsLink(
        createClient({
          url: config.public.hasuraWsUrl as string,
          connectionParams: () => {
            const token = localStorage.getItem('token')
            return token ? { Authorization: `Bearer ${token}` } : { 'x-hasura-role': 'public' }
          },
        })
      )
    : null

  const link =
    process.client && wsLink
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query)
            return def.kind === 'OperationDefinition' && def.operation === 'subscription'
          },
          wsLink,
          concat(authLink, new HttpLink({ uri: config.public.hasuraUrl }))
        )
      : concat(authLink, new HttpLink({ uri: config.public.hasuraUrl }))

  const authClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  // Provide safely — only once
  nuxtApp.provide('publicApollo', publicClient)
  nuxtApp.provide('authApollo', authClient)
  nuxtApp.provide(DefaultApolloClient, publicClient)

  return {
    provide: {
      publicApollo: publicClient,
      authApollo: authClient,
    },
  }
})
