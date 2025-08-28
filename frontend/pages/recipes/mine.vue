<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useMyRecipes } from '@/composables/useMyRecipes'
import { useMutation } from '@vue/apollo-composable'
import { DELETE_RECIPE } from '@/graphql/mutations'
import Recipe from '@/components/Recipe.vue'

const auth = useAuth()
const router = useRouter()
const userId = ref(auth.user.value?.id ?? null)

const { recipes, loading, error, refetch } = useMyRecipes(userId)
const { mutate: deleteRecipe } = useMutation(DELETE_RECIPE)

async function handleDelete(recipeId: string) {
  if (!confirm('Are you sure you want to delete this recipe?')) return
  try {
    const result = await deleteRecipe({ id: recipeId })
    const deletedId = result?.data?.delete_recipes_by_pk?.id

    if (deletedId) {
      alert('Recipe deleted successfully')
      await refetch()
    } else {
      alert('Failed to delete the recipe')
    }
  } catch (err) {
    alert('An error occurred while deleting the recipe')
    console.error(err)
  }
}

function goToEdit(recipeId: string) {
  router.push(`/recipes/${recipeId}/edit`)
}
</script>

<template>
  <div class="page-background">
    <section class="py-12 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-white">My Recipes</h1>
          <NuxtLink
            to="/recipes"
            class="bg-white text-blue-600 font-semibold px-4 py-2 rounded shadow hover:bg-gray-100 transition"
          >
            🔙 Back to Recipes
          </NuxtLink>
        </div>

        <div v-if="loading" class="text-center text-gray-200">Loading recipes...</div>

        <div v-if="error" class="text-center text-red-400 mb-4">
          Error loading recipes: {{ error.message }}
        </div>

        <div v-if="!loading && recipes.length === 0" class="text-center text-gray-300">
          You have not added any recipes yet.
        </div>

        <div v-if="recipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="recipe in recipes"
            :key="recipe.id"
            class="bg-white bg-opacity-90 backdrop-blur rounded-xl p-4 shadow-md"
          >
            <Recipe :recipe="recipe" :currentUserId="userId" :simple="true" />
            <div class="mt-4 flex justify-between">
              <button
                @click="goToEdit(recipe.id)"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                @click="handleDelete(recipe.id)"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-background {
  background-image: url('/images/kitchen.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  color: #fff;
  position: relative;
}

.page-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

.page-background > * {
  position: relative;
  z-index: 1;
}
</style>
