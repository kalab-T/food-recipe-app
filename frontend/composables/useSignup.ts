import { gql } from '@apollo/client/core'
import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(input: { name: $name, email: $email, password: $password }) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const useSignup = () => {
  const { $publicApollo } = useNuxtApp()
  const { setToken, setUser } = useAuth()

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { data, errors } = await $publicApollo.mutate({
        mutation: SIGNUP_MUTATION,
        variables: { name, email, password },
      })

      console.log('Signup mutation response data:', data)
      if (errors && errors.length > 0) {
        console.error('Signup mutation GraphQL errors:', errors)
        return {
          success: false,
          error: errors.map(e => e.message).join(', '),
        }
      }

      if (data?.signup?.token && data.signup.user) {
        // Save the token in your auth composable
        setToken(data.signup.token)

        // Set the user based on backend response
        setUser({
          id: data.signup.user.id,
          name: data.signup.user.name,
          email: data.signup.user.email,
        })

        return { success: true }
      }

      // If no token or no user, treat as failure
      return { success: false, error: 'Signup failed. Invalid response.' }
    } catch (error: any) {
      console.error('Apollo signup error:', error)
      return {
        success: false,
        error: error.message || 'Signup failed due to server error',
      }
    }
  }

  return { signup }
}
