"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart-actions"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Minus, Plus, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/auth-context"

export default function CartItemQuantity({ itemId, initialQuantity }: { itemId: string; initialQuantity: number }) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!user) return

    if (newQuantity < 1) {
      // Open confirmation dialog if quantity is less than 1
      setIsDialogOpen(true)
      return
    }

    if (newQuantity > 99) {
      toast({
        title: "Maximum quantity reached",
        description: "You cannot add more than 99 of the same item",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await updateCartItemQuantity(itemId, newQuantity)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setQuantity(newQuantity)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = async () => {
    if (!user) return

    setIsRemoving(true)

    try {
      const result = await removeCartItem(itemId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        setIsRemoving(false)
      } else {
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
      setIsRemoving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1) {
      setQuantity(value)
    }
  }

  const handleInputBlur = () => {
    if (quantity !== initialQuantity) {
      handleUpdateQuantity(quantity)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  return (
    <div className="flex items-center mt-2">
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-r-none"
          onClick={() => handleUpdateQuantity(quantity - 1)}
          disabled={isLoading || isRemoving}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="1"
          max="99"
          disabled={isLoading || isRemoving}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-l-none"
          onClick={() => handleUpdateQuantity(quantity + 1)}
          disabled={isLoading || isRemoving}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 text-gray-500 hover:text-red-500"
            disabled={isLoading || isRemoving}
          >
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to remove this item from your cart?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveItem} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
