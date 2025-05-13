"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Edit, Trash2, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface UserType {
  id: string
  full_name: string
  email: string
  avatar_url: string
  role: string
  created_at: string
}

export default function UsersList({ users: initialUsers }: { users: UserType[] }) {
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const handleEditUser = (user: UserType) => {
    setCurrentUser(user)
    setEditName(user.full_name)
    setEditRole(user.role)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: UserType) => {
    setCurrentUser(user)
    setIsDeleteDialogOpen(true)
  }

  const saveUserChanges = async () => {
    if (!currentUser) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
          role: editRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id)

      if (error) throw error

      // Update local state
      setUsers(
        users.map((user) => (user.id === currentUser.id ? { ...user, full_name: editName, role: editRole } : user)),
      )

      toast({
        title: "User updated",
        description: "User information has been updated successfully",
      })

      setIsEditDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteUser = async () => {
    if (!currentUser) return

    setIsLoading(true)

    try {
      // First delete from profiles table
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", currentUser.id)

      if (profileError) throw profileError

      // Then delete the auth user (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.id)

      if (authError) throw authError

      // Update local state
      setUsers(users.filter((user) => user.id !== currentUser.id))

      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={user.avatar_url || "/placeholder.svg?height=40&width=40"}
                      alt={user.full_name}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user&apos;s information here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserChanges} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              User: <span className="font-medium text-gray-900">{currentUser?.full_name}</span>
            </p>
            <p className="text-sm text-gray-500">
              Email: <span className="font-medium text-gray-900">{currentUser?.email}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
