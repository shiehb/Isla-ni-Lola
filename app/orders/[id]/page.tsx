import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ArrowLeft, MapPin, Truck, Calendar } from "lucide-react"
import { getOrderById } from "@/lib/orders"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: order, error } = await getOrderById(params.id, session.user.id)

  if (error || !order) {
    console.error("Error fetching order:", error)
    notFound()
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

  // Calculate subtotal
  const subtotal = Number.parseFloat(order.total) - Number.parseFloat(order.shipping_fee)

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

  // Helper function to get estimated delivery date (just for display purposes)
  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.created_at)
    const deliveryDate = new Date(orderDate)
    deliveryDate.setDate(orderDate.getDate() + 3) // Assuming 3 days delivery time

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(deliveryDate)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-gray-50">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                </div>
                <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>{order.status.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.order_items &&
                  order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-6">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.products?.image_url ? (
                          <Image
                            src={item.products.image_url || "/placeholder.svg"}
                            alt={item.products.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <Link href={`/product/${item.products?.id}`} className="hover:underline">
                          <p className="font-medium">{item.products?.name}</p>
                        </Link>
                        <p className="text-sm text-gray-500">{item.products?.category}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ₱{Number.parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₱{(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-gray-600">{order.shipping_address || "123 Main Street, Barangay Example"}</p>
                  <p className="text-gray-600">Manila, Metro Manila, 1000</p>
                  <p className="text-gray-600">Philippines</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Shipping Method</p>
                  <p className="text-gray-600">Standard Delivery</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-gray-600">{getEstimatedDelivery()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span>₱{Number.parseFloat(order.shipping_fee).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₱{Number.parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button className="w-full" variant="outline">
                Need Help?
              </Button>
              {order.status === "pending" && (
                <Button className="w-full" variant="destructive">
                  Cancel Order
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
