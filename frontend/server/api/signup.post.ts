import { defineEventHandler, readBody, createError, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password } = body

  if (!name || !email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing fields' }))
  }

  try {
    const response = await $fetch('http://localhost:8080/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name, email, password }
    })

    return response
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.message }))
  }
})
