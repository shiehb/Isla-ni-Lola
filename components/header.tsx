"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { PostgrestSingleResponse } from "@supabase/postgrest-js"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { ShoppingBag, User, Shield, Menu, X, CheckCircle } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LogoutButton from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const prevUserRef = useRef(user)

  // Use a ref for the Supabase client to ensure it's only created once
  const supabaseRef = useRef(createClientSupabaseClient())
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const maxRetries = 3

  // Show welcome message when user logs in
  useEffect(() => {
    // Check if user changed from null/undefined to having a value (login)
    if (user && !prevUserRef.current) {
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Welcome back, {user.full_name || user.email}!</span>
        </div>,
        {
          duration: 3000,
        },
      )
      setHasShownWelcome(true)
    }

    // Check if user changed to null/undefined (logout)
    if (!user && prevUserRef.current) {
      setHasShownWelcome(false)
    }

    // Update the previous user ref
    prevUserRef.current = user
  }, [user])

  const fetchWithRetry = async (userId: string, attempts = 3) => {
    for (let i = 1; i <= attempts; i++) {
      try {
        const response = await supabaseRef.current.from("cart_items").select("quantity").eq("user_id", userId)

        const { data, error } = response as PostgrestSingleResponse<{ quantity: any }[]>

        if (error) {
          throw error
        }

        return data ? data.reduce((sum: number, item: { quantity: any }) => sum + (item.quantity || 0), 0) : 0
      } catch (err) {
        console.error(`Error fetching cart count (Attempt ${i}/${attempts}):`, err)
        if (i === attempts) throw err
        // Wait for 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    return 0
  }

  // Function to fetch cart count with retry logic
  const fetchCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0)
      setIsLoading(false)
      return
    }

    try {
      const count = await fetchWithRetry(user.id)
      setCartCount(count)
    } catch (error) {
      console.error("Failed to fetch cart count:", error)
      setCartCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Effect for initial cart count and polling setup
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (isMounted) {
        await fetchCartCount()

        // Set up polling for cart updates
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }

        if (user) {
          // Poll every 10 seconds for cart updates
          pollingIntervalRef.current = setInterval(() => {
            if (isMounted) {
              fetchCartCount()
            }
          }, 10000)
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [user, fetchCartCount])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className="border-b ">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl font-pacifico">
          Isla ni Lola
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/shop"
            className={`relative ${pathname === "/shop" ? "font-medium" : "text-gray-600 hover:text-gray-900"}`}
          >
            Menu
            {pathname === "/shop" && <span className="absolute left-0 bottom-[-6px] w-full h-[2px] bg-current"></span>}
          </Link>
          <Link
            href="/about-us"
            className={`relative ${pathname === "/about-us" ? "font-medium" : "text-gray-600 hover:text-gray-900"}`}
          >
            About Us
            {pathname === "/about-us" && (
              <span className="absolute left-0 bottom-[-6px] w-full h-[2px] bg-current"></span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 h-8 px-2">
                    <span className="text-sm">{user.full_name || user.email}</span>
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center cursor-pointer w-full">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <LogoutButton variant="ghost" size="sm" className="w-full justify-start px-2" />
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/cart" className="relative">
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden py-4 px-4 border-t">
          <ul className="space-y-4">
            <li>
              <Link href="/shop" className={`relative block ${pathname === "/shop" ? "font-medium" : "text-gray-600"}`}>
                Menu
                {pathname === "/shop" && (
                  <span className="absolute left-0 bottom-[-4px] w-full h-[2px] bg-current"></span>
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/about-us"
                className={`relative block ${pathname === "/about-us" ? "font-medium" : "text-gray-600"}`}
              >
                About Us
                {pathname === "/about-us" && (
                  <span className="absolute left-0 bottom-[-4px] w-full h-[2px] bg-current"></span>
                )}
              </Link>
            </li>
            {user && (
              <li>
                <Link href="/cart" className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Cart ({cartCount})
                </Link>
              </li>
            )}
            {user ? (
              <>
                <li>
                  <Link href="/profile" className="text-gray-600">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-600">
                    My Orders
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link href="/admin/dashboard" className="flex items-center text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <LogoutButton
                    variant="ghost"
                    className="p-0 h-auto text-gray-600 hover:bg-transparent hover:text-gray-900"
                  />
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="text-sm text-gray-600">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
