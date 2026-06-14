import { useState } from "react"
import Sidebar from "../components/Sidebar"
import "../styles/profile.css"

const Profile = () => {
  const [user] = useState({
    name: "Administrator",
    email: "admin@gmail.com",
    role: "Admin",
    phone: "9876543210",
    joinDate: "Jan 15, 2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Administrator",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Save logic here
    setIsEditing(false)
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        {/* PAGE HEADER */}
        <div className="page-header">
          <h1>👤 Profile</h1>
          <p className="header-sub">Manage your account information</p>
        </div>

        {/* PROFILE CONTAINER */}
        <div className="profile-container">
          {/* PROFILE CARD */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-section">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="profile-avatar"
                />
                <div className="avatar-overlay">
                  <button className="avatar-btn">📷</button>
                </div>
              </div>

              <div className="profile-name-section">
                <h2>{user.name}</h2>
                <p className="role-badge">{user.role}</p>
              </div>
            </div>

            {/* EDIT BUTTON */}
            <button
              className="btn-primary edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "❌ Cancel" : "✏️ Edit Profile"}
            </button>
          </div>

          {/* PROFILE DETAILS */}
          <div className="profile-details">
            {/* VIEW MODE */}
            {!isEditing && (
              <div className="details-grid">
                <div className="detail-field">
                  <label>Full Name</label>
                  <p>{user.name}</p>
                </div>

                <div className="detail-field">
                  <label>Email Address</label>
                  <p>{user.email}</p>
                </div>

                <div className="detail-field">
                  <label>Phone Number</label>
                  <p>{user.phone}</p>
                </div>

                <div className="detail-field">
                  <label>Role</label>
                  <p className="role-text">{user.role}</p>
                </div>

                <div className="detail-field full-width">
                  <label>Member Since</label>
                  <p>{user.joinDate}</p>
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {isEditing && (
              <form className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      disabled
                      placeholder="Your role"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-success"
                    onClick={handleSave}
                  >
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <div className="action-card">
            <h3>🔐 Security</h3>
            <p>Manage your password and security settings</p>
            <button className="btn-ghost">Change Password</button>
          </div>

          <div className="action-card">
            <h3>🔔 Notifications</h3>
            <p>Configure your notification preferences</p>
            <button className="btn-ghost">Notification Settings</button>
          </div>

          <div className="action-card">
            <h3>📱 Devices</h3>
            <p>Manage your connected devices</p>
            <button className="btn-ghost">View Devices</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile