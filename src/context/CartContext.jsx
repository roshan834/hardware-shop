import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    const exists = cart.find(
      item => item.id === product.id
    )

    if (exists) {
      setCart(
        cart.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1
        }
      ])
    }
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const updateQuantity = (id, qty) => {
    if (qty < 1) return

    setCart(
      cart.map(item =>
        item.id === id
          ? { ...item, quantity: qty }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)