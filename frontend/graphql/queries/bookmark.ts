import gql from 'graphql-tag'


export const GET_BOOKMARK = gql`
  query GetBookmark($recipeId: uuid!, $userId: uuid!) {
    bookmarks(where: { recipe_id: { _eq: $recipeId }, user_id: { _eq: $userId } }) {
      id
    }
  }
`
