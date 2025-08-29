import { useAuth } from './useAuth'

export const useLogin = () => {
  const { setToken, setUser } = useAuth()

  const login = async (email: string, password: string) => {
    const res = await $fetch('/api/login', {
      method: 'POST',
      body: { email, password }
    })

    if (!res.token) throw new Error('Login failed')

    setToken(res.token)
    setUser({ id: res.user_id, name: res.name, email: res.email })

    return { success: true }
  }

  return { login }
}
