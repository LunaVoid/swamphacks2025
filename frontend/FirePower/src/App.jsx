import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './LoginPage'
import CameraPage from './CameraPage'
import Dashboard from './Dashboard'
import Demo from './Demo'
import { Auth0Provider } from '@auth0/auth0-react'

function App() {
  const [count, setCount] = useState(0)
  const domain = import.meta.env.VITE_AUTH0_DOMAIN; 
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  console.log(domain)
  console.log(clientId)

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
    >
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/dash" element={<Dashboard/>} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </BrowserRouter>
    </Auth0Provider>
    
  )
}

export default App
