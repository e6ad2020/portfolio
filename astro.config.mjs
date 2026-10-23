// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import glsl from 'vite-plugin-glsl';

// https://astro.build/config
export default defineConfig({
  site: 'https://eyad.is-a.dev',
  server: {
    port: 8080
  },
  integrations: [react()],
  vite: {
    plugins: [glsl()]
  }
});