import { useState } from "react";
import Sidebar from "../components/Sidebar";

const Billing = () => {
  const [cart, setCart] = useState([]);

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <div className="page-header">
          <h1>Billing</h1>
        </div>

        <div className="bill-container">

          <div className="cart-box">
            <h3>Products</h3>

            <input
              type="text"
              className="search-box"
              placeholder="Search Product"
            />

            <br />
            <br />

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="4">
                      No products added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="summary-box">
            <h3>Bill Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹0</span>
            </div>

            <div className="summary-row">
              <span>GST</span>
              <span>₹0</span>
            </div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹0</span>
            </div>

            <button className="btn-success">
              Generate Bill
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Billing;