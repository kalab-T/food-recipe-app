import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body
  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing fields' }))
  }

  const config = useRuntimeConfig()
  const backend = config.public.apiBase || 'https://food-recipe-appp.onrender.com' // ✅ Render backend URL

  try {
    const res = await $fetch(`${backend}/login`, {
      method: 'POST',
      body: { email, password }, // ✅ flat JSON
    })
    return res
  } catch (err: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: err.message || 'Login failed' }))
  }
})
