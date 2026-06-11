import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = async (userId) => {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single()
    setRole(data?.role || "staff")
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        fetchRole(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session?.user) {
          fetchRole(session.user.id)
        } else {
          setRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)