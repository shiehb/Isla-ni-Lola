"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function RegistrationSuccess() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email"

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>We've sent a confirmation link to your email address</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 pt-4">
          <Mail className="h-16 w-16 text-gray-400 mb-2" />
          <p className="text-center">
            We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click the
            confirmation link to activate your account.
          </p>
          <div className="text-sm text-gray-500 text-center mt-2">
            <p>If you don't see the email, check your spam folder or junk mail.</p>
            <p className="mt-2">The confirmation link will expire in 24 hours.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
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
