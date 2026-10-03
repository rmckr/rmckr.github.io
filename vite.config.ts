import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Site metadata — edit these to change <title>, <meta>, etc.
// For GA, set VITE_GA_ID in your .env file.
const site = {
  title: 'Lukas Romacker — Portfolio',
  description: 'Computer science M.Sc. student. Building small tools, learning in public.',
  lang: 'en',
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT ?? '5173'),
  },
  define: {
    __SITE_TITLE__: JSON.stringify(site.title),
    __SITE_DESCRIPTION__: JSON.stringify(site.description),
    __SITE_LANG__: JSON.stringify(site.lang),
  },
})
