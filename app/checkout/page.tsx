import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase"
import { createOrder } from "./actions"

async function getCartSummary(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      quantity,
      products (
        name,
        price
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching cart summary:", error)
    return { items: [], subtotal: 0 }
  }

  const items = data || []
  const subtotal = items.reduce((total, item) => {
    return total + Number.parseFloat(item.products.price) * item.quantity
  }, 0)

  return { items, subtotal }
}

export default async function Checkout() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { items, subtotal } = await getCartSummary(session.user.id)

  if (items.length === 0) {
    redirect("/cart")
  }

  const shippingFee = 50
  const total = subtotal + shippingFee

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <div className="border-b border-gray-300 mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form action={createOrder}>
            {/* Payment Section */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">PAYMENT</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bankType" className="block text-sm mb-1">
                    BANK TYPE
                  </label>
                  <select id="bankType" name="bankType" className="w-full border rounded-md p-2">
                    <option value="">Select bank</option>
                    <option value="bdo">BDO</option>
                    <option value="bpi">BPI</option>
                    <option value="metrobank">Metrobank</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="accountName" className="block text-sm mb-1">
                    ACCOUNT NAME
                  </label>
                  <input type="text" id="accountName" name="accountName" className="w-full border rounded-md p-2" />
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-sm mb-1">
                    ACCOUNT NUMBER
                  </label>
                  <input type="text" id="accountNumber" name="accountNumber" className="w-full border rounded-md p-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expirationDate" className="block text-sm mb-1">
                      EXPIRATION DATE
                    </label>
                    <input
                      type="text"
                      id="expirationDate"
                      name="expirationDate"
                      className="w-full border rounded-md p-2"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm mb-1">
                      CVV
                    </label>
                    <input type="text" id="cvv" name="cvv" className="w-full border rounded-md p-2" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">*For card payments</p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">CONTACT</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm mb-1">
                      FIRST NAME
                    </label>
                    <input type="text" id="firstName" name="firstName" className="w-full border rounded-md p-2" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm mb-1">
                      LAST NAME
                    </label>
                    <input type="text" id="lastName" name="lastName" className="w-full border rounded-md p-2" />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm mb-1">
                    PHONE NUMBER
                  </label>
                  <input type="tel" id="phoneNumber" name="phoneNumber" className="w-full border rounded-md p-2" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm mb-1">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={session.user.email || ""}
                    className="w-full border rounded-md p-2"
                  />
                </div>
              </div>
            </section>

            {/* Delivery Section */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">DELIVERY</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="region" className="block text-sm mb-1">
                    REGIONAL BRANCH
                  </label>
                  <select id="region" name="region" className="w-full border rounded-md p-2">
                    <option value="">Select region</option>
                    <option value="ncr">NCR</option>
                    <option value="luzon">Luzon</option>
                    <option value="visayas">Visayas</option>
                    <option value="mindanao">Mindanao</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm mb-1">
                    CITY
                  </label>
                  <select id="city" name="city" className="w-full border rounded-md p-2">
                    <option value="">Select city</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="barangay" className="block text-sm mb-1">
                      BARANGAY
                    </label>
                    <select id="barangay" name="barangay" className="w-full border rounded-md p-2">
                      <option value="">Select barangay</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm mb-1">
                      POSTAL CODE
                    </label>
                    <input type="text" id="postalCode" name="postalCode" className="w-full border rounded-md p-2" />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm mb-1">
                    BLOCK / LOT (Input exact location/landmark)
                  </label>
                  <input type="text" id="address" name="address" className="w-full border rounded-md p-2" />
                </div>
              </div>
            </section>

            {/* Order Summary for Mobile */}
            <div className="lg:hidden mb-8">
              <div className="border rounded-md p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.products.name} × {item.quantity}
                      </span>
                      <span>PHP {(Number.parseFloat(item.products.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>PHP {shippingFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>PHP {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full lg:hidden bg-gray-700 hover:bg-gray-800">
              PAY NOW
            </Button>
          </form>
        </div>

        {/* Order Summary for Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="border rounded-md p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.products.name} × {item.quantity}
                  </span>
                  <span>PHP {(Number.parseFloat(item.products.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>PHP {shippingFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>PHP {total.toFixed(2)}</span>
              </div>
            </div>
            <form action={createOrder}>
              <Button type="submit" className="w-full bg-gray-700 hover:bg-gray-800">
                PAY NOW
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
