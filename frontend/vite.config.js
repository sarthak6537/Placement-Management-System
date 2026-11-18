import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8080',
      '/students': 'http://localhost:8080',
      '/colleges': 'http://localhost:8080',
      '/placements': 'http://localhost:8080',
      '/certificates': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/companies': 'http://localhost:8080',
      '/job-postings': 'http://localhost:8080',
      '/job-applications': 'http://localhost:8080',
      '/interview-schedules': 'http://localhost:8080',
      '/skills': 'http://localhost:8080',
      '/student-profiles': 'http://localhost:8080'
    }
  }
})
