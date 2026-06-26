import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../config/supabase"
import loginBack from "../../assets/logincoverpage.jpeg"

const Login = () => {
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")

const navigate = useNavigate()

// AUTO LOGIN
useEffect(() => {
const checkSession = async () => {
const {
data: { session }
} = await supabase.auth.getSession()


  if (!session) return

  const { data: userData } =
    await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    switch (userData?.role) {
    case "customer":
      navigate("/customer")
      break

    case "staff":
      navigate("/admin/products")
      break

    case "agent":
      navigate("/agent/dashboard")
      break

    case "admin":
      navigate("/admin/dashboard")
      break

    default:
      navigate("/")
  }
}

checkSession()


}, [navigate])

// LOGIN
const handleLogin = async (e) => {
e.preventDefault()


const { error, data } =
  await supabase.auth.signInWithPassword({
    email,
    password
  })

if (error) {
  alert(error.message)
  return
}

const { data: userData } =
  await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single()

    const role = userData?.role?.trim().toLowerCase()

switch (role) {
  case "customer":
    navigate("/customer")
    break

  case "staff":
    navigate("/admin/products")
    break

  case "agent":
    navigate("/agent/dashboard")
    break

  case "admin":
    navigate("/admin/dashboard")
    break

  default:
    navigate("/")
}


}

const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  })

  if (error) {
    console.error(error)
  }
}



const goBack = () => {
  navigate("/")
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

        {/* Back Button */}
        <button
          type="button"
          onClick={goBack}
          className="back-btn"
        >
          ← Back
        </button>

<br /><br />
        <h2>
          Hardware Shop Login
        </h2>

        <p>
          Inventory & Billing Management
        </p>

        <button onClick={loginWithGoogle}>
          Continue with Google
        </button>

        <h3 className="or-text">OR</h3>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
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
