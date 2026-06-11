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
      (event, session) => {
        setSession(session)

        if (session?.user) {
          fetchRole(session.user.id)
        } else {
          setRole(null)
        }

        // auto logout on token expiry
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          setSession(null)
          setRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // auto logout after 8 hours of inactivity
  useEffect(() => {
    if (!session) return

    let timer

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await supabase.auth.signOut()
        setSession(null)
        setRole(null)
      }, 8 * 60 * 60 * 1000)   // 8 hours
    }

    // reset timer on any user activity
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ session, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)