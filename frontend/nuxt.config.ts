import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode'],

  runtimeConfig: {
    backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL, // server-side only
    hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET, // server-side only
    public: {
      hasuraUrl: process.env.NUXT_PUBLIC_HASURA_URL,
      hasuraWsUrl: process.env.NUXT_PUBLIC_HASURA_WS_URL,
    },
  },

  css: ['~/assets/css/tailwind.css'],

  postcss: {
    plugins: { tailwindcss: {}, autoprefixer: {} },
  },

  build: { transpile: ['@apollo/client', 'ts-invariant'] },

  tailwindcss: { config: { darkMode: 'class' } },

  app: {
    head: {
      script: [
        {
          children: `
            (function() {
              try {
                let theme = localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  localStorage.setItem('theme', theme);
                }
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (_) {}
            })();
          `,
        },
      ],
    },
  },
})
