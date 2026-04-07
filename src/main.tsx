import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined
if (!convexUrl) {
  document.body.innerHTML =
    '<div style="font-family:sans-serif;padding:40px;color:#2D1F3D">' +
    '<h2>Missing VITE_CONVEX_URL</h2>' +
    '<p>Add this environment variable in your Vercel project settings and redeploy.</p>' +
    '</div>'
  throw new Error('VITE_CONVEX_URL is not set')
}
const convex = new ConvexReactClient(convexUrl)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </StrictMode>,
)
