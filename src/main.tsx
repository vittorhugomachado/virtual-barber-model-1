import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CustomerAuthProvider } from './context/customer-auth-provider.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomerAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CustomerAuthProvider>
  </StrictMode>,
)
