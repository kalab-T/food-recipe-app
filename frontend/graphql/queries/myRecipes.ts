// graphql/queries/myRecipes.ts
import gql from 'graphql-tag'

export const GET_MY_RECIPES = gql`
  query GetMyRecipes($userId: uuid!) {
    recipes(where: { user_id: { _eq: $userId } }) {
      id
      title
      description
      image
      user {
        name
      }
    }
  }
`
