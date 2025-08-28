<template>
    <div>
      <button
        @click="shareNative"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Share Recipe
      </button>
  
      <div v-if="!canShare" class="mt-2 flex space-x-4 text-sm">
        <a
          :href="telegramUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500 underline"
          >Telegram</a
        >
        <a
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-green-500 underline"
          >WhatsApp</a
        >
        <a
          :href="emailUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-red-500 underline"
          >Email</a
        >
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, computed, onMounted } from 'vue'  // <-- added onMounted
  import { useRouter } from 'vue-router'
  
  // Props to receive recipe info
  interface Props {
    id: string
    title: string
  }
  
  const props = defineProps<Props>()
  
  const canShare = ref(false)
  
  onMounted(() => {
    canShare.value = !!navigator.share
  })
  
  const shareNative = async () => {
    if (!canShare.value) return
    try {
      await navigator.share({
        title: props.title,
        text: `Check out this recipe: ${props.title}`,
        url: window.location.origin + `/recipes/${props.id}`,
      })
      alert('Recipe shared successfully!')
    } catch (err) {
      alert('Sharing failed or was cancelled.')
    }
  }
  
  const encodedUrl = computed(() =>
    encodeURIComponent(window.location.origin + `/recipes/${props.id}`)
  )
  const encodedText = computed(() =>
    encodeURIComponent(`Check out this recipe: ${props.title}`)
  )
  
  const telegramUrl = computed(
    () => `https://t.me/share/url?url=${encodedUrl.value}&text=${encodedText.value}`
  )
  const whatsappUrl = computed(
    () => `https://api.whatsapp.com/send?text=${encodedText.value}%20${encodedUrl.value}`
  )
  const emailUrl = computed(
    () =>
      `mailto:?subject=Recipe: ${encodeURIComponent(
        props.title
      )}&body=${encodedText.value}%20${encodedUrl.value}`
  )
  </script>
  
  <style scoped>
  button {
    cursor: pointer;
  }
  </style>
  