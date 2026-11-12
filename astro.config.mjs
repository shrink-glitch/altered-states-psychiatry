import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// SITE and BASE are set by the GitHub Pages workflow.
// Locally the site runs at "/".
export default defineConfig({
  site: process.env.SITE || 'http://localhost:4321',
  base: process.env.BASE || '/',
  integrations: [react()],
  trailingSlash: 'ignore',
});
