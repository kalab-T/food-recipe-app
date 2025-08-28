<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header Navigation -->
    <Header />

    <!-- Main content area -->
    <main class="flex-grow bg-transparent">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue'
</script>

<style scoped>
.navbar {
  background-color: #333;
  color: white;
  padding: 10px 0;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar h1 {
  margin: 0;
  font-size: 24px;
}

.navbar nav ul {
  display: flex;
  list-style: none;
}

.navbar nav ul li {
  margin: 0 10px;
}

.navbar nav ul li a {
  color: white;
  text-decoration: none;
  font-size: 16px;
}

.navbar nav ul li a:hover {
  text-decoration: underline;
}

.footer {
  background-color: #1f1f1f;
  color: #ccc;
  text-align: center;
  padding: 1rem;
}
</style>
