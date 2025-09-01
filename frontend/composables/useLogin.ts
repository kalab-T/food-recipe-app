import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

interface LoginResult {
  success: boolean
  error?: string
}

export const useLogin = () => {
  const nuxt = useNuxtApp()
  const { $fetch } = nuxt
  const { setToken, setUser } = useAuth()

  if (!$fetch) {
    console.error('❌ $fetch is undefined. Nuxt app may not be initialized.')
  }

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      console.log('login called with:', email, password)

      // Send login request to backend
      const res = await $fetch('/api/login', {
        method: 'POST',
        body: { input: { email, password } }, // match backend payload
      })

      console.log('Login response:', res)

      if (!res || typeof res !== 'object' || !('user_id' in res) || !('token' in res)) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { user_id, token, name } = res as { user_id: string; token: string; name: string }

      setToken(token)
      setUser({ id: user_id, name, email })

      return { success: true }
    } catch (error: any) {
      console.error('Login API error:', error)
      return { success: false, error: error?.message || 'Login failed' }
    }
  }

  return { login }
}
