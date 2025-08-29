import { useAuth } from './useAuth'

export const useSignup = () => {
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/signup', { // Backend endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { name, email, password } }),
      })

      const data = await res.json()

      if (!res.ok || !data.token) {
        return { success: false, error: data.message || 'Signup failed' }
      }

      // Store token in localStorage for Apollo middleware
      if (process.client) localStorage.setItem('token', data.token)

      setToken(data.token)
      setUser({ id: data.user_id, name, email })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' }
    }
  }

  return { signup }
}
