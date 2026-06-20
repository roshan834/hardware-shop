import { useState, useEffect, useRef } from "react"
import { supabase } from "../../config/supabase"
import WebsiteHeader from "../../components/website/WebsiteHeader"
import WebsiteFooter from "../../components/website/WebsiteFooter"
import "../../styles/website/cart.css"

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncingIds, setSyncingIds] = useState(() => new Set())
  const [removingIds, setRemovingIds] = useState(() => new Set())

  // Holds pending debounce timers per cart item id, so rapid +/- clicks
  // only hit the database once the user pauses, instead of on every click.
  const debounceTimers = useRef({})

  useEffect(() => {
    fetchCartItems()
    return () => {
      // Clean up any pending debounced writes on unmount
      Object.values(debounceTimers.current).forEach(clearTimeout)
    }
  }, [])

  // Fetch cart items from Supabase.
  // showLoader is only true on the very first load — background refreshes
  // (e.g. after a failed optimistic update) should never blank the page.
  const fetchCartItems = async (showLoader = true) => {
    if (showLoader) setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setCartItems([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        user_id,
        product_id,
        qty,
        products (
          product_name,
          product_code,
          selling_price,
          image_url
        )
      `
      )
      .eq("user_id", user.id)

    if (error) {
      console.error(error)
    } else {
      setCartItems(data || [])
    }

    if (showLoader) setLoading(false)
  }

  // Add product to cart
  const addToCart = async (productId) => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return

    const existingItem = cartItems.find((item) => item.product_id === productId)
    if (existingItem) {
      updateCartItemQty(existingItem.id, existingItem.qty + 1)
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert([{ user_id: user.id, product_id: productId, qty: 1 }])
      if (error) console.error("Error adding to cart:", error)
      else fetchCartItems(false)
    }
  }

  // Update cart item quantity — updates the UI instantly, then writes to
  // Supabase in the background after a short debounce. No refetch, no
  // loading flicker. If the write fails, we resync silently and revert.
  const updateCartItemQty = (id, qty) => {
    if (qty < 1) return

    const previousItems = cartItems

    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    )

    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id])
    }

    debounceTimers.current[id] = setTimeout(async () => {
      setSyncingIds((prev) => new Set(prev).add(id))

      const { error } = await supabase
        .from("cart_items")
        .update({ qty })
        .eq("id", id)

      setSyncingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      if (error) {
        console.error(error)
        setCartItems(previousItems) // revert optimistic change
        return
      }

      window.dispatchEvent(new Event("cartUpdated"))
    }, 400)
  }

  // Remove item from cart — fades the card out, then removes it from
  // state and deletes the row in the background.
  const removeFromCart = (id) => {
    setRemovingIds((prev) => new Set(prev).add(id))

    setTimeout(async () => {
      const previousItems = cartItems
      setCartItems((prev) => prev.filter((item) => item.id !== id))
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })

      const { error } = await supabase.from("cart_items").delete().eq("id", id)

      if (error) {
        console.error(error)
        setCartItems(previousItems) // revert if the delete failed
        return
      }

      window.dispatchEvent(new Event("cartUpdated"))
    }, 220)
  }

  const totalPrice = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.products?.selling_price || 0
      return sum + price * item.qty
    }, 0)
  }

  const totalUnits = () => cartItems.reduce((sum, item) => sum + item.qty, 0)

  const formatINR = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`

  return (
    <>
      <WebsiteHeader />

      <div className="cart-page">
        <div className="cart-page-inner">
          <div className="cart-header">
            <h1 className="cart-title">Your Cart</h1>
            {!loading && cartItems.length > 0 && (
              <span className="cart-item-count">
                {totalUnits()} {totalUnits() === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="cart-skeleton-list" aria-busy="true" aria-label="Loading cart">
              {[1, 2, 3].map((n) => (
                <div className="cart-skeleton-card" key={n}>
                  <div className="skeleton-block skeleton-img" />
                  <div className="skeleton-lines">
                    <div className="skeleton-block skeleton-line" style={{ width: "70%" }} />
                    <div className="skeleton-block skeleton-line" style={{ width: "40%" }} />
                    <div className="skeleton-block skeleton-line" style={{ width: "30%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart">
              <svg
                className="empty-cart-icon"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="32" fill="var(--cart-orange-soft)" />
                <path
                  d="M18 22h4l3.2 17.2a3 3 0 0 0 3 2.4h13.6a3 3 0 0 0 3-2.4L48 26H24"
                  stroke="var(--cart-navy)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="27" cy="47" r="2.6" fill="var(--cart-navy)" />
                <circle cx="40" cy="47" r="2.6" fill="var(--cart-navy)" />
              </svg>
              <h3>Your cart is empty</h3>
              <p>Add some hardware essentials to get started.</p>
              <a className="empty-cart-cta" href="/shop">
                Browse Products
              </a>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cartItems.map((item) => {
                  const isRemoving = removingIds.has(item.id)
                  const isSyncing = syncingIds.has(item.id)
                  return (
                    <div
                      className={`cart-card${isRemoving ? " is-removing" : ""}`}
                      key={item.id}
                    >
                      <div className="cart-card-media">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products?.product_name || "Product"}
                            loading="lazy"
                          />
                        ) : (
                          <div className="cart-card-media-placeholder" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
                              <path d="M3 16l5-5 4 4 4-5 5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="cart-card-body">
                        <div className="cart-card-info">
                          <h3 className="cart-card-name">{item.products?.product_name}</h3>
                          <p className="cart-card-code">Code: {item.products?.product_code}</p>
                          <div className="cart-card-price">
                            {formatINR(item.products?.selling_price)}
                            <span className="cart-card-price-unit"> / unit</span>
                          </div>
                        </div>

                        <div className="cart-card-actions">
                          <div className={`qty-stepper${isSyncing ? " is-syncing" : ""}`}>
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={item.qty <= 1}
                              onClick={() => updateCartItemQty(item.id, item.qty - 1)}
                            >
                              −
                            </button>
                            <span className="qty-value">{item.qty}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateCartItemQty(item.id, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-card-line-total">
                            {formatINR(item.products?.selling_price * item.qty)}
                          </div>

                          <button
                            type="button"
                            className="remove-btn"
                            aria-label={`Remove ${item.products?.product_name || "item"} from cart`}
                            onClick={() => removeFromCart(item.id)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.8 12.1A2 2 0 0 1 16.2 21H7.8a2 2 0 0 1-2-1.9L5 7h14Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <aside className="cart-summary-panel">
                <div className="cart-summary-card">
                  <h2>Order Summary</h2>
                  <div className="cart-summary-row">
                    <span>Items ({totalUnits()})</span>
                    <span>{formatINR(totalPrice())}</span>
                  </div>
                  <div className="cart-summary-divider" />
                  <div className="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <span>{formatINR(totalPrice())}</span>
                  </div>
                  <button className="checkout-btn">Proceed to Checkout</button>
                  <p className="cart-summary-note">
                    GST invoice included · Pickup available at Kandivali West
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      {!loading && cartItems.length > 0 && (
        <div className="cart-mobile-bar">
          <div className="cart-mobile-bar-total">
            <span className="cart-mobile-bar-label">Total</span>
            <span className="cart-mobile-bar-amount">{formatINR(totalPrice())}</span>
          </div>
          <button className="checkout-btn checkout-btn-mobile">Checkout</button>
        </div>
      )}

      <WebsiteFooter />
    </>
  )
}

export default Cart