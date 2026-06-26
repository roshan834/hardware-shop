import Razorpay from "npm:razorpay@2.9.2"

const razorpay = new Razorpay({
  key_id: Deno.env.get("RAZORPAY_KEY_ID")!,
  key_secret: Deno.env.get("RAZORPAY_KEY_SECRET")!
})

Deno.serve(async (req) => {
  try {

    const { amount } = await req.json()

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `ORD_${Date.now()}`
    })

    return new Response(
      JSON.stringify(order),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

  } catch (error: any) {
  return new Response(
    JSON.stringify({
      error: error?.message || "Unknown error"
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
}
})