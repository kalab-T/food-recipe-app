// server/api/login.post.ts
import { defineEventHandler, readBody, createError, sendError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    // 1️⃣ Read request body
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      return sendError(
        event,
        createError({ statusCode: 400, statusMessage: 'Missing email or password' })
      )
    }

    // 2️⃣ Get backend URL from runtime config
    const config = useRuntimeConfig()
    const backend = config.public.backendUrl
    if (!backend) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: 'Backend URL not configured' })
      )
    }

    console.log('Sending login request to backend:', backend, { email })

    // 3️⃣ Send POST request to backend
    const res = await $fetch(`${backend}/login`, {
      method: 'POST',
      body: { input: { email, password } }, // Hasura action expects input object
      headers: { 'Content-Type': 'application/json' },
    })

    console.log('Backend response:', res)

    // 4️⃣ Check if response contains token
    if (!res || !res.token) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: 'Invalid response from backend' })
      )
    }

    // 5️⃣ Return successful login response
    return {
      token: res.token,
      user_id: res.user_id,
      name: res.name,
      email: res.email,
    }
  } catch (err: any) {
    console.error('Login failed:', err)

    // If error is from backend fetch, include the message
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: err.message || 'Login failed' })
    )
  }
})
