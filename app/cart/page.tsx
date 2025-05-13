'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, ShoppingBag, ArrowRight } from 'lucide-react'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('guest_cart')
    if (stored) {
      setCartItems(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const handleQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shippingFee = 50
  const total = subtotal + shippingFee
  const placeholderImage = '/placeholder.svg'

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      <div className="border-b border-gray-300 mb-6" />

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
            <Link href="/shop">
              <Button className="mx-auto">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section: Items and Special Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cartItems.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b last:border-0">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                      <Image
                        src={placeholderImage}
                        alt={item.name}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-gray-600 font-medium">₱{item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2 gap-2">
                        <span className="text-sm">QUANTITY:</span>
                        <Button size="sm" onClick={() => handleQuantity(item.id, -1)}>-</Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button size="sm" onClick={() => handleQuantity(item.id, 1)}>+</Button>
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full border rounded-md p-2 h-32"
                  placeholder="e.g. no mayo, extra cheese"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Section: Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₱{shippingFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/checkout" className="w-full">
                  <Button className="w-full">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
