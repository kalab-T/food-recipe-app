import { ref } from 'vue'

export function useLogin() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const user = ref<any>(null)

  const login = async (credentials: { email: string; password: string }) => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch('/api/login', {
        method: 'POST',
        body: credentials,
      })
      user.value = res
    } catch (err: any) {
      error.value = err?.data?.message || 'Login failed'
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return { login, loading, error, user }
}
