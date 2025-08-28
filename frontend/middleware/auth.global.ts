import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '@/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const publicPages = new Set(['/', '/login', '/signup', '/recipes'])

  const normalizedPath = to.path === '/' ? '/' : to.path.replace(/\/$/, '')

  if (publicPages.has(normalizedPath)) {
    return
  }

  const auth = useAuth()

  if (process.client) {
    const token = auth.token.value

    // Check for token existence and basic expiration (optional enhancement)
    const isValidJwt = (token: string | null) => {
      if (!token) return false
      try {
        const [, payloadBase64] = token.split('.')
        const payload = JSON.parse(atob(payloadBase64))
        const now = Math.floor(Date.now() / 1000)
        return payload.exp && payload.exp > now
      } catch {
        return false
      }
    }

    if (!isValidJwt(token)) {
      localStorage.removeItem('token')
      return navigateTo('/login')
    }
  }
})
