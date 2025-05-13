"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  onClick?: () => void
}

export default function LogoutButton({
  variant = "default",
  size = "default",
  className = "",
  onClick,
}: LogoutButtonProps) {
  const { logout } = useAuth()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()

      // Call the onClick handler if provided (e.g., to close mobile menu)
      if (onClick) {
        onClick()
      }
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
      setIsConfirmOpen(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsConfirmOpen(true)}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          "Logging out..."
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </>
        )}
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>You will need to login again to access your account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
