import { supabase } from "../config/supabase"

// ADD TO CART
export const addToCart = async (userId, productId) => {
    const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single()

    if (existing) {
        return await supabase
            .from("cart_items")
            .update({ qty: existing.qty + 1 })
            .eq("id", existing.id)
    }

    return await supabase
        .from("cart_items")
        .insert([{ user_id: userId, product_id: productId, qty: 1 }])
}

// GET CART
export const getCart = async (userId) => {
    return await supabase
        .from("cart_items")
        .select(`
            id,
            qty,
            product_id,
            products (
                id,
                product_name,
                selling_price,
                image_url
            )
        `)
        .eq("user_id", userId)
}

// REMOVE ITEM
export const removeFromCart = async (id) => {
    return await supabase
        .from("cart_items")
        .delete()
        .eq("id", id)
}

// UPDATE QTY
export const updateQty = async (id, qty) => {
    return await supabase
        .from("cart_items")
        .update({ qty })
        .eq("id", id)
}

// CLEAR CART
export const clearCart = async (userId) => {
    return await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
}