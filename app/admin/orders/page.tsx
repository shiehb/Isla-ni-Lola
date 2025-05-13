import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import AdminLayout from "@/components/admin/layout"

async function getUserRole(userId: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (error || !data) {
    return null
  }

  return data.role
}

export default async function AdminOrdersPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const role = await getUserRole(session.user.id)

  if (role !== "admin") {
    redirect("/")
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Order management functionality coming soon.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
