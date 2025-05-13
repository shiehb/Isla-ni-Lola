"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "./actions"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfileFormProps {
  profile: {
    full_name: string
    avatar_url: string
    bio?: string
    phone?: string
    address?: string
  }
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [phone, setPhone] = useState(profile.phone || "")
  const [address, setAddress] = useState(profile.address || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append("fullName", fullName)
    formData.append("avatarUrl", avatarUrl)
    formData.append("bio", bio)
    formData.append("phone", phone)
    formData.append("address", address)

    const result = await updateProfile(formData)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result.success) {
      setMessage({ type: "success", text: result.message || "Profile updated successfully" })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert
          className={`${message.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <AlertDescription className={message.type === "success" ? "text-green-700" : "text-red-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Profile Picture URL</Label>
        <Input
          id="avatarUrl"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/your-image.jpg"
        />
        <p className="text-sm text-gray-500">
          Enter a URL to an image for your profile picture, or leave blank to use the default
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a little about yourself"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Delivery Address</Label>
        <Textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your delivery address"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  )
}
