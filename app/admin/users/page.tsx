import { requireAdmin } from "@/lib/auth-helpers"
import { createServerSupabaseClient } from "@/lib/supabase"
import AdminLayout from "@/components/admin/layout"
import UsersList from "@/components/admin/users-list"

async function getUsers() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_url,
      role,
      created_at,
      updated_at,
      auth_users:id (email)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data.map((user) => ({
    ...user,
    email: user.auth_users?.email,
  }))
}

export default async function AdminUsersPage() {
  // This will redirect if not an admin
  await requireAdmin()

  const users = await getUsers()

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        <UsersList users={users} />
      </div>
    </AdminLayout>
  )
}
