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

  // -------------------
  // HTTP links
  // -------------------
  const httpLink = new HttpLink({ uri: config.public.hasuraUrl as string })

  // Auth middleware: only attach JWT if it exists and is valid
  const authMiddleware = new ApolloLink((operation, forward) => {
    const token = process.client ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {}

    if (token && isValidJwt(token)) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      headers['x-hasura-role'] = 'public'
      if (process.client) localStorage.removeItem('token')
    }

    operation.setContext({ headers })
    return forward(operation)
  })

  // -------------------
  // WebSocket link for subscriptions
  // -------------------
  const wsLink =
    process.client &&
    new GraphQLWsLink(
      createClient({
        url: config.public.hasuraWsUrl as string,
        connectionParams: () => {
          const token = localStorage.getItem('token')
          return token && isValidJwt(token)
            ? { Authorization: `Bearer ${token}` }
            : { 'x-hasura-role': 'public' }
        },
        retryAttempts: 5,
      })
    )

  // -------------------
  // Split link: subscriptions vs queries/mutations
  // -------------------
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

  // -------------------
  // Apollo clients
  // -------------------
  const authApolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  // Public client: always force public role
  const publicApolloClient = new ApolloClient({
    link: new ApolloLink((operation, forward) => {
      operation.setContext({ headers: { 'x-hasura-role': 'public' } })
      return forward(operation)
    }).concat(httpLink),
    cache: new InMemoryCache(),
  })

  // Provide both clients
  nuxtApp.provide('authApollo', authApolloClient)
  nuxtApp.provide('publicApollo', publicApolloClient)
  nuxtApp.vueApp.provide(DefaultApolloClient, authApolloClient)

  return {
    provide: {
      authApollo: authApolloClient,
      publicApollo: publicApolloClient,
    },
  }
})

// -------------------
// JWT validator
// -------------------
function isValidJwt(token: string | null): boolean {
  if (!token) return false
  try {
    const [, payloadBase64] = token.split('.')
    const payload = JSON.parse(atob(payloadBase64))
    const now = Math.floor(Date.now() / 1000)
    return payload.exp && payload.exp > now
  } catch {
    return false
  }
}
