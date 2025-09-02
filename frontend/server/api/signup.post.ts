export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { name: string; email: string; password: string }

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  try {
    const res = await $fetch(`${backendUrl}/signup`, {
      method: 'POST',
      body: { input: body }, // matches Go backend expectation
    })

    return res
  } catch (error: any) {
    console.error('Signup API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Signup failed',
    })
  }
})
