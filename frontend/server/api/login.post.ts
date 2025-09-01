export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  if (!backendUrl) {
    console.error('❌ Backend URL not defined in runtime config')
    throw createError({
      statusCode: 500,
      statusMessage: 'Backend URL missing'
    })
  }

  console.log('💡 Login request going to backend URL:', backendUrl)

  try {
    // Forward input exactly like signup
    const res = await $fetch(`${backendUrl}/login`, {
      method: 'POST',
      body: { input: body } // Go backend expects { input: {...} }
    })

    console.log('💡 Login backend response:', res)

    return res
  } catch (error: any) {
    console.error('❌ Login API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed'
    })
  }
})
