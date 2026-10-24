import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lo define el workflow de despliegue: '/<nombre-del-repo>/' en GitHub Pages,
// '/' con un dominio propio.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  define: {
    __VERSION_APP__: JSON.stringify(process.env.npm_package_version ?? 'desarrollo'),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt': la actualización espera a que la persona la acepte en la pantalla Hoy,
      // nunca se aplica sola en medio de una sesión.
      registerType: 'prompt',
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Mahamudra · práctica diaria',
        short_name: 'Mahamudra',
        description: 'Acompaña y registra la práctica diaria del programa de Mahamudra.',
        lang: 'es',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1c0a0e',
        theme_color: '#4d1219',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json,mp3,woff2}'],
      },
    }),
  ],
});
