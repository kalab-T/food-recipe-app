<template>
  <form @submit.prevent="onSubmit" class="max-w-3xl mx-auto p-6 bg-white rounded shadow space-y-6">
    <h2 class="text-2xl font-bold mb-4">
      {{ isEdit ? 'Edit Recipe' : 'Add New Recipe' }}
    </h2>

    <!-- Title -->
    <div>
      <label for="title" class="block font-semibold mb-1">Title</label>
      <input id="title" v-model="form.title" type="text" required class="input w-full" />
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block font-semibold mb-1">Description</label>
      <textarea id="description" v-model="form.description" required class="input w-full min-h-[100px]"></textarea>
    </div>

    <!-- Categories -->
    <div>
      <p class="font-semibold mb-2">Categories</p>
      <div class="flex flex-wrap gap-4">
        <label v-for="category in categories" :key="category.id" class="inline-flex items-center space-x-2">
          <input type="checkbox" :value="category.id" v-model="selectedCategoryIds" class="checkbox" />
          <span>{{ category.name }}</span>
        </label>
      </div>
    </div>

    <!-- Ingredients -->
    <div>
      <p class="font-semibold mb-2">Ingredients</p>
      <div v-for="(ingredient, index) in form.ingredients" :key="index" class="flex gap-3 items-center mb-2">
        <input v-model="ingredient.name" type="text" placeholder="Name" required class="input flex-1" />
        <input v-model="ingredient.quantity" type="text" placeholder="Quantity" required class="input flex-1" />
        <button type="button" @click="removeIngredient(index)" class="btn-danger px-3 py-1">Remove</button>
      </div>
      <button type="button" @click="addIngredient" class="btn-secondary px-4 py-2">Add Ingredient</button>
    </div>

    <!-- Steps -->
    <div>
      <p class="font-semibold mb-2">Steps</p>
      <div v-for="(step, index) in form.steps" :key="index" class="flex items-center gap-3 mb-2">
        <textarea v-model="step.description" placeholder="Step description" required class="input flex-1 min-h-[60px]"></textarea>
        <button type="button" @click="removeStep(index)" class="btn-danger px-3 py-1">Remove</button>
      </div>
      <button type="button" @click="addStep" class="btn-secondary px-4 py-2">Add Step</button>
    </div>

    <!-- Image Upload -->
    <div>
      <label class="block font-semibold mb-2">Upload Image</label>
      <input type="file" @change="onFileChange" accept="image/*" />
      <div v-if="previewUrl" class="mt-3">
        <img :src="previewUrl" alt="Preview" class="max-h-48 rounded shadow" />
      </div>
    </div>

    <!-- Submit Button -->
    <div>
      <button type="submit" :disabled="loading" class="btn-primary px-6 py-3 w-full">
        {{ loading ? 'Submitting...' : isEdit ? 'Update Recipe' : 'Add Recipe' }}
      </button>
    </div>

    <!-- Messages -->
    <p v-if="success" class="text-green-600 mt-4 font-semibold">
      {{ isEdit ? 'Recipe updated successfully!' : 'Recipe added successfully!' }}
    </p>
    <p v-if="error?.message" class="text-red-600 mt-4 font-semibold">
      {{ isEdit ? 'Error updating recipe:' : 'Error adding recipe:' }} {{ error.message }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineProps } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '@/composables/useAuth'
import { ADD_FULL_RECIPE, UPDATE_RECIPE } from '@/graphql/mutations'
import gql from 'graphql-tag'
import type { ApolloError } from '@apollo/client/errors'

const props = defineProps<{
  isEdit?: boolean
  id?: string
  initialData?: {
    title: string
    description: string
    image?: string | null
    category_id?: string[]
    ingredients?: { name: string; quantity: string }[]
    steps?: { description: string }[]
  }
}>()

const config = useRuntimeConfig()
const auth = useAuth()

const form = ref({
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  ingredients: props.initialData?.ingredients?.length ? [...props.initialData.ingredients] : [{ name: '', quantity: '' }],
  steps: props.initialData?.steps?.length ? [...props.initialData.steps] : [{ description: '' }],
})

const selectedCategoryIds = ref<string[]>(props.initialData?.category_id || [])
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(props.initialData?.image || null)

const success = ref(false)
const error = ref<ApolloError | null>(null)

const categories = ref<{ id: string; name: string }[]>([])
const { result: categoryResult } = useQuery(gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`)

watch(categoryResult, (newVal) => {
  if (newVal?.categories) {
    categories.value = newVal.categories
  }
})

function addIngredient() {
  form.value.ingredients.push({ name: '', quantity: '' })
}
function removeIngredient(index: number) {
  form.value.ingredients.splice(index, 1)
}
function addStep() {
  form.value.steps.push({ description: '' })
}
function removeStep(index: number) {
  form.value.steps.splice(index, 1)
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${config.public.apiBase}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error('Image upload failed: ' + response.status)

  const data = await response.json()
  return config.public.apiBase + data.url
}

const { mutate: addRecipe, loading: addLoading } = useMutation(ADD_FULL_RECIPE)
const { mutate: updateRecipe, loading: updateLoading } = useMutation(UPDATE_RECIPE)
const loading = computed(() => addLoading.value || updateLoading.value)

async function onSubmit() {
  success.value = false
  error.value = null

  if (!auth.user.value?.id) {
    alert('You must be logged in.')
    return
  }

  let imageUrl = previewUrl.value || ''
  if (selectedFile.value) {
    try {
      imageUrl = await uploadImage(selectedFile.value)
    } catch (err: any) {
      alert('Image upload failed: ' + err.message)
      return
    }
  }

  const recipeId = props.id ?? ''
  const ingredientObjs = form.value.ingredients.map(({ name, quantity }) => ({ name, quantity, recipe_id: recipeId }))
  const stepObjs = form.value.steps.map(({ description }, i) => ({ description, step_number: i + 1, recipe_id: recipeId }))
  const categoryObjs = selectedCategoryIds.value.map((id) => ({ category_id: id, recipe_id: recipeId }))

  try {
    if (props.isEdit) {
      await updateRecipe({
        id: recipeId,
        title: form.value.title,
        description: form.value.description,
        image: imageUrl,
        ingredients: ingredientObjs,
        steps: stepObjs,
        recipe_categories: categoryObjs,
      })
    } else {
      await addRecipe({
        title: form.value.title,
        description: form.value.description,
        image: imageUrl,
        ingredients: form.value.ingredients,
        steps: form.value.steps.map((s, i) => ({ description: s.description, step_number: i + 1 })),
        recipe_categories: selectedCategoryIds.value.map((catId) => ({ category_id: catId })),
      })

      form.value = {
        title: '',
        description: '',
        ingredients: [{ name: '', quantity: '' }],
        steps: [{ description: '' }],
      }
      selectedCategoryIds.value = []
      selectedFile.value = null
      previewUrl.value = null
    }

    success.value = true
  } catch (err: any) {
    error.value = err
    console.error('Mutation error:', err)
  }
}
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 0.375rem;
}
.btn-primary {
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  border-radius: 0.375rem;
}
.btn-primary:disabled {
  background-color: #93c5fd;
}
.btn-secondary {
  background-color: #d1d5db;
  color: #374151;
  font-weight: 600;
  border-radius: 0.375rem;
}
.btn-danger {
  background-color: #ef4444;
  color: white;
  font-weight: 600;
  border-radius: 0.375rem;
}
</style>
