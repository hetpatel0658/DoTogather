
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './context/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import React from 'react'
import { registerSW } from './utils/pwa'

// Add error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Register service worker for PWA
registerSW();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
