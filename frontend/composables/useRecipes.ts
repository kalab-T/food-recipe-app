import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

interface SignupResult {
  success: boolean
  error?: string
}

export const useSignup = () => {
  const { $fetch } = useNuxtApp()
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string): Promise<SignupResult> => {
    try {
      const res = await $fetch('/api/signup', {
        method: 'POST',
        body: { input: { name, email, password } },
      })

      console.log('Signup response:', res)

      if (!res || typeof res !== 'object' || !('user_id' in res) || !('token' in res)) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { user_id, token } = res as { user_id: string; token: string }

      setToken(token)
      setUser({ id: user_id, name, email })

      return { success: true }
    } catch (error: any) {
      console.error('Signup API error:', error)
      return { success: false, error: error?.message || 'Signup failed due to server error' }
    }
  }

  return { signup }
}
