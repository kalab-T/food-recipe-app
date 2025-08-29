import { gql, useQuery } from '@apollo/client/core'
import { useNuxtApp } from '#app'
import { ref } from 'vue'

const GET_RECIPES = gql`
  query GetRecipes {
    recipes {
      id
      title
      description
      image
      user_id
    }
  }
`

export const useRecipes = () => {
  const { $publicApollo } = useNuxtApp()
  const recipes = ref([] as any[])
  const loading = ref(false)
  const error = ref(null as string | null)

  const fetchRecipes = async () => {
    loading.value = true
    try {
      const { data } = await $publicApollo.query({ query: GET_RECIPES })
      recipes.value = data.recipes
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
  }
}
