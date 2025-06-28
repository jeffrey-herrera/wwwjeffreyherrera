// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sanity from '@sanity/astro';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  
  // Performance optimizations
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
    assetsPrefix: process.env.NODE_ENV === 'production' ? '/_assets/' : undefined,
  },
  
  // Image optimization
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  
  // Vite optimizations
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Optimize chunk splitting
      rollupOptions: {
        output: {
          manualChunks: {
            'sanity': ['@sanity/client', '@sanity/image-url'],
            'react': ['react', 'react-dom'],
            'phosphor': ['phosphor-react'],
          },
        },
      },
      // Enable compression and minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['@sanity/client', 'phosphor-react', 'react', 'react-dom', '@portabletext/react'],
    },
  },

  integrations: [
    react(),
    sanity({
      projectId: 'wtlgwnno',
      dataset: 'production',
      useCdn: true, // Enable CDN for production
      studioBasePath: '/studio',
    }), 
  ],
  

});