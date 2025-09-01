import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

interface LoginResult {
  success: boolean
  error?: string
}

export const useLogin = () => {
  const nuxt = useNuxtApp()
  const { setToken, setUser } = useAuth()

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      if (!nuxt.$fetch) throw new Error('$fetch not available')

      const res = await nuxt.$fetch('/api/login', {
        method: 'POST',
        body: { email, password } // send plain email/password
      })

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
      setUser({ id: user_id, name, email: userEmail || email })

      return { success: true }
    } catch (error: any) {
      console.error('Login API error:', error)
      return { success: false, error: error?.message || 'Login failed' }
    }
  }

  return { login }
}
