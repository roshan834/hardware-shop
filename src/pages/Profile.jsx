import Sidebar from "../components/Sidebar";

const Profile = () => {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <h1>Profile</h1>

        <div className="form-card">
          <p><strong>Name:</strong> Administrator</p>
          <br />
          <p><strong>Email:</strong> admin@gmail.com</p>
          <br />
          <p><strong>Role:</strong> Admin</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;