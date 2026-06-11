import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import loginBack from '../assets/logincoverpage.jpeg'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard')
      }
    })
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    navigate('/dashboard')
  }

  return (
            <div
        className="login-container"
        style={{
            backgroundImage: `url(${loginBack})`
        }}
        >
        <div className="login-overlay">

            <div className="login-card">
            <h2>Hardware Shop Login</h2>
            <p>Inventory & Billing Management</p>

            <form onSubmit={handleLogin}>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />

                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                Login
                </button>
            </form>
            </div>

        </div>
        </div>
  )
}

export default Login


