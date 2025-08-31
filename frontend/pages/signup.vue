<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <Form
      v-if="schema"
      :validation-schema="schema"
      v-slot="{ handleSubmit }"
      class="bg-white p-8 rounded shadow-md w-full max-w-md"
    >
      <form @submit.prevent="submitHandler(handleSubmit)">
        <h2 class="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Name</label>
          <Field name="name" type="text" class="w-full px-4 py-2 border rounded" />
          <ErrorMessage name="name" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <Field name="email" type="email" class="w-full px-4 py-2 border rounded" />
          <ErrorMessage name="email" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Password</label>
          <Field name="password" type="password" class="w-full px-4 py-2 border rounded" />
          <ErrorMessage name="password" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-1">Confirm Password</label>
          <Field name="confirmPassword" type="password" class="w-full px-4 py-2 border rounded" />
          <ErrorMessage name="confirmPassword" class="text-red-500 text-sm mt-1 block" />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {{ isSubmitting ? 'Signing up...' : 'Sign Up' }}
        </button>

        <p v-if="signupError" class="text-red-600 mt-4 text-center">{{ signupError }}</p>
      </form>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSignup } from '~/composables/useSignup'

const router = useRouter()
const isSubmitting = ref(false)
const signupError = ref<string | null>(null)
const schema = ref<yup.AnyObjectSchema>()

const { signup } = useSignup()

onMounted(() => {
  schema.value = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  })
})

interface SignupFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

async function onSubmit(values: SignupFormValues) {
  isSubmitting.value = true
  signupError.value = null

  try {
    const { name, email, password } = values
    const result = await signup(name, email, password)

    if (result.success) {
      router.push('/login')
    } else {
      signupError.value = result.error || 'Signup failed'
    }
  } catch (err: any) {
    console.error('Unexpected error in signup:', err)
    signupError.value = err.message || 'Unexpected error occurred.'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Wraps VeeValidate handleSubmit to use TypeScript correctly
 */
function submitHandler(handleSubmit: (onSubmit: (values: SignupFormValues) => Promise<void>) => (e?: Event) => Promise<void>) {
  return handleSubmit(onSubmit)
}
</script>
