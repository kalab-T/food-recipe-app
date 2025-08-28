import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode'],  // <--- add this line here

  runtimeConfig: {
    public: {
      hasuraUrl:
        process.env.NUXT_PUBLIC_HASURA_URL ||
        'http://localhost:8081/v1/graphql',
      hasuraWsUrl:
        process.env.NUXT_PUBLIC_HASURA_WS_URL ||
        'ws://localhost:8081/v1/graphql',
      hasuraAdminSecret:
        process.env.NUXT_PUBLIC_HASURA_ADMIN_SECRET || 'adminsecret',
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
    },
  },

  css: [
    '~/assets/css/tailwind.css',
  ],

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
