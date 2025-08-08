"use client"

import { useState } from "react"

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { usernameOrEmail, password })
    // TODO: Add actual login logic
  }

  return (
    <div>
      <h1>Login Page - Updated</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  )
}
