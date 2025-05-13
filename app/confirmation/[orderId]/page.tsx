import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase"

async function getOrder(orderId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function Confirmation({ params }: { params: { orderId: string } }) {
  const order = await getOrder(params.orderId)

  if (!order) {
    notFound()
  }

  // Generate a random reference number
  const refNumber = `${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)}`

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Order Confirmation</h1>
      <div className="border-b border-gray-300 mb-6"></div>

      <div className="max-w-md mx-auto">
        <div className="border rounded-md p-8 text-center mb-8">
          <h2 className="text-2xl font-bold mb-6">SUCCESS</h2>

          <div className="space-y-4 text-left mb-6">
            <div className="flex justify-between">
              <span>AMOUNT PAID:</span>
              <span>PHP {Number.parseFloat(order.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>ORDER NUMBER:</span>
              <span>{order.id.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span>REF NUMBER:</span>
              <span>{refNumber}</span>
            </div>
          </div>

          <Link href="/">
            <Button className="w-full bg-gray-700 hover:bg-gray-800">OKAY</Button>
          </Link>
        </div>

        <p className="text-center">Please wait. The regional branch will call you shortly.</p>
      </div>
    </div>
  )
}
