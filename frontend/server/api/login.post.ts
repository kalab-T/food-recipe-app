import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing email or password' })
  }

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  try {
    // Send login payload directly
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body, // send top-level { email, password }
    })

    return res
  } catch (error: any) {
    console.error('Login API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Login failed',
    })
  }
})
