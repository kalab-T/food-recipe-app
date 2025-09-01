// ~/server/api/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  try {
    // forward input as { input: ... } just like signup
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body.input }
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
