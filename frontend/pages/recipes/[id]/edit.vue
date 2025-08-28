<template>
  <div class="py-10 px-4">
    <h1 class="text-4xl font-bold mb-6 text-center">Edit Recipe</h1>

    <RecipeForm
      v-if="recipe"
      :initial-data="recipe"
      :is-edit="true"
      :id="id"
    />

    <p v-else-if="loading" class="text-center">Loading...</p>
    <p v-else-if="error" class="text-red-600 text-center">
      Failed to load recipe: {{ error.message }}
    </p>
  </div>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { GET_RECIPE_BY_ID } from '@/graphql/queries/recipeById'
import RecipeForm from '@/components/RecipeForm.vue'

const route = useRoute()
const id = route.params.id
console.log("🆔 Route param ID:", id)

const { result, loading, error } = useQuery(GET_RECIPE_BY_ID, { id })

const recipe = computed(() => result.value?.recipes_by_pk || null)

watchEffect(() => {
  if (loading.value) {
    console.log("⏳ Loading recipe...")
  }
  if (error.value) {
    console.error("❌ Error loading recipe:", error.value.message)
  }
  if (result.value?.recipes_by_pk) {
    console.log("✅ Recipe loaded in edit page:", result.value.recipes_by_pk)
  } else {
    console.warn("⚠️ No recipe found in edit page for id:", id)
  }
})
</script>
