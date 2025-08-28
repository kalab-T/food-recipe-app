<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 transition-colors duration-300">
    <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <h1 class="text-2xl font-bold">Profile</h1>

        <!-- Dark Mode Toggle -->
        <client-only>
          <button
            v-if="isMounted"
            @click="toggleDarkMode"
            class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {{ colorMode.value === 'dark' ? 'Light Mode' : 'Dark Mode' }}
          </button>
        </client-only>
      </div>

      <!-- Profile Content -->
      <div class="p-6 flex flex-col items-center space-y-6">
        <img
          :src="user.avatar"
          alt="Profile Picture"
          class="w-32 h-32 rounded-full border-4 border-gray-300 dark:border-gray-600"
        />

        <div class="text-center">
          <h2 class="text-xl font-semibold">{{ user.name }}</h2>
          <p class="text-gray-600 dark:text-gray-400">{{ user.email }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            @click="editProfile"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition"
          >
            Edit Profile
          </button>
          <button
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow transition"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useColorMode } from '#imports' // Nuxt auto-imports composables like this
import { useRouter } from 'vue-router'

// User data (replace with real user store or API)
const user = reactive({
  name: 'John Doe',
  email: 'johndoe@example.com',
  avatar: 'https://via.placeholder.com/150',
})

const router = useRouter()
const colorMode = useColorMode()
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const editProfile = () => {
  alert('Edit profile clicked! (You can open a modal or form here)')
}

const logout = () => {
  // Perform logout logic here
  alert('Logging out...')
  router.push('/') // redirect to home or login
}
</script>

<style scoped>
/* Smooth transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
