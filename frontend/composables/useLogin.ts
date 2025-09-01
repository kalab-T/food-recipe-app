import { useAuth } from './useAuth'

export const useLogin = () => {
  const { setToken, setUser } = useAuth()

  const login = async (email: string, password: string) => {
    try {
      // Send flat JSON to our serverless API
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // ✅ flat JSON
      })

      const data = await res.json()

      // If the response is not OK, return the error message
      if (!res.ok) {
        return { success: false, error: data.statusMessage || 'Login failed' }
      }

      // Save JWT token if present
      if (data.token) setToken(data.token)

      // Save user info
      setUser({
        id: data.user_id,
        name: data.name,
        email: data.email,
      })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' }
    }
  }

  return { login }
}
