import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { supabase } from "../config/supabase"

const PaymentHistory = () => {
  const { billId } = useParams()

  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBill()
  }, [])

  const fetchBill = async () => {
    const { data, error } =
      await supabase
        .from("bills")
        .select("*")
        .eq("id", billId)
        .single()

    if (!error) {
      setBill(data)
    }

    setLoading(false)
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <div className="page-header">
          <h1>Payment History</h1>
        </div>

        {loading ? (
          <div className="card">
            Loading...
          </div>
        ) : !bill ? (
          <div className="card">
            Bill Not Found
          </div>
        ) : (
          <>
            <div className="card">

              <h3>{bill.bill_no}</h3>

              <p>
                Customer :
                {" "}
                {bill.customer_name ||
                  "Walk-In Customer"}
              </p>

              <p>
                Phone :
                {" "}
                {bill.customer_phone || "-"}
              </p>

              <p>
                Total :
                ₹{bill.grand_total}
              </p>

              <p>
                Paid :
                ₹{bill.paid_amount}
              </p>

              <p>
                Pending :
                ₹{bill.pending_amount}
              </p>

            </div>

            <div className="card">

              <h2>Payment Logs</h2>

              <table className="bill-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Note</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {bill.payment_logs?.length >
                  0 ? (
                    bill.payment_logs.map(
                      (log, index) => (
                        <tr key={index}>
                          <td>
                            {index + 1}
                          </td>

                          <td>
                            ₹{log.amount}
                          </td>

                          <td>
                            {log.payment_mode}
                          </td>

                          <td>
                            {log.note}
                          </td>

                          <td>
                            {new Date(
                              log.date
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan="5">
                        No Payment Logs
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>

            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentHistory