import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import { supabase } from "../config/supabase"
import { toast } from "react-toastify"
import "../styles/users.css"

const Users = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")

  const [showModal, setShowModal] =
    useState(false)

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
    const { data, error } =
      await supabase
        .from("users")
        .select("*")
        .order("name", {
          ascending: true
        })

    if (error) {
      toast.error(error.message)
      return
    }

    setUsers(data || [])
  }

  const addUser = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim()
    ) {
      toast.error(
        "Name and Email are required"
      )
      return
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !emailRegex.test(form.email)
    ) {
      toast.error(
        "Enter valid email"
      )
      return
    }

    const { error } =
      await supabase
        .from("users")
        .insert({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role
        })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(
      "User Added Successfully"
    )

    setShowModal(false)

    setForm({
      name: "",
      email: "",
      phone: "",
      role: "staff"
    })

    loadUsers()
  }

  const updateRole = async (
    id,
    role
  ) => {
    const { error } =
      await supabase
        .from("users")
        .update({ role })
        .eq("id", id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(
      "Role Updated"
    )

    loadUsers()
  }

  const filteredUsers =
    users.filter(
      (user) =>
        user.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        user.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        user.phone
          ?.includes(search)
    )

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>
            👥 Users Management
          </h1>
        </div>

        <div className="card">
          <div className="user-toolbar">
            <input
              type="text"
              placeholder="Search Name / Email / Phone"
              className="search-input"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <button
              className="add-user-btn"
              onClick={() =>
                setShowModal(true)
              }
            >
              + Add User
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length ===
                0 ? (
                  <tr>
                    <td colSpan="5">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(
                    (user) => (
                      <tr
                        key={user.id}
                      >
                        <td>
                          {user.name}
                        </td>

                        <td>
                          {user.email}
                        </td>

                        <td>
                          {user.phone}
                        </td>

                        <td>
                          <select
                            value={
                              user.role
                            }
                            onChange={(
                              e
                            ) =>
                              updateRole(
                                user.id,
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="admin">
                              Admin
                            </option>

                            <option value="manager">
                              Manager
                            </option>

                            <option value="staff">
                              Staff
                            </option>
                          </select>
                        </td>

                        <td>
                          <button className="edit-btn">
                            Updated
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="checkout-modal">

            <h2>Add User</h2>

            <div className="form-group">
              <label>Name</label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target
                        .value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email:
                      e.target
                        .value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone:
                      e.target
                        .value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Role</label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role:
                      e.target
                        .value
                  })
                }
              >
                <option value="admin">
                  Admin
                </option>

                <option value="manager">
                  Manager
                </option>

                <option value="staff">
                  Staff
                </option>
              </select>
            </div>

            <div className="modal-buttons">
              <button
                className="confirm-btn"
                onClick={addUser}
              >
                Save User
              </button>

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowModal(false)
                }
              >
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