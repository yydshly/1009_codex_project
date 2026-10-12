import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base: './',
  server: { fs: { allow: [fileURLToPath(new URL('.', import.meta.url)), fileURLToPath(new URL('../../002-dioramas/web/', import.meta.url))] } },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), validation: fileURLToPath(new URL('./validation.html', import.meta.url)), product: fileURLToPath(new URL('./product.html', import.meta.url)), stage: fileURLToPath(new URL('./stage.html', import.meta.url)), show: fileURLToPath(new URL('./show.html', import.meta.url)), launch: fileURLToPath(new URL('./launch.html', import.meta.url)), pump: fileURLToPath(new URL('./pump.html', import.meta.url)) } },
  },
});
