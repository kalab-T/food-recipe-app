// server/api/login.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  if (!backendUrl) {
    throw createError({ statusCode: 500, statusMessage: 'Backend URL not defined' })
  }

  try {
    // ✅ wrap input just like signup
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body },
    })

    return res
  } catch (error: any) {
    console.error('Login API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed',
    })
  }
})
