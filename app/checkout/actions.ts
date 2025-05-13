"use server"

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { createOrder as createOrderDb } from "@/lib/orders"

export async function createOrder(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "User not authenticated" }
  }

  // Get form data
  const shippingAddress = formData.get("address") as string
  const paymentMethod = formData.get("paymentMethod") as string
  const notes = formData.get("notes") as string
  const shippingFee = 50 // Fixed shipping fee

  // Create order
  const result = await createOrderDb(user.id, {
    shipping_address: shippingAddress,
    payment_method: paymentMethod,
    notes,
    shipping_fee: shippingFee,
  })

  if (result.error) {
    return { error: result.error }
  }

  return { success: true, orderId: result.data?.orderId }
}
