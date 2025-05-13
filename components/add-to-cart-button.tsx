"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { addToCart } from "@/lib/cart-actions"

interface AddToCartButtonProps {
  productId: string
  quantity?: number
  className?: string
  showIcon?: boolean
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function AddToCartButton({
  productId,
  quantity = 1,
  className = "",
  showIcon = true,
  variant = "default",
  size = "default",
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      const result = await addToCart(productId, quantity)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      })

      // Refresh the page to update cart count
      router.refresh()
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isLoading} className={className} variant={variant} size={size}>
      {isLoading ? (
        "Adding..."
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
          Add to Cart
        </>
      )}
    </Button>
  )
}
