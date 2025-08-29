import { gql } from 'graphql-tag'
import { useNuxtApp, useAsyncData } from '#app'

type Recipe = {
  id: string
  title: string
  description: string
  image: string
  user: { name: string }
  likes_aggregate: { aggregate: { count: number } }
}

export const useRecipes = () => {
  const { $publicApollo } = useNuxtApp()

  const { data, pending, error, refresh } = useAsyncData(
    'landingRecipes',
    async () => {
      const result = await $publicApollo.query({
        query: gql`
          query GetLandingRecipes {
            recipes(limit: 6, order_by: { created_at: desc }) {
              id
              title
              description
              image
              user { name }
              likes_aggregate { aggregate { count } }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      return result.data
    }
  )

  return { recipes: data, loading: pending, error, refetch: refresh }
}
