import { useAuth } from './useAuth'
import { useRuntimeConfig } from '#app'

export const useSignup = () => {
  const { setToken, setUser } = useAuth()
  const config = useRuntimeConfig()

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${config.public.apiBase}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { name, email, password },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message || 'Signup failed' }
      }

      // Save token & user locally
      if (data.token) {
        setToken(data.token)
      }
      setUser({ id: data.user_id, name: data.name, email: data.email })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' }
    }
  }

  return { signup }
}
