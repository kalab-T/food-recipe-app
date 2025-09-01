// server/api/login.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  console.log('🔹 login.post.ts backendUrl:', backendUrl)
  console.log('🔹 login.post.ts payload:', body)

  try {
    // Forward request to Go backend
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body }, // wrap input for Go backend
    })

    console.log('🔹 login.post.ts backend response:', res)

    return res
  } catch (error: any) {
    console.error('Login API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed',
    })
  }
})
