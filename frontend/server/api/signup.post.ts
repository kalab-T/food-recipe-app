import { defineEventHandler, readBody, createError, sendError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('📥 Received body:', body)

  const { name, email, password } = body

  if (!name || !email || !password) {
    console.error('⚠️ Missing fields:', { name, email, password })
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: 'Missing fields' })
    )
  }

  try {
    console.log('📡 Sending to Go backend...')

    // Send raw password to backend; Go will hash it
    const response = await $fetch('http://localhost:8080/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        name,
        email,
        password,  // <-- raw password here, no hashing
      }
    })

    console.log('✅ Response from Go backend:', response)
    return response
  } catch (error: any) {
    console.error('💥 Backend error:', error)
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: error.message })
    )
  }
})
