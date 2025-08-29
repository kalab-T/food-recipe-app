import { gql, useQuery } from '@apollo/client/core'
import { useNuxtApp } from '#app'
import { ref } from 'vue'

const GET_LANDING_RECIPES = gql`
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
`

export const useRecipes = (limit = 6) => {
  const { $publicApollo } = useNuxtApp()
  const recipes = ref<any[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchRecipes = async () => {
    loading.value = true
    try {
      const { data } = await $publicApollo.query({
        query: GET_LANDING_RECIPES,
        variables: { limit },
        fetchPolicy: 'network-only', // Always fetch fresh
      })

      recipes.value = data.recipes
      error.value = null
    } catch (err: any) {
      console.error('Error fetching recipes:', err)
      error.value = err.message || 'Failed to fetch recipes'
    } finally {
      loading.value = false
    }
  }

  // Initial fetch
  fetchRecipes()

  return { recipes, loading, error, refetch: fetchRecipes }
}
