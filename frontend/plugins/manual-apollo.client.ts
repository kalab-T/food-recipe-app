import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Use Hasura HTTP endpoint with admin-secret
  const httpLink = new HttpLink({
    uri: config.public.hasuraUrl as string,
    headers: {
      'x-hasura-admin-secret': config.public.hasuraAdminSecret as string,
    },
  })

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  })

  nuxtApp.vueApp.provide(DefaultApolloClient, apolloClient)
  nuxtApp.provide('publicApollo', apolloClient)
})
