import { Users, ShoppingBag, Package } from "lucide-react"

interface StatsProps {
  stats: {
    usersCount: number
    productsCount: number
    ordersCount: number
    recentOrders: any[]
  }
}

export default function AdminDashboardStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Users card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.usersCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="/admin/users" className="font-medium text-indigo-600 hover:text-indigo-500">
              View all
            </a>
          </div>
        </div>
      </div>

      {/* Products card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.productsCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="/admin/products" className="font-medium text-pink-600 hover:text-pink-500">
              View all
            </a>
          </div>
        </div>
      </div>

      {/* Orders card */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{stats.ordersCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a href="/admin/orders" className="font-medium text-yellow-600 hover:text-yellow-500">
              View all
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
