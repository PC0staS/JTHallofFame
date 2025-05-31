import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import clerk from '@clerk/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [react(), clerk()],
  output: 'server',
  adapter: netlify()
});