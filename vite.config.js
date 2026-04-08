import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for the project. Using './' ensures relative paths 
  // which works better for most shared hosting (public_html).
  base: './',
  build: {
    outDir: 'dist',
  }
});
