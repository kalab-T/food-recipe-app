import { gql } from 'graphql-tag'
import { useNuxtApp, useAsyncData } from '#app'

type Recipe = {
  id: string
  title: string
  description: string
  image: string
  user: {
    name: string
  }
  likes_aggregate: {
    aggregate: {
      count: number
    }
  }
}

type RecipeResponse = {
  recipes: Recipe[]
}

type UseRecipesOptions = {
  limit?: number
}

export const useRecipes = ({ limit = 6 }: UseRecipesOptions = {}) => {
  const { $publicApollo } = useNuxtApp()

  const { data, pending, error, refresh } = useAsyncData<RecipeResponse>(
    'recipes',
    async () => {
      const result = await $publicApollo.query({
        query: gql`
          query GetLandingRecipes($limit: Int!) {
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
        `,
        variables: {
          limit,
        },
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
