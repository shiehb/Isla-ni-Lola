import { getDbClient, executeDbOperation, type DbResult } from "@/lib/db-utils"
import { clearCart, getCartItems } from "@/lib/cart"

export type Order = {
  id: string
  user_id: string
  status: string
  total: string
  shipping_fee: string
  shipping_address?: string
  payment_method?: string
  payment_status?: string
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: string
  created_at: string
  products?: {
    id: string
    name: string
    image_url: string | null
    category: string | null
  }
}

/**
 * Get orders for a user
 */
export async function getUserOrders(userId: string): Promise<DbResult<Order[]>> {
  try {
    const supabase = getDbClient()
    return await executeDbOperation(() =>
      supabase
        .from("orders")
        .select(`
          id,
          user_id,
          status,
          total,
          shipping_fee,
          shipping_address,
          payment_method,
          payment_status,
          notes,
          created_at,
          updated_at,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (
              id,
              name,
              image_url,
              category
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    )
  } catch (error) {
    console.error("Error in getUserOrders:", error)
    return { data: null, error: "Failed to fetch orders" }
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string, userId: string): Promise<DbResult<Order>> {
  try {
    const supabase = getDbClient()
    return await executeDbOperation(() =>
      supabase
        .from("orders")
        .select(`
          id,
          user_id,
          status,
          total,
          shipping_fee,
          shipping_address,
          payment_method,
          payment_status,
          notes,
          created_at,
          updated_at,
          order_items (
            id,
            quantity,
            price,
            product_id,
            products (
              id,
              name,
              image_url,
              category
            )
          )
        `)
        .eq("id", orderId)
        .eq("user_id", userId)
        .single(),
    )
  } catch (error) {
    console.error("Error in getOrderById:", error)
    return { data: null, error: "Failed to fetch order" }
  }
}

/**
 * Create a new order from cart items
 */
export async function createOrder(
  userId: string,
  orderData: {
    shipping_address?: string
    payment_method?: string
    notes?: string
    shipping_fee: number
  },
): Promise<DbResult<{ orderId: string }>> {
  const supabase = getDbClient()

  // Start a transaction
  const { data: client } = await supabase.rpc("begin_transaction")

  try {
    // Get cart items
    const { data: cartItems, error: cartError } = await getCartItems(userId)

    if (cartError || !cartItems || cartItems.length === 0) {
      throw new Error(cartError || "Your cart is empty")
    }

    // Calculate total
    const subtotal = cartItems.reduce((total, item) => {
      return total + Number.parseFloat(item.products.price) * item.quantity
    }, 0)

    const total = subtotal + orderData.shipping_fee

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total,
        shipping_fee: orderData.shipping_fee,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
        payment_status: "pending",
        notes: orderData.notes,
      })
      .select()
      .single()

    if (orderError || !order) {
      throw orderError || new Error("Failed to create order")
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      throw itemsError
    }

    // Clear cart
    const { error: clearCartError } = await clearCart(userId)

    if (clearCartError) {
      throw new Error(clearCartError)
    }

    // Commit transaction
    await supabase.rpc("commit_transaction")

    return { data: { orderId: order.id }, error: null }
  } catch (error) {
    // Rollback transaction
    await supabase.rpc("rollback_transaction")

    console.error("Error in createOrder:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create order"
    return { data: null, error: errorMessage }
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(orderId: string, status: string, isAdmin: boolean): Promise<DbResult<null>> {
  try {
    if (!isAdmin) {
      return { data: null, error: "Unauthorized" }
    }

    const supabase = getDbClient()
    return await executeDbOperation(async () => {
      const { error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      return { data: null, error }
    })
  } catch (error) {
    console.error("Error in updateOrderStatus:", error)
    return { data: null, error: "Failed to update order status" }
  }
}
