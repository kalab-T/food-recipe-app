// server/api/login.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  // 1️⃣ Read request body
  const body = await readBody(event)

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  try {
    // 2️⃣ Forward request to Go backend
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body }, // ✅ wrap input just like signup
    })

    // 3️⃣ Return backend response directly
    return res
  } catch (error: any) {
    console.error('Login API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed',
    })
  }
})
