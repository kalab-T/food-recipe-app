export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  if (!backendUrl) {
    throw createError({ statusCode: 500, statusMessage: 'Backend URL not configured' })
  }

  try {
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body }, // forward as { input: ... } to match Go
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
