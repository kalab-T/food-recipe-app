<template>
  <div class="bg-white rounded-xl overflow-hidden shadow-md relative group">
    <!-- Bookmark icon top-right (only for signed-in users) -->
    <div
      v-if="!simple && currentUserId"
      class="absolute top-2 right-2 z-10 text-xl cursor-pointer text-yellow-500 hover:text-yellow-600"
      @click="toggleBookmark"
      :title="hasBookmarked ? 'Remove Bookmark' : 'Add Bookmark'"
    >
      <span v-if="hasBookmarked">🔖</span>
      <span v-else>📑</span>
    </div>

    <!-- Clickable image -->
    <router-link
      :to="`/recipes/${recipe.id}`"
      class="block overflow-hidden rounded-t-xl transition-transform duration-300 ease-in-out group-hover:scale-105"
      aria-label="View recipe details"
    >
      <img
        :src="recipe.image"
        :alt="recipe.title"
        class="w-full h-48 object-cover"
      />
    </router-link>

    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-800 truncate">{{ recipe.title }}</h3>
      <p class="text-sm text-gray-600 line-clamp-2">{{ recipe.description }}</p>

      <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>By {{ recipe.user?.name || 'Unknown' }}</span>

        <!-- Like count or like button -->
        <div v-if="!simple && currentUserId" class="flex items-center space-x-1 text-red-500">
          <button
            @click="toggleLike"
            :disabled="loading"
            class="flex items-center space-x-1 hover:text-red-600 focus:outline-none"
          >
            <span v-if="hasLiked">❤️</span>
            <span v-else>🤍</span>
            <span>{{ likesCount }}</span>
          </button>
        </div>
        <div v-else class="text-red-400">
          ❤️ {{ likesCount }}
        </div>
      </div>
    </div>

    <div
      class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 px-3 py-1 rounded cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      <router-link :to="`/recipes/${recipe.id}`">View Detail</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useLike } from '@/composables/useLike'
import { useBookmark } from '@/composables/useBookmarks'

const props = defineProps<{
  recipe: {
    id: string
    title: string
    description: string
    image: string
    user?: {
      name?: string
    }
  }
  currentUserId: string | null
  simple?: boolean
}>()

const {
  hasLiked,
  toggleLike,
  loading,
  likesCount,
  refetchLikes
} = useLike(props.recipe.id, props.currentUserId)

const {
  hasBookmarked,
  toggleBookmark,
  loading: bookmarkLoading,
  refetchBookmark
} = useBookmark(props.recipe.id, props.currentUserId)

watch(() => props.recipe.id, () => {
  refetchLikes()
  refetchBookmark()
})
</script>
