export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  try {
    const res = await $fetch(`${backendUrl}/signup`, {
      method: "POST",
      body,
    })
    return res
  } catch (error: any) {
    console.error("Signup API error:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Signup failed",
    })
  }
})
