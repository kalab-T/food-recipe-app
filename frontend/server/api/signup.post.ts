export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Replace this with your Render backend URL
  const backendUrl = "https://food-recipe-appp.onrender.com/signup"

  const res = await $fetch(backendUrl, {
    method: "POST",
    body: body,
  })

  return res
})
