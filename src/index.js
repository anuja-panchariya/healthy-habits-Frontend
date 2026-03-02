import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'           
import { store } from './store/store'            
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.js'
import './index.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <Provider store={store}>                    
        <App />
      </Provider>
    </ClerkProvider>
  </React.StrictMode>,
)
