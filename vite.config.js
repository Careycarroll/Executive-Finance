import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { readdirSync, existsSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa';

function getPageInputs() {
  const inputs = { main: resolve(__dirname, 'index.html') };
  const dirs = ['pages/learn', 'pages/apply'];
  dirs.forEach(dir => {
    if (!existsSync(dir)) return;
    readdirSync(dir)
      .filter(f => f.endsWith('.html'))
      .forEach(f => {
        const name = dir.replace('pages/', '').replace('/', '-') + '-' + f.replace('.html', '');
        inputs[name] = resolve(__dirname, dir, f);
      });
  });
  return inputs;
}

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Executive-Finance/' : '/',
  build: { rollupOptions: { input: getPageInputs() } },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Executive Finance Interactive',
        short_name: 'ExecFinance',
        description: 'Interactive learning companion for Finance for Executives 6th Edition',
        theme_color: '#1a365d',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/Executive-Finance/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Executive-Finance/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});
