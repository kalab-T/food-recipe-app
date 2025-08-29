// composables/useSignup.ts
import { ref } from 'vue'
import { useRouter } from '#imports'

export function useSignup() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const signup = async (name: string, email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const res = await $fetch('/api/signup', {
        method: 'POST',
        body: { name, email, password }
      })

      if (res?.token) {
        // store token in cookie or localStorage
        localStorage.setItem('token', res.token)

        // ✅ Now Hasura will accept authenticated queries
        router.push('/')
      } else {
        error.value = 'Signup failed. No token received.'
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      error.value = err?.data?.message || 'Signup failed.'
    } finally {
      loading.value = false
    }
  }

  return {
    signup,
    loading,
    error
  }
}
