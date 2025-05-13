import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase"
import ProfileForm from "./profile-form"
import PasswordForm from "./password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getProfile(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export default async function ProfilePage() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const profile = await getProfile(session.user.id)

  if (!profile) {
    // If profile doesn't exist, create one
    await supabase.from("profiles").insert({
      id: session.user.id,
      full_name: "",
      avatar_url: "",
    })

    // Refresh the page to get the new profile
    redirect("/profile")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg">
            <Image
              src={profile.avatar_url || "/placeholder.svg?height=128&width=128"}
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold">{profile.full_name || "Set your name"}</h2>
            <p className="text-gray-600">{session.user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
