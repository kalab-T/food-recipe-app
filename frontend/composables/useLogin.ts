import { useAuth } from './useAuth'

export const useLogin = () => {
  const { setToken, setUser } = useAuth()

  const login = async (email: string, password: string) => {
    try {
      // ✅ Send wrapped JSON as { input: { email, password } } to match login.post.ts
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { email, password } }),
      })

      const data = await res.json()

      // Handle non-OK responses
      if (!res.ok) {
        return { success: false, error: data.statusMessage || data.message || 'Login failed' }
      }

      // Save JWT token if present
      if (data.token) setToken(data.token)

      // Save user info if present
      setUser({
        id: data.user_id,
        name: data.name || '',
        email: data.email || email, // fallback if name/email missing from backend
      })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' }
    }
  }

  return { login }
}
