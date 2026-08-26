import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/md-editor-iconify/', // 👈 REEMPLAZA ESTO con el nombre exacto 
  plugins: [react()],

  // Rutas relativas a index.html en lugar de absolutas.
  //
  // GitHub Pages sirve los repositorios de proyecto desde una subcarpeta
  // (https://usuario.github.io/mi-repo/), así que un `/assets/index.js` daría
  // 404 y la página saldría en blanco. Con './' el mismo build funciona en una
  // subcarpeta, en una página de usuario, en un dominio propio y abriendo
  // dist/index.html directamente desde el disco, sin volver a configurar nada.
  base: './',

  build: {
    // El paquete ronda los 460 KB (≈133 KB comprimidos), por encima del aviso
    // por defecto de 500 KB sin comprimir pero muy lejos de ser un problema.
    chunkSizeWarningLimit: 700
  }
})
