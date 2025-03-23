import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: 'dev',
  css: {
    // Force Vite to always regenerate CSS
    // This disables caching for CSS files
    devSourcemap: true,
  },
  server: {
    watch: {
      // Watch the src directory with special configuration
      include: ['../src/**'],
      // Increase the polling frequency
      usePolling: true,
      interval: 100
    }
  },
  // Add a plugin that specifically forces style reloading
  plugins: [{
    name: 'force-scss-update',
    enforce: 'post',
    handleHotUpdate({ file, server }) {
      // If a file in the src directory changes
      if (file.includes(path.resolve('src'))) {
        // Find all SCSS files in the dev directory
        const scssFiles = server.moduleGraph.getModulesByFile(/\.scss$/)
        
        // Force them to be invalidated and reprocessed
        if (scssFiles) {
          console.log('Plugin source changed, regenerating SCSS...')
          scssFiles.forEach(mod => {
            server.moduleGraph.invalidateModule(mod)
            server.ws.send({
              type: 'update',
              path: mod.url,
              timestamp: new Date().getTime()
            })
          })
          return []
        }
      }
    }
  }]
})