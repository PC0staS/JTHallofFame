import { defineConfig } from 'astro/config'
import netlify from '@astrojs/netlify'
import clerk from '@clerk/astro'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [clerk(), react()],
  adapter: netlify(),
  output: 'server',
  vite: {
    define: {
      // Hacer que las variables de entorno de Cloudflare estén disponibles en el servidor
      'import.meta.env.CLOUDFLARE_ACCOUNT_ID': JSON.stringify(process.env.CLOUDFLARE_ACCOUNT_ID),
      'import.meta.env.CLOUDFLARE_ACCESS_KEY_ID': JSON.stringify(process.env.CLOUDFLARE_ACCESS_KEY_ID),
      'import.meta.env.CLOUDFLARE_SECRET_ACCESS_KEY': JSON.stringify(process.env.CLOUDFLARE_SECRET_ACCESS_KEY),
      'import.meta.env.CLOUDFLARE_BUCKET_NAME': JSON.stringify(process.env.CLOUDFLARE_BUCKET_NAME),
      'import.meta.env.CLOUDFLARE_PUBLIC_URL': JSON.stringify(process.env.CLOUDFLARE_PUBLIC_URL),
    },
    server: {
      // Aumentar límite para archivos más grandes
      maxFileSize: 20 * 1024 * 1024 // 20MB
    }
  }
})