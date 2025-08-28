import { gql } from 'graphql-tag'

export const GET_RECIPE_BY_ID = gql`
  query GetRecipeById($id: uuid!) {
    recipes_by_pk(id: $id) {
      id
      title
      image
      description

      ingredients {
        name
        quantity
      }

      steps(order_by: { order: asc }) {
        id
        description
        order
      }

      recipe_categories {
        category {
          id
          name
        }
      }
    }
  }
`
