"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function EmailConfirmation() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email_confirmation") {
          setError("Invalid confirmation link. Please request a new one.")
          setIsLoading(false)
          return
        }

        // Confirm the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email_confirmation",
        })

        if (error) {
          setError(error.message || "Failed to confirm email. The link may have expired.")
          setIsSuccess(false)
        } else {
          setIsSuccess(true)
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred")
        setIsSuccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams, supabase, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Confirming your email address...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{isSuccess ? "Email Confirmed" : "Confirmation Failed"}</CardTitle>
          <CardDescription>
            {isSuccess ? "Your email has been successfully confirmed" : "There was a problem confirming your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="mb-6">
                Your email address has been confirmed successfully. You can now log in to your account.
              </p>
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  If your confirmation link has expired or is invalid, you can request a new one by attempting to log
                  in.
                </p>
                <Button onClick={() => router.push("/login")} className="w-full">
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 w-full">
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
