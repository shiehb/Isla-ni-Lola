"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Users, ShoppingBag, Package, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/logout-button"

export default function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <span className="font-bold">ARQUILITAS Admin</span>
        <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <nav className="bg-gray-800 text-white p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center p-2 rounded-md ${
                  pathname === "/admin/dashboard" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={closeMenu}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`flex items-center p-2 rounded-md ${
                  pathname === "/admin/users" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={closeMenu}
              >
                <Users className="mr-3 h-5 w-5" />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className={`flex items-center p-2 rounded-md ${
                  pathname === "/admin/products" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={closeMenu}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className={`flex items-center p-2 rounded-md ${
                  pathname === "/admin/orders" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={closeMenu}
              >
                <Package className="mr-3 h-5 w-5" />
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className={`flex items-center p-2 rounded-md ${
                  pathname === "/admin/settings" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={closeMenu}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="/admin/help"
                className={`flex items-center p-2 rounded-md ${
                  pathname === "/admin/help" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={closeMenu}
              >
                <HelpCircle className="mr-3 h-5 w-5" />
                Help & Documentation
              </Link>
            </li>
            <li className="pt-4 mt-4 border-t border-gray-700">
              <Link href="/" className="flex items-center p-2 rounded-md hover:bg-gray-700" onClick={closeMenu}>
                Back to Site
              </Link>
            </li>
            <li>
              <LogoutButton
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-700 p-2 rounded-md"
                onClick={closeMenu}
              />
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
