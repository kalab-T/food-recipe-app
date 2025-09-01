import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const backendUrl = config.backendUrl // server-side only

  try {
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body }, // wrap input like Go backend expects
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
