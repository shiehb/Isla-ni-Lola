import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient()

  // Verify admin access
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin/dashboard")
  }

  // Fetch counts for dashboard
  const { data: userCount } = await supabase.from("profiles").select("id", { count: "exact", head: true })
  const { data: productCount } = await supabase.from("products").select("id", { count: "exact", head: true })
  const { data: orderCount } = await supabase.from("orders").select("id", { count: "exact", head: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Users</CardTitle>
            <CardDescription>Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{userCount?.count || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Products</CardTitle>
            <CardDescription>Total products in catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{productCount?.count || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Orders</CardTitle>
            <CardDescription>Total customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{orderCount?.count || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Admin Quick Links</CardTitle>
              <CardDescription>Manage your store from these quick links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/products" className="block p-4 border rounded-lg hover:bg-gray-50">
                  Manage Products
                </Link>
                <Link href="/admin/orders" className="block p-4 border rounded-lg hover:bg-gray-50">
                  Manage Orders
                </Link>
                <Link href="/admin/users" className="block p-4 border rounded-lg hover:bg-gray-50">
                  Manage Users
                </Link>
                <Link href="/admin/settings" className="block p-4 border rounded-lg hover:bg-gray-50">
                  Store Settings
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 italic">No recent activity to display.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
