import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const GET_CATEGORIES = gql`
  query GetCategories {
    categories(order_by: { name: asc }) {
      id
      name
    }
  }
`

export function useCategories() {
  const { result, loading, error, refetch } = useQuery(GET_CATEGORIES)

  return {
    categories: result,
    loading,
    error,
    refetch,
  }
}
