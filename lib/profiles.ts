import { getDbClient, executeDbOperation, type DbResult } from "@/lib/db-utils"

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  address: string | null
  role: string
  email_confirmed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Get a user profile by ID
 */
export async function getProfileById(userId: string): Promise<DbResult<Profile>> {
  try {
    const supabase = getDbClient()
    return await executeDbOperation(() => supabase.from("profiles").select("*").eq("id", userId).single())
  } catch (error) {
    console.error("Error in getProfileById:", error)
    return { data: null, error: "Failed to fetch profile" }
  }
}

/**
 * Update a user profile
 */
export async function updateProfile(
  userId: string,
  profileData: {
    full_name?: string
    avatar_url?: string
    bio?: string
    phone?: string
    address?: string
  },
): Promise<DbResult<null>> {
  try {
    const supabase = getDbClient()
    return await executeDbOperation(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      return { data: null, error }
    })
  } catch (error) {
    console.error("Error in updateProfile:", error)
    return { data: null, error: "Failed to update profile" }
  }
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = getDbClient()
    const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

    if (error || !data) {
      return false
    }

    return data.role === "admin"
  } catch (error) {
    console.error("Error in isUserAdmin:", error)
    return false
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(isAdmin: boolean): Promise<DbResult<Profile[]>> {
  try {
    if (!isAdmin) {
      return { data: null, error: "Unauthorized" }
    }

    const supabase = getDbClient()
    return await executeDbOperation(() =>
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    )
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return { data: null, error: "Failed to fetch users" }
  }
}
