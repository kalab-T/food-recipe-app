import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'  // ✅ only this

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body
  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing fields' }))
  }

  const config = useRuntimeConfig()
  const backend = config.public.backendUrl
  if (!backend) {
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Backend URL not configured' }))
  }

  try {
    const res = await $fetch(`${backend}/login`, {
      method: 'POST',
      body: { input: { email, password } },
    })
    return res
  } catch (err: any) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: err.message || 'Login failed' })
    )
  }
})
