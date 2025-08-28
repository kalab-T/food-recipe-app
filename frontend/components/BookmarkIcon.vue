<template>
    <button
      :aria-pressed="isBookmarked.toString()"
      :disabled="disabled"
      @click="handleClick"
      class="focus:outline-none"
      :title="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
    >
      <svg
        v-if="isBookmarked"
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 24 24"
        stroke="none"
      >
        <path
          d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-gray-400 hover:text-yellow-400 transition-colors duration-200"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 2a2 2 0 0 0-2 2v18l8-5 8 5V4a2 2 0 0 0-2-2H6z"
        />
      </svg>
    </button>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps<{
    isBookmarked: boolean
    disabled?: boolean
  }>()
  
  const emit = defineEmits<{
    (e: 'toggle'): void
  }>()
  
  function handleClick() {
    if (props.disabled) return
    emit('toggle')
  }
  </script>
  