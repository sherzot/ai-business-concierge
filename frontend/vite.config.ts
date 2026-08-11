import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function netlifySecurityHeaders(): Plugin {
  return {
    name: 'netlify-security-headers',
    generateBundle() {
      const context = process.env.CONTEXT
      const projectId = process.env.VITE_SUPABASE_PROJECT_ID
      if (!projectId || !/^[a-z0-9]{20}$/.test(projectId)) {
        throw new Error('VITE_SUPABASE_PROJECT_ID must be a valid Supabase project reference.')
      }

      const previewHeaders = context === 'deploy-preview' || context === 'branch-deploy'
        ? '  X-Robots-Tag: noindex, nofollow, noarchive\n  Cache-Control: no-store\n'
        : ''

      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: `/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://${projectId}.supabase.co wss://${projectId}.supabase.co; font-src 'self' data:; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
${previewHeaders}
`,
      })
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'AI Business Concierge',
        short_name: 'AI Concierge',
        description: 'Kundalik biznes boshqaruv AI yordamchisi',
        theme_color: '#4f46e5',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/app',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
      },
    }),
    netlifySecurityHeaders(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
