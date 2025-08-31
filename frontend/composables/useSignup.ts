import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

export const useSignup = () => {
  const { $fetch } = useNuxtApp()
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Call Nuxt API route /api/signup, which proxies to Go backend
      const res = await $fetch('/api/signup', {
        method: 'POST',
        body: {
          input: { name, email, password }
        }
      })

      console.log('Signup response:', res)

      if (!res || !res.user_id || !res.token) {
        return {
          success: false,
          error: 'Signup failed. Invalid response from server.'
        }
      }

      // Save the token in auth composable
      setToken(res.token)

      // Save user locally using input values (backend no longer returns name/email)
      setUser({
        id: res.user_id,
        name,
        email
      })

      return { success: true }
    } catch (error: any) {
      console.error('Signup API error:', error)
      return {
        success: false,
        error: error.message || 'Signup failed due to server error'
      }
    }
  }

  return { signup }
}
