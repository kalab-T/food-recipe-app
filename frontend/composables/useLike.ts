import { gql } from 'graphql-tag'
import {
  useMutation,
  useQuery,
  useSubscription,
} from '@vue/apollo-composable'
import { ref, watch, watchEffect } from 'vue'

// --- GraphQL Queries & Mutations ---

const INSERT_LIKE = gql`
  mutation InsertLike($recipe_id: uuid!, $user_id: uuid!) {
    insert_likes_one(object: { recipe_id: $recipe_id, user_id: $user_id }) {
      id
    }
  }
`

const DELETE_LIKE = gql`
  mutation DeleteLike($recipe_id: uuid!, $user_id: uuid!) {
    delete_likes(where: { recipe_id: { _eq: $recipe_id }, user_id: { _eq: $user_id } }) {
      affected_rows
    }
  }
`

const CHECK_USER_LIKED = gql`
  query HasUserLiked($recipe_id: uuid!, $user_id: uuid!) {
    likes(where: { recipe_id: { _eq: $recipe_id }, user_id: { _eq: $user_id } }) {
      id
    }
  }
`

const LIKES_COUNT_SUBSCRIPTION = gql`
  subscription LikesCount($recipe_id: uuid!) {
    likes_aggregate(where: { recipe_id: { _eq: $recipe_id } }) {
      aggregate {
        count
      }
    }
  }
`

// --- Main Composable ---

export function useLike(recipeId: string, userId: string | null) {
  const hasLiked = ref(false)
  const loading = ref(false)
  const likesCount = ref(0)

  // 1. ✅ Live subscription to likes count
  const { result: subscriptionResult } = useSubscription(
    LIKES_COUNT_SUBSCRIPTION,
    () => ({ recipe_id: recipeId || '' })
  )

  watchEffect(() => {
    likesCount.value =
      subscriptionResult.value?.likes_aggregate?.aggregate?.count || 0
  })

  // 2. ✅ Query to check if current user has liked the recipe
  const { result: checkLikedResult, refetch: refetchLiked } = useQuery(
    CHECK_USER_LIKED,
    () => ({
      recipe_id: recipeId,
      user_id: userId || '',
    }),
    { enabled: !!userId } // run only if userId is truthy
  )

  watchEffect(() => {
    if (checkLikedResult.value?.likes) {
      hasLiked.value = checkLikedResult.value.likes.length > 0
    }
  })

  // 3. ✅ Mutations to insert/delete likes
  const { mutate: insertLike } = useMutation(INSERT_LIKE)
  const { mutate: deleteLike } = useMutation(DELETE_LIKE)

  // 4. Toggle like status function
  async function toggleLike() {
    if (!userId) {
      alert('Please sign in to like recipes.')
      return
    }

    loading.value = true

    try {
      if (hasLiked.value) {
        // User already liked, so unlike
        await deleteLike({ recipe_id: recipeId, user_id: userId })
        hasLiked.value = false
      } else {
        // User hasn't liked yet, so like
        await insertLike({ recipe_id: recipeId, user_id: userId })
        hasLiked.value = true
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
    } finally {
      loading.value = false
      // Refetch the liked state to keep UI consistent
      await refetchLiked()
    }
  }

  // 5. Provide a manual refetch in case you want to force update outside toggle
  function refetchLikes() {
    refetchLiked()
  }

  return {
    hasLiked,
    toggleLike,
    loading,
    likesCount,
    refetchLikes,
  }
}
