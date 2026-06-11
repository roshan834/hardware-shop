import { useEffect, useState } from "react"
import { supabase } from "../config/supabase"

const useUserRole = () => {
  const [role, setRole] = useState(null)
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingRole(false)
        return
      }

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      setRole(data?.role || "staff")
      setLoadingRole(false)
    }

    fetchRole()
  }, [])

  return { role, loadingRole }
}

export default useUserRole