import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/*
 * `base: '/'` (el valor por defecto) porque la app es una SPA con rutas de historia:
 * con `base: './'` los enlaces a rutas anidadas (`/recetas/jabon-de-cafe-exfoliante`)
 * piden `/recetas/assets/index-….js`, reciben 404 y la página queda en blanco.
 *
 * Para publicar en una subcarpeta, indica esa ruta absoluta (`base: '/jabones/'`) y
 * pon el mismo valor como `basename` del router en `src/main.tsx`.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    cssMinify: true,
    sourcemap: false,
  },
  server: { port: 5173, open: false },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
