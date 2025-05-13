import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthError() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-2 rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            There was a problem with your authentication request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            This could be due to an expired or invalid confirmation link, or a technical issue with our authentication
            service.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/login">Return to Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
