import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingBag, Eye } from "lucide-react"
import { getUserOrders } from "@/lib/orders"

export default async function OrdersPage() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: orders, error } = await getUserOrders(session.user.id)

  if (error) {
    console.error("Error fetching orders:", error)
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      {!orders || orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop">
              <Button className="mx-auto">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                    <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-xs font-medium`}>
                      {order.status.toUpperCase()}
                    </Badge>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {order.order_items &&
                    order.order_items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.products?.image_url ? (
                            <img
                              src={item.products.image_url || "/placeholder.svg"}
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{item.products?.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ₱{Number.parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₱{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  {order.order_items && order.order_items.length > 3 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      +{order.order_items.length - 3} more items
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 py-4">
                <p className="font-medium">Total</p>
                <p className="font-bold text-lg">₱{Number.parseFloat(order.total).toFixed(2)}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
