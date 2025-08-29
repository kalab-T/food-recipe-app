import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password } = body
  if (!name || !email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing fields' }))
  }

  const config = useRuntimeConfig()
  const backend = config.public.apiBase || 'http://localhost:8080'

  try {
    const res = await $fetch(`${backend}/signup`, {
      method: 'POST',
      body: { input: { name, email, password } },
    })
    return res
  } catch (err: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: err.message || 'Signup failed' }))
  }
})
