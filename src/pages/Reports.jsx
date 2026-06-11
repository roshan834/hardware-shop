import Sidebar from "../components/Sidebar";

const Reports = () => {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <h1>Reports</h1>

        <div className="cards">
          <div className="card">
            <h3>Today's Sales</h3>
            <p>₹0</p>
          </div>

          <div className="card">
            <h3>Monthly Sales</h3>
            <p>₹0</p>
          </div>

          <div className="card">
            <h3>Top Products</h3>
            <p>0</p>
          </div>

          <div className="card">
            <h3>Low Stock</h3>
            <p>0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;