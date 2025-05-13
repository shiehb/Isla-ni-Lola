import { getDbClient, executeDbOperation, type DbResult } from "@/lib/db-utils"

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  products: {
    id: string
    name: string
    price: string
    image_url: string | null
    category: string | null
  }
}

/**
 * Get cart items for a user
 */
export async function getCartItems(userId: string): Promise<DbResult<CartItem[]>> {
  try {
    const supabase = getDbClient()
    return await executeDbOperation(() =>
      supabase
        .from("cart_items")
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          created_at,
          updated_at,
          products (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .eq("user_id", userId),
    )
  } catch (error) {
    console.error("Error in getCartItems:", error)
    return { data: null, error: "Failed to fetch cart items" }
  }
}

/**
 * Add item to cart
 */
export async function addToCart(userId: string, productId: string, quantity: number): Promise<DbResult<null>> {
  try {
    const supabase = getDbClient()

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", existingItem.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })

      if (insertError) {
        throw insertError
      }
    }

    return { data: null, error: null }
  } catch (error) {
    console.error("Error in addToCart:", error)
    return { data: null, error: "Failed to add item to cart" }
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<DbResult<null>> {
  try {
    const supabase = getDbClient()

    if (quantity < 1) {
      return { data: null, error: "Quantity must be at least 1" }
    }

    return await executeDbOperation(async () => {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)

      return { data: null, error }
    })
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error)
    return { data: null, error: "Failed to update cart item" }
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string): Promise<DbResult<null>> {
  try {
    const supabase = getDbClient()
    return await executeDbOperation(async () => {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      return { data: null, error }
    })
  } catch (error) {
    console.error("Error in removeCartItem:", error)
    return { data: null, error: "Failed to remove item from cart" }
  }
}

/**
 * Get cart count for a user
 */
export async function getCartCount(userId: string): Promise<DbResult<number>> {
  try {
    const supabase = getDbClient()
    const { data, error } = await supabase.from("cart_items").select("id", { count: "exact" }).eq("user_id", userId)

    if (error) {
      throw error
    }

    return { data: data.length, error: null }
  } catch (error) {
    console.error("Error in getCartCount:", error)
    return { data: null, error: "Failed to get cart count" }
  }
}

/**
 * Clear cart for a user
 */
export async function clearCart(userId: string): Promise<DbResult<null>> {
  try {
    const supabase = getDbClient()
    return await executeDbOperation(async () => {
      const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

      return { data: null, error }
    })
  } catch (error) {
    console.error("Error in clearCart:", error)
    return { data: null, error: "Failed to clear cart" }
  }
}
