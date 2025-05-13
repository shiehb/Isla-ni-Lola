"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addToCart } from "@/lib/cart-actions"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Loader2, ShoppingBag } from "lucide-react"

interface ProductQuantitySelectorProps {
  productId: string
  initialQuantity?: number
}

export default function ProductQuantitySelector({ productId, initialQuantity = 1 }: ProductQuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, 99))
  }

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setQuantity(value)
    } else if (e.target.value === "") {
      setQuantity(1)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      const result = await addToCart(user.id, productId, quantity)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Added to cart",
          description: `${quantity} item${quantity > 1 ? "s" : ""} added to your cart`,
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="quantity">Quantity</Label>
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= 1 || isLoading}
          className="h-10 w-10 rounded-r-none"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id="quantity"
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={handleChange}
          className="h-10 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={quantity >= 99 || isLoading}
          className="h-10 w-10 rounded-l-none"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="pt-4">
        <Button onClick={handleAddToCart} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding to Cart...
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
