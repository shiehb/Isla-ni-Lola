import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Update the requireAuth function to properly check for email confirmation
export async function requireAuth() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user details to check if email is confirmed
  const { data } = await supabase.auth.admin.getUserById(session.user.id)

  // Check if email is confirmed
  if (!data?.user?.email_confirmed_at) {
    redirect("/login?error=Please+confirm+your+email+address+before+accessing+this+page")
  }

  return session
}

// Update the requireAdmin function to properly check for admin role
export async function requireAdmin() {
  const session = await requireAuth()

  const supabase = createServerSupabaseClient()
  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (error || !profile || profile.role !== "admin") {
    redirect("/")
  }

  return session
}

export async function getUserRole(userId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (error || !data) {
    return null
  }

  return data.role
}

export async function isEmailConfirmed(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.admin.getUserById(userId)

  if (error || !data.user) {
    return false
  }

  return !!data.user.email_confirmed_at
}
