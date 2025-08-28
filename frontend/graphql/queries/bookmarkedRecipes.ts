// graphql/queries/bookmarkedRecipes.ts
import gql from 'graphql-tag'

export const GET_BOOKMARKED_RECIPES = gql`
  query GetBookmarkedRecipes($userId: uuid!) {
    bookmarks(where: { user_id: { _eq: $userId } }) {
      id
      recipe {
        id
        title
        image
        created_at
        user {
          id
          name
        }
        likes_aggregate {
          aggregate {
            count
          }
        }
        bookmarks_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`
