import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./i18n";

// iOS fix for white screen when returning from background
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Force reload if page is restored from bfcache
    window.location.reload();
  }
});

// Watchdog for long-term backgrounding
let lastBackgroundTime = Date.now();
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        lastBackgroundTime = Date.now();
    } else if (document.visibilityState === 'visible') {
        const timeInBackground = Date.now() - lastBackgroundTime;
        // If app was in background for more than 30 minutes, reload to ensure fresh state
        if (timeInBackground > 30 * 60 * 1000) {
            window.location.reload();
        }
    }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
