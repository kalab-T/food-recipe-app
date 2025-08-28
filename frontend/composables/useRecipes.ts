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
    // Use a unique key depending on selected categories
    `recipes-${categoryIds ? categoryIds.join(',') : 'all'}`,
    async () => {
      const whereClause =
        categoryIds && categoryIds.length > 0
          ? { category_id: { _in: categoryIds } }
          : {}

      const result = await $publicApollo.query({
        query: gql`
          query GetRecipes($limit: Int, $where: recipes_bool_exp) {
            recipes(limit: $limit, where: $where, order_by: { created_at: desc }) {
              id
              title
              image
              category_id
            }
          }
        `,
        variables: {
          limit,
          where: whereClause,
        },
        fetchPolicy: 'network-only',
      })

      return { recipes: result.data.recipes }
    }
  )

  return {
    recipes: data,
    loading: pending,
    error,
    refetch: refresh,
  }
}
