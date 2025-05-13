import { createServerSupabaseClient } from "./supabase"

export type Product = {
  id: string
  name: string
  description: string | null
  details: string | null
  ingredients: string | null
  nutrition: string | null
  price: string
  category: string | null
  image_url: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all products with optional filtering
 */
export async function getProducts(
  options: {
    searchQuery?: string
    category?: string
    featured?: boolean
    limit?: number
    offset?: number
  } = {},
): Promise<{ data: Product[] | null; error: any }> {
  const { searchQuery, category, featured, limit = 100, offset = 0 } = options

  try {
    const supabase = createServerSupabaseClient()
    let query = supabase.from("products").select("*")

    // Apply filters
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (featured !== undefined) {
      query = query.eq("is_featured", featured)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("name")

    const { data, error } = await query

    if (error) {
      console.error("Error in getProducts:", error)
      return { data: null, error: "Failed to fetch products" }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in getProducts:", error)
    return { data: null, error: "Failed to fetch products" }
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<{ data: Product | null; error: any }> {
  try {
    if (!id || typeof id !== "string") {
      return { data: null, error: "Invalid product ID" }
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error in getProductById:", error)
      return { data: null, error: "Failed to fetch product" }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in getProductById:", error)
    return { data: null, error: "Failed to fetch product" }
  }
}

/**
 * Get related products (same category, excluding current product)
 * Fixed to handle UUID validation properly
 */
export async function getRelatedProducts(
  productId: string,
  category: string | null,
): Promise<{ data: Product[] | null; error: any }> {
  try {
    // Validate inputs
    if (!productId || typeof productId !== "string") {
      console.warn("Invalid productId in getRelatedProducts:", productId)
      return { data: [], error: null }
    }

    if (!category) {
      console.warn("Missing category in getRelatedProducts")
      return { data: [], error: null }
    }

    // Validate UUID format to prevent SQL errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(productId)) {
      console.error(`Invalid UUID format for productId: ${productId}`)
      return { data: [], error: null }
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", productId)
      .limit(4)

    if (error) {
      console.error("Error in getRelatedProducts:", error)
      return { data: null, error: "Failed to fetch related products" }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in getRelatedProducts:", error)
    return { data: [], error: null } // Return empty array instead of error to prevent UI issues
  }
}

/**
 * Get all unique product categories
 */
export async function getProductCategories(): Promise<{ data: string[] | null; error: any }> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null)
      .order("category")

    if (error) {
      console.error("Error in getProductCategories:", error)
      return { data: null, error: "Failed to fetch product categories" }
    }

    // Extract unique categories
    const categories = [...new Set(data.map((item) => item.category))].filter(Boolean)
    return { data: categories, error: null }
  } catch (error) {
    console.error("Error in getProductCategories:", error)
    return { data: null, error: "Failed to fetch product categories" }
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 4): Promise<{ data: Product[] | null; error: any }> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .order("name")
      .limit(limit)

    if (error) {
      console.error("Error in getFeaturedProducts:", error)
      return { data: null, error: "Failed to fetch featured products" }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error)
    return { data: null, error: "Failed to fetch featured products" }
  }
}
