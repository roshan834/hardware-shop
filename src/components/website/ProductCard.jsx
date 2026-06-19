import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const ProductCard = ({ product }) => {

  const navigate = useNavigate()

  const { session } = useAuth()

  const handleAddToCart = () => {

    if (!session) {
      navigate("/login")
      return
    }

    let cart =
      JSON.parse(
        localStorage.getItem("cart")
      ) || []

    const existing =
      cart.find(
        item => item.id === product.id
      )

    if (existing) {
      existing.qty += 1
    } else {
      cart.push({
        ...product,
        qty: 1
      })
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    )

    alert("Added To Cart")
  }

  return (
    <div className="product-card">

      <div className="product-image">

        <img
          src={
            product.image_url ||
            "/placeholder.png"
          }
          alt={product.product_name}
        />

      </div>

      <div className="product-body">

        <h3>
          {product.product_name}
        </h3>

        <p className="brand">
          {product.brand}
        </p>

        <p className="category">
          {product.category}
        </p>

        <div className="price">
          ₹{product.selling_price}
        </div>

        <button
          onClick={handleAddToCart}
          className="cart-btn"
        >
          Add To Cart
        </button>

      </div>

    </div>
  )
}

export default ProductCard