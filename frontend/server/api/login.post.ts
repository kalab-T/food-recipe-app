export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  try {
    const res = await $fetch(`${config.public.apiBase}/login`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return res
  } catch (err: any) {
    console.error('Login error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.data?.error || 'Login failed',
    })
  }
})
