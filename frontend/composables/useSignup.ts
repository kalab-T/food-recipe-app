import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

interface SignupResult {
  success: boolean
  error?: string
}

interface SignupInput {
  name: string
  email: string
  password: string
}

export const useSignup = () => {
  const { $fetch } = useNuxtApp()
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string): Promise<SignupResult> => {
    try {
      const res = await $fetch('/api/signup', {
        method: 'POST',
        body: { input: { name, email, password } } // forward as { input: ... }
      })

      console.log('Signup response:', res)

      // Check if response has user_id and token
      if (!res || typeof res !== 'object' || !('user_id' in res) || !('token' in res)) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { user_id, token } = res as { user_id: string; token: string }

      // Save the token in auth composable
      setToken(token)

      // Save user locally using input values (backend no longer returns name/email)
      setUser({
        id: user_id,
        name,
        email
      })

      return { success: true }
    } catch (error: any) {
      console.error('Signup API error:', error)
      return { success: false, error: error?.message || 'Signup failed due to server error' }
    }
  }

  return { signup }
}
