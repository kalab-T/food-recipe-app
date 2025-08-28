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

// Initialize token and user from localStorage on client
if (process.client) {
  token.value = localStorage.getItem('token')
  user.value = safelyParseUser(localStorage.getItem('user'))
}

/**
 * useAuth composable provides reactive authentication state and helpers.
 */
export const useAuth = () => {
  const isLoggedIn = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
    if (process.client) {
      localStorage.setItem('token', newToken)
    }
  }

  const setUser = (userData: User) => {
    user.value = userData
    if (process.client) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    const { $apolloClient } = useNuxtApp()
    const apolloClient = $apolloClient as ApolloClient<NormalizedCacheObject>
    await apolloClient.resetStore()
  }

  const avatarInitials = computed(() => {
    if (!user.value) return ''
    const name = user.value.name || user.value.email || ''
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase()
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
