import { createServerSupabaseClient } from "@/lib/supabase"
import type { PostgrestError } from "@supabase/supabase-js"

export type DbResult<T> = {
  data: T | null
  error: string | null
}

/**
 * Executes a database operation with error handling
 */
export async function executeDbOperation<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
): Promise<DbResult<T>> {
  try {
    const { data, error } = await operation()

    if (error) {
      console.error("Database operation error:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected database error:", err)
    const errorMessage = err instanceof Error ? err.message : "An unexpected database error occurred"
    return { data: null, error: errorMessage }
  }
}

/**
 * Gets a database client with error handling
 */
export function getDbClient() {
  try {
    return createServerSupabaseClient()
  } catch (err) {
    console.error("Failed to create database client:", err)
    throw new Error("Failed to connect to the database")
  }
}

/**
 * Handles database connection errors
 */
export function handleConnectionError(error: unknown): never {
  console.error("Database connection error:", error)
  throw new Error("Failed to connect to the database. Please try again later.")
}
