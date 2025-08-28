<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useBookmarks } from '@/composables/useBookmarks'
import Recipe from '@/components/Recipe.vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'
import type { BookmarkWithRecipe } from '@/types' // You can adjust this type to match your schema

const userId = ref<string | null>(null)
const bookmarks = ref<BookmarkWithRecipe[]>([])
const filteredBookmarks = ref<BookmarkWithRecipe[]>([])
const loading = ref(true)
const error = ref<string | Error | null>(null)
const router = useRouter()

let bookmarksComposable: ReturnType<typeof useBookmarks> | null = null

onMounted(() => {
  const userString = localStorage.getItem('user')
  if (!userString) {
    loading.value = false
    error.value = 'You must be logged in to view bookmarks.'
    return
  }

  try {
    const user = JSON.parse(userString)
    userId.value = user.id
  } catch {
    loading.value = false
    error.value = 'Failed to parse user data.'
    return
  }

  bookmarksComposable = useBookmarks(userId)

  watch(
    () => bookmarksComposable?.bookmarks.value,
    (newBookmarks) => {
      if (newBookmarks) bookmarks.value = newBookmarks
    },
    { immediate: true }
  )

  watch(
    () => bookmarksComposable?.loading.value,
    (val) => {
      if (val !== undefined) loading.value = val
    },
    { immediate: true }
  )

  watch(
    () => bookmarksComposable?.error.value,
    (val) => {
      if (val !== undefined) error.value = val
    },
    { immediate: true }
  )
})

watch(
  bookmarks,
  (val) => {
    filteredBookmarks.value = val.filter((b: BookmarkWithRecipe) => b.recipe != null)
  },
  { immediate: true }
)


function refreshBookmarks() {
  bookmarksComposable?.refetch()
}

function goBack() {
  router.push('/recipes')
}
</script>

<template>
  <div class="page-background">
    <section class="py-12 px-4">
      <div class="max-w-6xl mx-auto text-white">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold">Bookmarked Recipes</h1>
          <button
            @click="goBack"
            class="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded"
          >
            ← Back to Recipes
          </button>
        </div>

        <button
          @click="refreshBookmarks"
          class="mb-6 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Refresh Bookmarks
        </button>

        <div v-if="loading">Loading bookmarks...</div>

        <div v-else-if="error" class="text-red-300">
          {{ typeof error === 'string' ? error : error.message }}
        </div>

        <div
          v-else-if="filteredBookmarks.length === 0"
          class="text-gray-200 text-center py-6"
        >
          You haven't bookmarked any recipes yet.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Recipe
            v-for="bookmark in filteredBookmarks"
            :key="bookmark.recipe.id"
            :recipe="bookmark.recipe"
            :currentUserId="userId"
            :simple="true"
          />
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
