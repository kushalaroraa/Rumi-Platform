import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Treat .jsx files as TSX so remaining TypeScript syntax stays valid after renaming.
  esbuild: {
    loader: 'tsx',
  },

  // File types to support raw imports. Never add .css, .jsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
