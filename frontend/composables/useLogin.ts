import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

interface LoginResult {
  success: boolean
  error?: string
}

export const useLogin = () => {
  const { $fetch } = useNuxtApp()
  const { setToken, setUser } = useAuth()

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await $fetch('/api/login', {
        method: 'POST',
        body: { email, password } // plain object
      })

      console.log('Login response:', res)

      if (!res || typeof res !== 'object' || !('user_id' in res) || !('token' in res)) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { user_id, token, name, email: userEmail } = res as {
        user_id: string
        token: string
        name: string
        email: string
      }

      setToken(token)
      setUser({ id: user_id, name, email: userEmail })

      return { success: true }
    } catch (error: any) {
      console.error('Login API error:', error)
      return { success: false, error: error?.message || 'Login failed' }
    }
  }

  return { login }
}
