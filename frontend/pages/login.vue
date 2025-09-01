<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form @submit.prevent="submitForm" class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Email</label>
        <input v-model="email" type="email" class="w-full px-4 py-2 border rounded" required />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Password</label>
        <input v-model="password" type="password" class="w-full px-4 py-2 border rounded" required />
      </div>

      <div v-if="errorMessage" class="text-red-500 mb-4 text-sm text-center">
        {{ errorMessage }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '~/composables/useLogin'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const { login } = useLogin()

const submitForm = async () => {
  loading.value = true
  errorMessage.value = ''

  const result = await login(email.value, password.value)

  loading.value = false

  if (!result.success) {
    // error is already a string in useLogin.ts
    errorMessage.value = result.error || 'Invalid credentials. Please try again.'
    return
  }

  router.push('/')
}
</script>
