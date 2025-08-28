import type { ApolloClient } from '@apollo/client/core'

export {}

declare module '#app' {
  interface NuxtApp {
    $publicApollo: ApolloClient<any>
  }
}

declare module 'nuxt/schema' {
  interface NuxtApp {
    $publicApollo: ApolloClient<any>
  }
}
