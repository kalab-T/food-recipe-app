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

  // ✅ Public JWT for landing page
  const PUBLIC_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInB1YmxpYyJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJwdWJsaWMiLCJ4LWhhc3VyYS11c2VyLWlkIjoiYW5vbnltb3VzIiwiaWF0IjoxNzU2NDU2NTM3LCJleHAiOjE3NTY1NDI5Mzd9.wANgfvYqcw56yzeXCvOuprHaNjKZCm-jB-GLOoWUpr0'

  const authMiddleware = new ApolloLink((operation, forward) => {
    const headers: Record<string, string> = {}

    if (process.client) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}` // logged-in user
      } else {
        headers['Authorization'] = `Bearer ${PUBLIC_JWT}` // public landing page
      }
    } else {
      headers['Authorization'] = `Bearer ${PUBLIC_JWT}` // server-side
    }

    operation.setContext({ headers })
    return forward(operation)
  })

  // Subscriptions (client-side)
  const wsLink =
    process.client &&
    new GraphQLWsLink(
      createClient({
        url: config.public.hasuraWsUrl as string,
        connectionParams: () => {
          const token = localStorage.getItem('token')
          return {
            Authorization: `Bearer ${token || PUBLIC_JWT}`,
          }
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
