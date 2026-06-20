import { supabase } from "../config/supabase"

// CREATE BILL
export const createBill = async ({
    userId,
    customerName,
    customerPhone,
    cartItems,
    paymentMode = "cash"
}) => {

    // 1. Calculate totals
    let subtotal = 0

    cartItems.forEach(item => {
        subtotal += item.qty * item.products.selling_price
    })

    const gst = subtotal * 0.18
    const grandTotal = subtotal + gst

    // 2. Create bill number
    const billNo = "BILL-" + Date.now()

    // 3. Insert bill
    const { data: bill, error: billError } = await supabase
        .from("bills")
        .insert([{
            bill_no: billNo,
            customer_name: customerName,
            customer_phone: customerPhone,
            subtotal,
            gst,
            grand_total: grandTotal,
            payment_mode: paymentMode,
            created_by: userId,
            paid_amount: grandTotal,
            pending_amount: 0
        }])
        .select()
        .single()

    if (billError) throw billError

    // 4. Insert bill items
    const billItems = cartItems.map(item => ({
        bill_id: bill.id,
        product_id: item.product_id,
        qty: item.qty,
        price: item.products.selling_price,
        product_name: item.products.product_name
    }))

    const { error: itemError } = await supabase
        .from("bill_items")
        .insert(billItems)

    if (itemError) throw itemError

    // 5. Clear cart
    await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)

    return bill
}