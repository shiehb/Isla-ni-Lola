import Link from "next/link"
import type { ReactNode } from "react"
import { LayoutDashboard, Users, ShoppingBag, Package, Settings, HelpCircle } from "lucide-react"
import AdminMobileNav from "./mobile-nav"
import LogoutButton from "@/components/logout-button"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Mobile Navigation */}
      <AdminMobileNav />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-gray-800">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <span className="text-white text-xl font-bold">ARQUILITAS Admin</span>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  <Link
                    href="/admin/dashboard"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
                  >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/users"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
                  >
                    <Users className="mr-3 h-5 w-5" />
                    Users
                  </Link>
                  <Link
                    href="/admin/products"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
                  >
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    Products
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
                  >
                    <Package className="mr-3 h-5 w-5" />
                    Orders
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </Link>
                  <Link
                    href="/admin/help"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
                  >
                    <HelpCircle className="mr-3 h-5 w-5" />
                    Help & Documentation
                  </Link>
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <Link
                      href="/"
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-gray-700"
                    >
                      Back to Site
                    </Link>
                    <LogoutButton
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-gray-700 px-2 py-2 text-sm font-medium rounded-md"
                    />
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">{children}</main>
        </div>
      </div>
    </div>
  )
}
