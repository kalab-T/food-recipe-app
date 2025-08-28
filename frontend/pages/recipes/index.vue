<template>
  <div class="page-background flex min-h-screen relative">
    <!-- Sidebar -->
      <aside
             :class="[
              'sidebar transition-all duration-300 ease-in-out',
           isSidebarOpen
            ? 'w-64 p-6 overflow-y-auto bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100'
           : 'w-0 p-0 overflow-hidden'
         ]"
       >


      <div v-if="isSidebarOpen">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">Categories</h2>
          <button @click="toggleSidebar" class="text-sm text-blue-500 hover:underline">✕</button>
        </div>

        <!-- Search Input -->
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search recipes..."
          class="mb-4 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500"
        />

        <!-- Category Checkboxes -->
        <div v-for="category in categories" :key="category.id" class="mb-2">
          <label class="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              :value="category.id"
              v-model="selectedCategories"
              class="accent-yellow-500"
            />
            <span>{{ category.name }}</span>
          </label>
        </div>
      </div>
    </aside>

    <!-- Open Sidebar Button -->
    <button
      v-if="!isSidebarOpen"
      @click="toggleSidebar"
      class="absolute top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      ☰
    </button>

    <!-- Main Content -->
    <main class="flex-1 p-6 overflow-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-white">Browse Recipes</h1>

        <!-- Buttons container -->
        <ClientOnly>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              v-if="isLoggedIn"
              to="/recipes/mine"
              class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded shadow"
            >
              📖 My Recipes
            </NuxtLink>

            <button
              v-if="isLoggedIn"
              @click="goToBookmarks"
              class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow"
            >
              📚 View Bookmarks
            </button>

            <NuxtLink
              v-if="isLoggedIn"
              to="/recipes/add"
              class="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded shadow"
            >
              ➕ Add Recipe
            </NuxtLink>
          </div>
        </ClientOnly>
      </div>

      <div v-if="loading" class="text-center text-gray-200">Loading recipes...</div>
      <div v-else-if="error" class="text-center text-red-400">Error loading recipes.</div>
      <div v-else-if="filteredRecipes.length === 0" class="text-center text-gray-200">
        No recipes found for selected categories and search.
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Recipe
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          :recipe="recipe"
          :currentUserId="currentUserId"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Recipe from '~/components/Recipe.vue'
import { useNuxtApp } from '#app'
import gql from 'graphql-tag'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

type Category = {
  id: string
  name: string
}

type Recipe = {
  id: string
  title: string
  description: string
  image: string
  user?: {
    id: string
    name: string
  }
  recipe_categories: {
    category: Category
  }[]
}

const isSidebarOpen = ref(true)
const selectedCategories = ref<string[]>([])
const searchTerm = ref('')
const searchDebounced = ref('')

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const GET_RECIPES_AND_CATEGORIES = gql`
  query GetRecipesAndCategories($search: String!) {
    recipes(
      where: { title: { _ilike: $search } }
      order_by: { created_at: desc }
    ) {
      id
      title
      description
      image
      user {
        id
        name
      }
      recipe_categories {
        category {
          id
          name
        }
      }
    }
    categories(order_by: { name: asc }) {
      id
      name
    }
  }
`

const { $publicApollo } = useNuxtApp()

const recipes = ref<Recipe[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<Error | null>(null)

onMounted(fetchRecipes)

async function fetchRecipes() {
  loading.value = true
  error.value = null
  try {
    const res = await $publicApollo.query({
      query: GET_RECIPES_AND_CATEGORIES,
      variables: { search: `%${searchDebounced.value}%` },
      fetchPolicy: 'network-only',
    })
    recipes.value = res.data.recipes
    categories.value = res.data.categories
  } catch (err: any) {
    error.value = err
  } finally {
    loading.value = false
  }
}

// debounce search input
let debounceTimeout: number | undefined
watch(searchTerm, (val) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = window.setTimeout(() => {
    searchDebounced.value = val
  }, 300)
})

watch(searchDebounced, () => {
  fetchRecipes()
})

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesSearch =
      searchDebounced.value.trim() === '' ||
      recipe.title.toLowerCase().includes(searchDebounced.value.toLowerCase())

    const matchesCategory =
      selectedCategories.value.length === 0 ||
      recipe.recipe_categories.some((rc) =>
        selectedCategories.value.includes(rc.category.id)
      )

    return matchesSearch && matchesCategory
  })
})

const auth = useAuth()
const isLoggedIn = computed(() => !!auth.user.value)
const currentUserId = computed(() => auth.user.value?.id || null)

const router = useRouter()
function goToBookmarks() {
  router.push('/recipes/bookmarks')
}
</script>

<style scoped>
.page-background {
  background-image: url('/images/recipebackground.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  color: #fff;
  position: relative;
  display: flex;
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

.sidebar {
  height: 100vh;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease-in-out, padding 0.3s ease-in-out;
}

/* Scrollbar styles only apply when sidebar is open (overflow-y: auto) */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
</style>

