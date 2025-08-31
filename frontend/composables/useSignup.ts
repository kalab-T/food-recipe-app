import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

export const useSignup = () => {
  const { setToken, setUser } = useAuth()
  const { $config } = useNuxtApp()

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Directly call Go backend
      const res: {
        user_id: string
        name?: string
        email?: string
        token: string
      } = await $fetch(`${$config.public.backendUrl}/signup`, {
        method: 'POST',
        body: {
          input: { name, email, password } // Go backend expects this
        }
      })

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
