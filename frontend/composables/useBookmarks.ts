import { ref, watch, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { GET_BOOKMARKED_RECIPES } from '@/graphql/queries/bookmarkedRecipes'
import { GET_BOOKMARK } from '@/graphql/queries/bookmark'
import { ADD_BOOKMARK, REMOVE_BOOKMARK } from '@/graphql/mutations'
import { useBookmarkChanged } from '@/composables/useEventBus'

// Fetch all bookmarks for a user (used in bookmarks page)
export function useBookmarks(userId: Ref<string | null>) {
  const { bookmarkChanged } = useBookmarkChanged()

  const bookmarks = ref<any[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Setup Apollo query with reactive variables
  const { result, loading: queryLoading, error: queryError, refetch } = useQuery(
    GET_BOOKMARKED_RECIPES,
    () => ({ userId: userId.value! }),
    { enabled: !!userId.value, fetchPolicy: 'network-only' }
  )

  // Refetch bookmarks when event emitted or userId changes
  watch(bookmarkChanged, () => {
    if (userId.value) {
      refetch()
    }
  })

  watch(userId, (newId) => {
    if (newId) {
      refetch()
    } else {
      bookmarks.value = []
    }
  })

  // Sync Apollo query results to local refs
  watchEffect(() => {
    loading.value = queryLoading.value
    error.value = queryError.value
    if (result.value?.bookmarks) {
      bookmarks.value = result.value.bookmarks
    }
  })

  return {
    bookmarks,
    loading,
    error,
    refetch,
  }
}

// Manage bookmark status for a single recipe (used in Recipe.vue)
export function useBookmark(recipeId: string, userId: string | null) {
  const { bookmarkChanged, emit } = useBookmarkChanged()

  const hasBookmarked = ref(false)
  const loading = ref(false)

  const { refetch } = useQuery(
    GET_BOOKMARK,
    () => ({ recipeId, userId: userId! }),
    { enabled: !!userId, fetchPolicy: 'network-only' }
  )

  const { mutate: addBookmark } = useMutation(ADD_BOOKMARK)
  const { mutate: removeBookmark } = useMutation(REMOVE_BOOKMARK)

  async function refetchBookmark() {
    if (!userId) {
      hasBookmarked.value = false
      return
    }
    try {
      const result = await refetch()
      const data = (result as any).data
      hasBookmarked.value = data?.bookmarks?.length > 0
    } catch (err) {
      console.error('Failed to fetch bookmark status:', err)
    }
  }

  async function toggleBookmark() {
    if (!userId) return
    loading.value = true
    try {
      if (hasBookmarked.value) {
        await removeBookmark({ recipe_id: recipeId, user_id: userId })
      } else {
        await addBookmark({ recipe_id: recipeId, user_id: userId })
      }
      await refetchBookmark()
      emit() // notify bookmarks list to refresh
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    } finally {
      loading.value = false
    }
  }

  // Initial check
  refetchBookmark()

  return {
    hasBookmarked,
    toggleBookmark,
    loading,
    refetchBookmark,
  }
}
