export default defineEventHandler(async (event) => {
  // Read frontend form data
  const body = await readBody(event)

  // Get backend URL from runtime config
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  try {
    // Wrap the body inside `input` as expected by Go handler
    const res = await $fetch(`${backendUrl}/signup`, {
      method: "POST",
      body: {
        input: body, // <-- important: wrap frontend form data inside "input"
      },
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
