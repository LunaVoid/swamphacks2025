import React from 'react'

import LoginButton from './components/LoginButton'; 
import LogoutButton from './components/LogoutButton';

function LoginPage() {

    return (  
      <>
        <Navbar/>
        <main className = "column"> 
            <h1>Auth0 Login</h1>
            <LoginButton />
            <LogoutButton />
        
        </main>
      <>
    )
}

export default LoginPage