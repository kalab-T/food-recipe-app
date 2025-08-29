import { ref, computed } from 'vue'
import type { ApolloClient } from '@apollo/client/core'
import type { NormalizedCacheObject } from '@apollo/client/cache'
import { useNuxtApp } from '#app'

interface User {
  id: string
  name: string
  email: string
}

const user = ref<User | null>(null)
const token = ref<string | null>(null)

function safelyParseUser(raw: string | null): User | null {
  try {
    if (!raw || raw === 'undefined') return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e)
    return null
  }
}

if (process.client) {
  token.value = localStorage.getItem('token')
  user.value = safelyParseUser(localStorage.getItem('user'))
}

export const useAuth = () => {
  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (process.client) {
      if (newToken) localStorage.setItem('token', newToken)
      else localStorage.removeItem('token')
    }
  }

  const setUser = (userData: User | null) => {
    user.value = userData
    if (process.client) {
      if (userData) localStorage.setItem('user', JSON.stringify(userData))
      else localStorage.removeItem('user')
    }
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    const nuxt = useNuxtApp()
    const apolloClient = (nuxt as any).$apolloClient as ApolloClient<NormalizedCacheObject> | undefined
    if (apolloClient) await apolloClient.resetStore()
  }

  const avatarInitials = computed(() => {
    if (!user.value) return ''
    const name = user.value.name || user.value.email || ''
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
  })

  return {
    token,
    user,
    isLoggedIn,
    setToken,
    setUser,
    logout,
    avatarInitials,
  }
}
