<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useAsyncData, useNuxtApp } from '#app'
import { useAuth } from '@/composables/useAuth'
import Recipe from '~/components/Recipe.vue'  // <-- import Recipe.vue

const { $publicApollo } = useNuxtApp()
const { isLoggedIn, user } = useAuth()

const GET_PUBLIC_RECIPES = gql`
  query GetLandingRecipes {
    recipes(limit: 6, order_by: { created_at: desc }) {
      id
      title
      description
      image
      user {
        name
      }
      likes_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

const { data, pending, error, refresh } = await useAsyncData(
  'landing-recipes',
  async () => {
    const { data } = await $publicApollo.query({
      query: GET_PUBLIC_RECIPES,
    })
    return data
  }
)

const retryFetch = () => {
  refresh()
}

const currentUserId = user.value?.id || null
</script>

<template>
  <div class="page-background">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1>Welcome to the Food Recipe App 🍽️</h1>
        <p>Discover amazing recipes or share your own!</p>

        <div class="actions">
          <ClientOnly>
            <NuxtLink
              v-if="!isLoggedIn"
              to="/signup"
              class="btn outline"
            >
              Join Now
            </NuxtLink>
          </ClientOnly>
          <NuxtLink to="/recipes" class="btn">Browse Recipes</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Preview Recipes Section -->
    <section class="recipe-section py-10 px-4">
      <div class="recipe-card rounded-xl max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold text-center mb-6 text-white">
          Latest Recipes
        </h2>

        <div v-if="pending" class="text-center text-gray-200">
          Loading recipes...
        </div>

        <div v-else-if="error" class="text-center text-red-400">
          Failed to load recipes. Please try again later.
          <button
            @click="retryFetch"
            class="mt-2 text-blue-300 hover:underline"
          >
            Retry
          </button>
        </div>

        <div
          v-else-if="!data?.recipes?.length"
          class="text-center text-gray-200"
        >
          No recipes found.
        </div>

        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Recipe
            v-for="recipe in data.recipes"
            :key="recipe.id"
            :recipe="recipe"
            :currentUserId="currentUserId"
            simple
          />
        </div>
      </div>
    </section>
  </div>
</template>



<style scoped>
.page-background {
  background-image: url("/images/background.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  color: #fff;
  position: relative;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

.page-background > * {
  position: relative;
  z-index: 1;
}

/* Hero Section */
.hero {
  padding: 6rem 1rem 4rem;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: #ddd;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
}

/* Actions buttons container */
.actions {
  display: inline-flex;
  gap: 1.5rem;
  justify-content: center;
}

/* Buttons */
.btn {
  font-weight: 600;
  padding: 0.6rem 1.6rem;
  font-size: 1.1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.btn.outline {
  background-color: transparent;
  border: 2px solid #fff;
  color: #fff;
}

.btn.outline:hover {
  background-color: #fff;
  color: #111;
}

.btn:not(.outline) {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn:not(.outline):hover {
  background-color: #2563eb;
  color: #fff;
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.6);
}

/* Latest Recipes Heading */
.recipe-card h2 {
  color: #fff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
}

/* Recipe Cards Styling */
.grid > a {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgb(0 0 0 / 0.1);
  padding: 1rem;
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

.grid > a:hover {
  box-shadow: 0 12px 24px rgb(0 0 0 / 0.15);
}

.grid > a img {
  border-radius: 0.75rem;
  object-fit: cover;
  height: 10rem;
  width: 100%;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
  margin-bottom: 1rem;
}

.grid > a:hover img {
  transform: scale(1.05);
}

.grid > a h3 {
  color: #333;
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  flex-grow: 1;
}

.grid > a p {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 2.5rem;
  overflow-wrap: break-word;
}

/* Bottom bar inside cards */
.grid > a > div {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grid > a > div span {
  color: #555;
  font-weight: 600;
  font-size: 0.9rem;
}

.grid > a > div button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;
  color: #e0245e;
  transition: color 0.3s ease;
}

.grid > a > div button:hover {
  color: #ad184e;
}
</style>
