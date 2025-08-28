// plugins/manual-apollo.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'
import fetch from 'cross-fetch'
import type { NormalizedCacheObject } from '@apollo/client/core'
import type { NuxtApp } from '#app'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()

  // Prevent re-providing if plugin runs multiple times
  if (!nuxtApp._context.provides.$publicApollo) {
    const publicClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
      link: new HttpLink({
        uri: config.public.hasuraGraphqlUrl,
        fetch,
        headers: {
          'x-hasura-role': 'public', // optional, fallback
        },
      }),
      cache: new InMemoryCache(),
      ssrMode: process.server,
    })

    nuxtApp.provide('$publicApollo', publicClient)
  }

  if (!nuxtApp._context.provides.$authApollo) {
    const authClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
      link: new HttpLink({
        uri: config.public.hasuraGraphqlUrl,
        fetch,
        headers: {
          Authorization: `Bearer ${process.client ? localStorage.getItem('token') || '' : ''}`,
        },
      }),
      cache: new InMemoryCache(),
      ssrMode: process.server,
    })

    nuxtApp.provide('$authApollo', authClient)
  }
})
