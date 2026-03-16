import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  publicDir: false,
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      three: 'three'
    }
  }
});
