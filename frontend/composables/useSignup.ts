import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

export const useSignup = () => {
  const { setToken, setUser } = useAuth()
  const { $config } = useNuxtApp()

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await $fetch(`${$config.public.backendUrl}/signup`, {
        method: 'POST',
        body: {
          input: { name, email, password } // Go backend expects this
        }
      })

      // backend returns { user_id, name, email, token }
      if (res?.token) {
        setToken(res.token)
        setUser({
          id: res.user_id,
          name: name,   // store locally from input
          email: email, // store locally from input
        })
        return { success: true }
      }

      return { success: false, error: 'Signup failed. Invalid response.' }
    } catch (err: any) {
      console.error('Signup error:', err)
      return { success: false, error: err.message || 'Server error' }
    }
  }

  return { signup }
}
