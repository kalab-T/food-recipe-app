import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode'],

  runtimeConfig: {
    public: {
      // ✅ Use Render Hasura URL in production
      hasuraUrl:
        process.env.NUXT_PUBLIC_HASURA_URL ||
        'https://hasura-backend-l2yi.onrender.com/v1/graphql',

      hasuraWsUrl:
        process.env.NUXT_PUBLIC_HASURA_WS_URL ||
        'wss://hasura-backend-l2yi.onrender.com/v1/graphql',

      hasuraAdminSecret:
        process.env.NUXT_PUBLIC_HASURA_ADMIN_SECRET || 'adminsecret',

      // ✅ Use Render backend API instead of localhost
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        'https://food-recipe-appp.onrender.com',
    },
  },

  css: ['~/assets/css/tailwind.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  build: {
    transpile: ['@apollo/client', 'ts-invariant'],
  },

  // Tailwind config for dark mode class strategy
  tailwindcss: {
    config: {
      darkMode: 'class',
    },
  },

  app: {
    head: {
      script: [
        {
          // This script ensures the correct theme class on initial page load
          children: `
            (function() {
              try {
                let theme = localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  localStorage.setItem('theme', theme);
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            })();
          `,
        },
      ],
    },
  },
})
