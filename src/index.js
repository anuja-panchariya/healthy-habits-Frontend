// YE FINAL - ONLY EK ClerkProvider!
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'           
import { store } from './store/store'            
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.js'
import './index.css'

const CLERK_PUBLISHABLE_KEY = "pk_test_cG93ZXJmdWwtcmF0dGxlci0zNi5jbGVyay5hY2NvdW50cy5kZXYk"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      fallbackRedirectUrl="/dashboard"  // Updated prop name
    >
      <Provider store={store}>
        <App />
      </Provider>
    </ClerkProvider>
  </React.StrictMode>,
)
