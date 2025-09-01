import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body
    if (!email || !password) {
      return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing fields' }))
    }

    const config = useRuntimeConfig()
    const backend = config.public.apiBase || 'https://food-recipe-appp.onrender.com'

    const res = await $fetch(`${backend}/login`, {
      method: 'POST',
      body: { email, password },
      headers: { 'Content-Type': 'application/json' }, // ✅ ensure JSON
    })

    return res
  } catch (err: any) {
    console.error('Login error:', err)
    return sendError(event, createError({ statusCode: 500, statusMessage: err.message || 'Login failed' }))
  }
})
