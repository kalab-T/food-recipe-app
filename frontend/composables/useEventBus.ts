// composables/useEventBus.ts
import { ref } from 'vue'

const bookmarkChanged = ref(false)

export function useBookmarkChanged() {
  function emit() {
    bookmarkChanged.value = !bookmarkChanged.value // toggle to trigger watchers
  }
  return { bookmarkChanged, emit }
}
