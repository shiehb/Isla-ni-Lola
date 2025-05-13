import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Session error in middleware:", sessionError)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path === "/registration-success" ||
    path === "/email-confirmation" ||
    path === "/auth/confirm" ||
    path === "/auth/error" ||
    path === "/cart" ||
    path.startsWith("/cart/") ||
    path === "/checkout" ||
    path.startsWith("/checkout/")

  const isAdminPath = path.startsWith("/admin")
  const isApiPath = path.startsWith("/api")
  const isLoggedIn = !!session

  // Skip middleware for API routes
  if (isApiPath) {
    return res
  }

  // Redirect authenticated users away from login/register pages
  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect unauthenticated users to login page for protected routes
  if (
    !isPublicPath &&
    !session &&
    path !== "/" &&
    path !== "/about-us" &&
    path !== "/shop" &&
    !path.startsWith("/product")
  ) {

  }

  // For admin routes, check if user has admin role
  if (isAdminPath && session) {
    try {
      // Get user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.error("Error checking admin role:", profileError)
        return NextResponse.redirect(new URL("/", request.url))
      }

      if (!profile || profile.role !== "admin") {
        console.error("Admin access denied: User is not an admin")
        return NextResponse.redirect(new URL("/", request.url))
      }

      // If we get here, the user is an admin, so allow access
      return res
    } catch (error) {
      console.error("Unexpected error checking admin role:", error)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return res
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/checkout/:path*",
    "/cart/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/confirm",
    "/auth/error",
  ],
}
