import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'           
import { store } from './store/store'            
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.js'
import './index.css'

// ✅ HARDCODE - SAB ENV ISSUES BYPASS!
const CLERK_PUBLISHABLE_KEY = "pk_test_cG93ZXJmdWwtcmF0dGxlci0zNi5jbGVyay5hY2NvdW50cy5kZXYk"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}  // ✅ YE 100% WORK KAREGA
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <Provider store={store}>                    
        <App />
      </Provider>
    </ClerkProvider>
  </React.StrictMode>,
)
