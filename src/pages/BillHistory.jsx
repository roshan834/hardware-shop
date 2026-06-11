import Sidebar from "../components/Sidebar";

const BillHistory = () => {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <h1>Bill History</h1>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>BILL001</td>
                <td>Walk-In Customer</td>
                <td>₹0</td>
                <td>{new Date().toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillHistory;