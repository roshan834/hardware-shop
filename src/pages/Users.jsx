import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { supabase } from "../config/supabase"
import { toast } from "react-toastify"
import "../styles/users.css"


const Users = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff"
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true })

    if (error) return toast.error(error.message)
    setUsers(data || [])
  }

  const addUser = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and Email are required")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      toast.error("Enter valid email")
      return
    }

    const { error } = await supabase.from("users").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      is_active: true
    })

    if (error) return toast.error(error.message)

    toast.success("User Added Successfully")

    setForm({ name: "", email: "", phone: "", role: "staff" })
    setShowModal(false)
    loadUsers()
  }

  const updateRole = async (id, role) => {
    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", id)

    if (error) return toast.error(error.message)

    toast.success("Role Updated")
    loadUsers()
  }

  const toggleActive = async (id, current) => {
    const { error } = await supabase
      .from("users")
      .update({ is_active: !current })
      .eq("id", id)

    if (error) return toast.error(error.message)

    toast.success("Status Updated")
    loadUsers()
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  )

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>👥 Users Management</h1>
        </div>

        {/* Toolbar */}
        <div className="card">
          <div className="user-toolbar">
            <input
              type="text"
              placeholder="Search Name / Email / Phone"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="add-user-btn" onClick={() => setShowModal(true)}>
              + Add User
            </button>
          </div>
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="card desktop-view">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>

                    <td>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateRole(user.id, e.target.value)
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>

                    <td>
                      {user.role === "admin" ? (
                        <button
                          className={user.is_active ? "active-btn" : "inactive-btn"}
                          onClick={() => toggleActive(user.id, user.is_active)}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </button>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>

                    <td>
                      <button className="edit-btn">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="mobile-view">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <h3>{user.name}</h3>
                <span className={`badge ${user.role}`}>{user.role}</span>
              </div>

              <p>📧 {user.email}</p>
              <p>📞 {user.phone}</p>

              <div className="user-actions">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>

                {user.role === "admin" && (
                  <button
                    className={user.is_active ? "active-btn" : "inactive-btn"}
                    onClick={() => toggleActive(user.id, user.is_active)}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <h2>Add User</h2>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={addUser}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users