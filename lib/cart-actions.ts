"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function addToCart(productId: string, quantity = 1) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to add items to your cart" }
    }

    const userId = session.user.id

    // Check if the product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      console.error("Product not found:", productError)
      return { error: "Product not found" }
    }

    // Check if the item is already in the cart
    const { data: existingItem, error: existingItemError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (existingItemError && existingItemError.code !== "PGRST116") {
      console.error("Error checking cart:", existingItemError)
      return { error: "Failed to check cart" }
    }

    let result

    if (existingItem) {
      // Update the quantity
      const newQuantity = existingItem.quantity + quantity

      result = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", existingItem.id)
    } else {
      // Add new item to cart
      result = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
    }

    if (result.error) {
      console.error("Error updating cart:", result.error)
      return { error: "Failed to update cart" }
    }

    // Revalidate the cart page to reflect changes
    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error adding to cart:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to update your cart" }
    }

    const userId = session.user.id

    // Verify the item belongs to the user
    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", userId)
      .single()

    if (itemError || !item) {
      console.error("Cart item not found or doesn't belong to user:", itemError)
      return { error: "Cart item not found" }
    }

    if (quantity <= 0) {
      // Remove the item if quantity is 0 or negative
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) {
        console.error("Error removing cart item:", error)
        return { error: "Failed to remove item from cart" }
      }
    } else {
      // Update the quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", itemId)

      if (error) {
        console.error("Error updating cart item:", error)
        return { error: "Failed to update cart" }
      }
    }

    // Revalidate the cart page to reflect changes
    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating cart:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function removeCartItem(itemId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to remove items from your cart" }
    }

    const userId = session.user.id

    // Verify the item belongs to the user
    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", userId)
      .single()

    if (itemError || !item) {
      console.error("Cart item not found or doesn't belong to user:", itemError)
      return { error: "Cart item not found" }
    }

    // Remove the item
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

    if (error) {
      console.error("Error removing cart item:", error)
      return { error: "Failed to remove item from cart" }
    }

    // Revalidate the cart page to reflect changes
    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error removing from cart:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function clearCart() {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to clear your cart" }
    }

    const userId = session.user.id

    // Remove all items for this user
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (error) {
      console.error("Error clearing cart:", error)
      return { error: "Failed to clear cart" }
    }

    // Revalidate the cart page to reflect changes
    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error clearing cart:", error)
    return { error: "An unexpected error occurred" }
  }
}
