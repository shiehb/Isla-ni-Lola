"use server"

import { updateProfile as updateProfileDb } from "@/lib/profiles"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  const fullName = formData.get("fullName") as string
  const avatarUrl = formData.get("avatarUrl") as string
  const bio = formData.get("bio") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string

  const result = await updateProfileDb(session.user.id, {
    full_name: fullName,
    avatar_url: avatarUrl,
    bio,
    phone,
    address,
  })

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath("/profile")
  return { success: true, message: "Profile updated successfully" }
}

// Re-export the updateProfile function to maintain compatibility

export async function changePassword(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  try {
    // First verify the current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return { error: "Current password is incorrect" }
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) throw updateError

    return { success: true, message: "Password changed successfully" }
  } catch (error: any) {
    console.error("Error changing password:", error)
    return { error: error.message || "Failed to change password" }
  }
}
