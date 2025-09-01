export const useLogin = () => {
  const { setToken, setUser } = useAuth()

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        // Handle different error types
        if (res.status === 500) {
          return { 
            success: false, 
            error: 'Server error. Please try again later.' 
          }
        }
        return { 
          success: false, 
          error: data.message || 'Login failed' 
        }
      }

      if (data.token) setToken(data.token)
      setUser({ 
        id: data.user_id, 
        name: data.name, 
        email: data.email 
      })

      return { success: true }
    } catch (err: any) {
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      }
    }
  }

  return { login }
}
