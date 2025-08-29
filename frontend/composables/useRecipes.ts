import { gql } from 'graphql-tag'
import { useNuxtApp, useAsyncData } from '#app'

const GET_LANDING_RECIPES = gql`
  query GetLandingRecipes($limit: Int) {
    recipes(limit: $limit, order_by: { created_at: desc }) {
      id
      title
      description
      image
      user {
        name
      }
      likes_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

export const useRecipes = ({ limit = 6 } = {}) => {
  const { $publicApollo } = useNuxtApp()

  const { data, pending, error, refresh } = useAsyncData(
    ['recipes', limit],
    async () => {
      const result = await $publicApollo.query({
        query: GET_LANDING_RECIPES,
        variables: { limit },
        fetchPolicy: 'network-only',
      })
      return result.data
    }
  )

  return {
    recipes: data,
    loading: pending,
    error,
    refetch: refresh,
  }
}
