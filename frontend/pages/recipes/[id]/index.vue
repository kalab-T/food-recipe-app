<template>
  <div
    class="min-h-screen bg-cover bg-center bg-fixed py-12"
    style="background-image: url('/images/recipe-detail.jpg')"
  >
    <div class="container mx-auto px-4">

      <!-- Back to Recipes Button -->
      <button
        @click="goBack"
        class="mb-6 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded shadow"
      >
        ← Back to Recipes
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="text-center text-white text-lg">Loading recipe...</div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-300 text-lg">
        Error loading recipe: {{ error.message }}
      </div>

      <!-- Loaded Recipe -->
      <div
        v-else-if="recipe"
        class="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-4xl mx-auto"
      >
        <img
          :src="recipe.image"
          alt="Recipe Image"
          class="w-full h-72 object-cover rounded-xl mb-6"
        />

        <h1 class="text-4xl font-bold mb-2 text-gray-800 flex items-center justify-between gap-4">
          <span>{{ recipe.title }}</span>

          <div class="flex items-center gap-4">
            <!-- Bookmark icon component -->
            <BookmarkIcon
              :isBookmarked="hasBookmarked"
              :disabled="loadingToggle"
              @toggle="toggleBookmark"
              class="cursor-pointer"
            />

            <!-- Share button -->
            <ShareRecipe :id="recipe.id" :title="recipe.title" />
          </div>
        </h1>

        <p class="text-gray-600 italic mb-4 text-lg">
          by {{ recipe.user?.name || "Anonymous" }}
        </p>

        <!-- Edit & Delete Buttons (Only if owner) -->
        <div v-if="canEdit" class="flex gap-3 mb-6">
          <button
            @click="goToEdit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            ✏️ Edit Recipe
          </button>
          <button
            @click="handleDelete"
            class="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            🗑️ Delete Recipe
          </button>
        </div>

        <!-- Ingredients -->
        <div class="mb-6">
          <h2 class="text-2xl font-semibold mb-2 text-gray-800">Ingredients</h2>
          <div v-if="recipe.ingredients?.length">
            <ul class="list-disc list-inside space-y-1 text-gray-700">
              <li v-for="ing in recipe.ingredients" :key="ing.id">
                {{ ing.quantity }} - {{ ing.name }}
              </li>
            </ul>
          </div>
          <div v-else class="text-gray-500 italic">No ingredients listed.</div>
        </div>

        <!-- Steps -->
        <div>
          <h2 class="text-2xl font-semibold mb-2 text-gray-800">Steps</h2>
          <div v-if="recipe.steps?.length">
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li v-for="step in recipe.steps" :key="step.id">
                {{ step.description }}
              </li>
            </ol>
          </div>
          <div v-else class="text-gray-500 italic">No steps added.</div>
        </div>
      </div>

      <!-- No Recipe Fallback -->
      <div v-else class="text-center text-white">No recipe found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ref, watchEffect, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { DELETE_RECIPE } from '../../../graphql/mutations'
import BookmarkIcon from '@/components/BookmarkIcon.vue'
import { useBookmark } from '@/composables/useBookmarks'
import ShareRecipe from '@/components/ShareRecipe.vue'  // <-- Import here

interface Recipe {
  id: string
  title: string
  description: string
  image: string
  user_id: string
  user?: { id: string; name: string }
  ingredients?: { id: string; name: string; quantity: string }[]
  steps?: { id: string; description: string }[]
}

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const id = route.params.id as string

const GET_RECIPE_BY_ID = gql`
  query GetRecipeById($id: uuid!) {
    recipes_by_pk(id: $id) {
      id
      title
      description
      image
      user {
        id
        name
      }
      user_id
      ingredients { id name quantity }
      steps { id description }
    }
  }
`

const { result, loading, error } = useQuery(GET_RECIPE_BY_ID, { id })
const recipe = ref<Recipe | null>(null)

watchEffect(() => {
  if (error.value) {
    console.error('🚨 GraphQL error:', error.value)
  }
  if (result.value?.recipes_by_pk) {
    recipe.value = result.value.recipes_by_pk
  } else {
    recipe.value = null
  }
})

// Ownership check
const canEdit = computed(() => {
  return auth.user.value?.id === recipe.value?.user_id
})

// Navigate to edit page
function goToEdit() {
  if (!recipe.value) return
  router.push(`/recipes/${recipe.value.id}/edit`)
}

// Navigate back to recipes list page
function goBack() {
  router.push('/recipes')
}

// Delete logic with TS fix
const { mutate: deleteRecipe } = useMutation(DELETE_RECIPE)

const handleDelete = async () => {
  const confirmed = confirm('Are you sure you want to delete this recipe?')
  if (!confirmed || !recipe.value) return

  try {
    const result = await deleteRecipe({ id: recipe.value.id })

    if (result?.data?.delete_recipes_by_pk?.id) {
      alert('Recipe deleted successfully.')
      router.push('/recipes')
    } else {
      alert('Failed to delete the recipe.')
    }
  } catch (err) {
    console.error('❌ Delete failed:', err)
    alert('Something went wrong.')
  }
}

// Bookmark toggle composable
const userId = auth.user.value?.id || null

const {
  hasBookmarked,
  toggleBookmark,
  loading: loadingToggle,
  refetchBookmark,
} = useBookmark(id, userId)
</script>
