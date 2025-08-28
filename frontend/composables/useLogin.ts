import { gql } from '@apollo/client/core'
import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user_id
      name
      email
    }
  }
`

export const useLogin = () => {
  const login = async (email: string, password: string): Promise<{
    success: boolean
    token?: string
    error?: Error
  }> => {
    const { $publicApollo } = useNuxtApp()
    const { setToken, setUser } = useAuth()

    try {
      const { data } = await $publicApollo.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      })

      if (data?.login?.token) {
        setToken(data.login.token)
        setUser({
          id: data.login.user_id,
          name: data.login.name,
          email: data.login.email,
        })
        return { success: true, token: data.login.token }
      }

      return {
        success: false,
        error: new Error('Login failed'),
      }
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    }
  }

  return { login }
}

