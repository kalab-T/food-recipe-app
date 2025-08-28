import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'
import type { Ref } from 'vue'

import { GET_MY_RECIPES } from '@/graphql/queries/myRecipes'

interface Recipe {
  id: string
  title: string
  description: string
  image: string
  user?: {
    name?: string
  }
}

export function useMyRecipes(userId: Ref<string | null>) {
  const { result, loading, error, refetch } = useQuery(
    GET_MY_RECIPES,
    () => ({ userId: userId.value }),
    {
      enabled: computed(() => !!userId.value),
    }
  )

  const recipes = computed<Recipe[]>(() => result.value?.recipes ?? [])

  return {
    recipes,
    loading,
    error,
    refetch,
  }
}
