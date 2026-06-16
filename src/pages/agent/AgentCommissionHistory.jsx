import { useEffect, useState } from "react"
import { supabase } from "../config/supabase"

const AgentCommissionHistory = () => {

  const [rows, setRows] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {

    const agentId =
      localStorage.getItem("agent_id")

    const { data } = await supabase
      .from("commissions")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", {
        ascending: false
      })

    setRows(data || [])
  }

  return (
    <div className="content">

      <h1>Commission History</h1>

      <table className="bill-table">

        <thead>
          <tr>
            <th>Bill No</th>
            <th>Bill Amount</th>
            <th>Commission %</th>
            <th>Commission</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {rows.map((row) => (
            <tr key={row.id}>

              <td>{row.bill_no}</td>

              <td>
                ₹{row.bill_amount}
              </td>

              <td>
                {row.commission_percent}%
              </td>

              <td>
                ₹{row.commission_amount}
              </td>

              <td>
                {row.status}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}

export default AgentCommissionHistory