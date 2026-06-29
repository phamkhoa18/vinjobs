import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

// [SECURITY] Warn if critical env vars are missing in production
if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) {
    console.error('[SECURITY WARNING] VITE_TURNSTILE_SITE_KEY is not set! CAPTCHA will use Cloudflare testing key that always passes.');
  }
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    console.error('[SECURITY WARNING] VITE_GOOGLE_CLIENT_ID is not set! Google OAuth will not work.');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
