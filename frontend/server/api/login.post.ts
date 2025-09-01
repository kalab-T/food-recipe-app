export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const res = await $fetch('/api/login', {
      method: 'POST',
      body: { input: body } // wrap input like signup
    })

    return res
  } catch (error: any) {
    console.error('Login API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed'
    })
  }
})
