import { useAuth } from './useAuth'

export const useSignup = () => {
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string) => {
    const res = await $fetch('/api/signup', {
      method: 'POST',
      body: { name, email, password }
    })

    if (!res.token) throw new Error('Signup failed')

    setToken(res.token)
    setUser({ id: res.user_id, name, email })

    return { success: true }
  }

  return { signup }
}
