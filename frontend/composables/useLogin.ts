import { useAuth } from './useAuth'
import { useRuntimeConfig } from '#app'

export const useLogin = () => {
  const { setToken, setUser } = useAuth()
  const config = useRuntimeConfig()

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${config.public.apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { email, password },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message || 'Login failed' }
      }

      // Save token & user locally
      if (data.token) setToken(data.token)
      setUser({ id: data.user_id, name: data.name, email: data.email })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' }
    }
  }

  return { login }
}
