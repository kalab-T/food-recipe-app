import { useAuth } from './useAuth'

export const useSignup = () => {
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Send data inside `input` object
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { name, email, password }
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.message || 'Signup failed' }
      }

      if (data.token) setToken(data.token)
      setUser({ id: data.user_id, name: data.name, email: data.email })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' }
    }
  }

  return { signup }
}
