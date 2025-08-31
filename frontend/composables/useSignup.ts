import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

export const useSignup = () => {
  const { $fetch } = useNuxtApp()
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await $fetch('/api/signup', {
        method: 'POST',
        body: { input: { name, email, password } },
      })

      console.log('Signup response:', res)

      if (!res || !res.user_id || !res.token) {
        return { success: false, error: 'Signup failed. Invalid server response.' }
      }

      // Save token and user info locally
      setToken(res.token)
      setUser({
        id: res.user_id,
        name,
        email,
      })

      return { success: true }
    } catch (err: any) {
      console.error('Signup API error:', err)
      return { success: false, error: err.message || 'Server error' }
    }
  }

  return { signup }
}
