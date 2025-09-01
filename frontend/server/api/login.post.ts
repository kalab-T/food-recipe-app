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
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body }, // ✅ wrap input for Go backend
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
