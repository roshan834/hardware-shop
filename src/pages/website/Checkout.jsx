import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../config/supabase"
import "../../styles/website/checkout.css"

const Checkout = () => {
const navigate = useNavigate()

const [loading, setLoading] = useState(true)
const [cartItems, setCartItems] = useState([])
const [paymentMethod, setPaymentMethod] = useState("cod")

const [form, setForm] = useState({
customer_name: "",
mobile: "",
email: "",
address: "",
city: "",
state: "",
pincode: ""
})

useEffect(() => {
loadCart()
}, [])

const loadCart = async () => {
try {
const {
data: { user }
} = await supabase.auth.getUser()


  if (!user) {
    navigate("/login")
    return
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      products(*)
    `)
    .eq("user_id", user.id)

  if (error) {
    console.error(error)
    return
  }

  setCartItems(data || [])
} catch (err) {
  console.error(err)
} finally {
  setLoading(false)
}


}

const totalAmount = cartItems.reduce(
(sum, item) =>
sum +
(item.products?.selling_price || 0) *
item.qty,
0
)

const placeOrder = async () => {
try {
if (
!form.customer_name ||
!form.mobile ||
!form.address ||
!form.city ||
!form.state ||
!form.pincode
) {
alert("Please fill all required fields")
return
}


  if (cartItems.length === 0) {
    alert("Cart is empty")
    return
  }

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const orderNo = "ORD" + Date.now()

  const { data: order, error } =
    await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          order_no: orderNo,

          customer_name:
            form.customer_name,

          mobile:
            form.mobile,

          email:
            form.email,

          address:
            form.address,

          city:
            form.city,

          state:
            form.state,

          pincode:
            form.pincode,

          total_amount:
            totalAmount,

          payment_method:
            paymentMethod,

          payment_status:
            paymentMethod === "cod"
              ? "pending"
              : "paid",

          order_status:
            "pending"
        }
      ])
      .select()
      .single()

  if (error) {
    console.error(error)
    alert(error.message)
    return
  }

  const orderItems =
    cartItems.map(item => ({
      order_id: order.id,

      product_id:
        item.product_id,

      product_name:
        item.products.product_name,

      price:
        item.products.selling_price,

      qty:
        item.qty,

      total:
        item.qty *
        item.products.selling_price
    }))

  await supabase
    .from("order_items")
    .insert(orderItems)

  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)

  navigate(
    "/order-success/" +
    order.id
  )

} catch (err) {
  console.error(err)
  alert("Failed to place order")
}


}

if (loading) {
return <h2>Loading...</h2>
}

return ( <div className="checkout-page">


  <div className="checkout-container">

    <div className="checkout-left">

      <h2>Shipping Details</h2>

      <div className="checkout-form">

        <input
          type="text"
          placeholder="Full Name"
          value={form.customer_name}
          onChange={(e) =>
            setForm({
              ...form,
              customer_name:
                e.target.value
            })
          }
        />

        <input
          type="tel"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={(e) =>
            setForm({
              ...form,
              mobile:
                e.target.value
            })
          }
        />

        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email:
                e.target.value
            })
          }
        />

        <textarea
          rows="4"
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address:
                e.target.value
            })
          }
        />

        <div className="row">

          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city:
                  e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="State"
            value={form.state}
            onChange={(e) =>
              setForm({
                ...form,
                state:
                  e.target.value
              })
            }
          />

        </div>

        <input
          type="text"
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) =>
            setForm({
              ...form,
              pincode:
                e.target.value
            })
          }
        />

      </div>

      <h2>Payment Method</h2>

      <div className="payment-options">

        <label className="payment-card">
          <input
            type="radio"
            checked={
              paymentMethod === "cod"
            }
            onChange={() =>
              setPaymentMethod("cod")
            }
          />
          Cash On Delivery
        </label>

        <label className="payment-card">
          <input
            type="radio"
            checked={
              paymentMethod ===
              "razorpay"
            }
            onChange={() =>
              setPaymentMethod(
                "razorpay"
              )
            }
          />
          Razorpay
        </label>

      </div>

    </div>

    <div className="checkout-right">

      <h2>Order Summary</h2>

      <div className="summary-card">

        {cartItems.map(item => (
          <div
            key={item.id}
            className="summary-item"
          >
            <span>
              {
                item.products
                  .product_name
              }
              × {item.qty}
            </span>

            <span>
              ₹
              {
                item.products
                  .selling_price *
                item.qty
              }
            </span>
          </div>
        ))}

        <hr />

        <div className="summary-total">
          <span>Total</span>
          <span>
            ₹{totalAmount}
          </span>
        </div>

        <button
          className="place-order-btn"
          onClick={placeOrder}
        >
          Place Order
        </button>

      </div>

    </div>

  </div>

</div>


)
}

export default Checkout
