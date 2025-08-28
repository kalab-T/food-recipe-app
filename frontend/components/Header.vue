<template>
  <header class="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center transition-colors duration-300">
    <NuxtLink to="/" class="text-xl font-bold text-gray-900 dark:text-gray-100">🍽️ RecipeApp</NuxtLink>

    <nav class="space-x-4 flex items-center">
      <NuxtLink to="/" class="hover:underline text-gray-700 dark:text-gray-300">Home</NuxtLink>
      <NuxtLink to="/recipes" class="hover:underline text-gray-700 dark:text-gray-300">Recipes</NuxtLink>

      <client-only>
        <template v-if="isLoggedIn">
          <NuxtLink to="/profile" class="ml-4 hover:underline text-gray-700 dark:text-gray-300">Profile</NuxtLink>
          <button @click="handleLogout" class="ml-4 text-red-600 hover:underline">Logout</button>
        </template>

        <template v-else>
          <NuxtLink to="/login" class="ml-4 hover:underline text-gray-700 dark:text-gray-300">Login</NuxtLink>
        </template>
      </client-only>

      <!-- Dark Mode Toggle Button -->
      <client-only>
        <button
          v-if="isMounted"
          @click="toggleDarkMode"
          class="ml-6 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition"
          aria-label="Toggle Dark Mode"
        >
          {{ colorMode.value === 'dark' ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </client-only>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useColorMode } from '#imports'  // Nuxt auto-import for composables

const { user, logout } = useAuth()
const router = useRouter()
const colorMode = useColorMode()

const isLoggedIn = computed(() => !!user.value?.id)
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const handleLogout = () => {
  logout()
  router.push('/')
}

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
/* Add any additional header-specific styling here */
</style>
