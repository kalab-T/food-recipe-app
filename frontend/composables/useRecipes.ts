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
  const { $publicApollo, $authApollo } = useNuxtApp()

  // ✅ Decide which client to use: public (no token) or auth (with token)
  const client =
    process.client && localStorage.getItem('token') ? $authApollo : $publicApollo

  const { data, pending, error, refresh } = useAsyncData<RecipeResponse>(
    'recipes',
    async () => {
      const result = await client.query({
        query: gql`
          query GetRecipes($limit: Int, $categoryIds: [uuid!]) {
            recipes(
              limit: $limit
              where: {
                ${categoryIds && categoryIds.length > 0 ? 'category_id: {_in: $categoryIds}' : '{}'}
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
        variables: {
          limit,
          categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
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
