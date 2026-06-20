import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { toast } from 'react-toastify' // ensure you have toast configured
import { supabase } from "../../config/supabase"

const ProductCard = ({ product }) => {
  const navigate = useNavigate()

  const handleAddToCart = async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login if not authenticated
      navigate("/login")
      return
    }

    try {
      // Check if the product already exists in the user's cart
      const { data: existing, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching cart item:', fetchError)
        return
      }

      if (existing) {
        // Update quantity if exists
        await supabase
          .from("cart_items")
          .update({ qty: existing.qty + 1 })
          .eq("id", existing.id)
      } else {
        // Insert new cart item
        await supabase
          .from("cart_items")
          .insert({ user_id: user.id, product_id: product.id, qty: 1 })
      }

      // Notify other components to refresh cart count
      window.dispatchEvent(new Event("cartUpdated"))

      // Show success toast
      toast.success("Added To Cart 🛒")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image">
        <img
          src={product.image_url || "/placeholder.png"}
          alt={product.product_name}
        />
      </div>
      {/* Product Details */}
      <div className="product-body">
        <h3>{product.product_name}</h3>
        <p className="brand">{product.brand}</p>
        <p className="category">{product.category}</p>
        <div className="price">₹{product.selling_price}</div>
        {/* Add to Cart Button */}
        <button onClick={handleAddToCart} className="cart-btn">
          Add To Cart
        </button>
      </div>
    </div>
  )
}

export default ProductCard