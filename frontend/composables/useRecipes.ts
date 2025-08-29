import { gql } from 'graphql-tag'
import { useNuxtApp, useAsyncData } from '#app'

type Recipe = {
  id: string
  title: string
  image: string
  category_id: string
}

type RecipeResponse = {
  recipes: Recipe[]
}

type UseRecipesOptions = {
  limit?: number
  categoryIds?: string[]
}

export const useRecipes = ({ limit, categoryIds }: UseRecipesOptions = {}) => {
  const { $publicApollo } = useNuxtApp()

  const { data, pending, error, refresh } = useAsyncData<RecipeResponse>(
    'recipes',
    async () => {
      const variables: Record<string, any> = { limit }
      if (categoryIds && categoryIds.length > 0) {
        variables.categoryIds = categoryIds
      }

      const result = await $publicApollo.query({
        query: gql`
          query GetRecipes($limit: Int, $categoryIds: [uuid!]) {
            recipes(
              limit: $limit
              where: ${
                categoryIds && categoryIds.length > 0
                  ? '{ category_id: { _in: $categoryIds } }'
                  : '{}'
              }
              order_by: { created_at: desc }
            ) {
              id
              title
              image
              category_id
            }
          }
        `,
        variables,
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
