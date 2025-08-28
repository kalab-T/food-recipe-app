<template>
  <div class="py-10 px-4">
    <h1 class="text-4xl font-bold mb-6 text-center">Add New Recipe</h1>
    <client-only>
      <RecipeForm />
    </client-only>
  </div>
</template>

<script setup>
import RecipeForm from '@/components/RecipeForm.vue'
</script>
