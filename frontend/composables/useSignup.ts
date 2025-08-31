import { gql } from '@apollo/client/core'
import { useAuth } from './useAuth'
import { useNuxtApp } from '#app'

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(input: { name: $name, email: $email, password: $password }) {
      token
      user_id
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

      if (data?.signup?.token && data.signup.user_id) {
        // Save the token in your auth composable
        setToken(data.signup.token)

        // Store user locally using input data (backend does not return name/email)
        setUser({
          id: data.signup.user_id,
          name,
          email,
        })

        return { success: true }
      }

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
