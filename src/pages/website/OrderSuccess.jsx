import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../../config/supabase"
import "../../styles/website/order-success.css"

const OrderSuccess = () => {
  const { id } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [])

  const loadOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setOrder(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="success-page">
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <div className="success-page">

      <div className="success-card">

        <div className="success-icon">
          ✅
        </div>

        <h1>
          Order Placed Successfully!
        </h1>

        <p>
          Thank you for shopping with
          <strong> Neelkanth Enterprises</strong>
        </p>

        <div className="order-info">

          <div className="info-row">
            <span>Order No</span>
            <strong>
              {order?.order_no}
            </strong>
          </div>

          <div className="info-row">
            <span>Amount</span>
            <strong>
              ₹{order?.total_amount}
            </strong>
          </div>

          <div className="info-row">
            <span>Payment Method</span>
            <strong>
              {order?.payment_method?.toUpperCase()}
            </strong>
          </div>

          <div className="info-row">
            <span>Payment Status</span>
            <strong>
              {order?.payment_status}
            </strong>
          </div>

          <div className="info-row">
            <span>Order Status</span>
            <strong>
              {order?.order_status}
            </strong>
          </div>

        </div>

        <div className="success-actions">

          <Link
            to="/shop"
            className="shop-btn"
          >
            Continue Shopping
          </Link>

          <Link
            to="/customer/orders"
            className="orders-btn"
          >
            My Orders
          </Link>

        </div>

      </div>

    </div>
  )
}

export default OrderSuccess