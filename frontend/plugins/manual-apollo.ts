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
      if (token && isValidJwt(token)) headers['Authorization'] = `Bearer ${token}`
      else headers['x-hasura-role'] = 'public'
    } else {
      headers['x-hasura-role'] = 'public'
    }
    operation.setContext({ headers })
    return forward(operation)
  })

  let link = httpLink
  if (process.client) {
    const wsLink = new GraphQLWsLink(
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

    link = split(
      ({ query }) => {
        const def = getMainDefinition(query)
        return def.kind === 'OperationDefinition' && def.operation === 'subscription'
      },
      wsLink,
      concat(authMiddleware, httpLink)
    )
  } else {
    link = concat(authMiddleware, httpLink)
  }

  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  // Provide globally
  nuxtApp.vueApp.provide(DefaultApolloClient, apolloClient)
  nuxtApp.provide('publicApollo', apolloClient)

  // No return needed
})

function isValidJwt(token: string | null): boolean {
  if (!token) return false
  try {
    if (process.client) {
      const [, payloadBase64] = token.split('.')
      const payload = JSON.parse(atob(payloadBase64))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp && payload.exp > now
    }
    return false
  } catch {
    return false
  }
}
