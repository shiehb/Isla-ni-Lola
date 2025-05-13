"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  full_name?: string
  role?: string
  email_confirmed?: boolean
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  isAdmin: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Local storage keys
const USER_CACHE_KEY = "arquilitas-user-cache"
const PROFILE_CACHE_KEY = "arquilitas-profile-cache"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  // Create the Supabase client once and store it in a ref
  const supabaseRef = useRef(createClientSupabaseClient())
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef<number>(0)
  const maxRetries = 3

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Cache management functions
  const saveUserToCache = (userData: User) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData))
    } catch (error) {
      console.error("Error saving user to cache:", error)
    }
  }

  const getCachedUser = (): User | null => {
    if (typeof window === "undefined") return null
    try {
      const cachedUser = localStorage.getItem(USER_CACHE_KEY)
      return cachedUser ? JSON.parse(cachedUser) : null
    } catch (error) {
      console.error("Error getting cached user:", error)
      return null
    }
  }

  const saveProfileToCache = (userId: string, profileData: any) => {
    if (typeof window === "undefined" || !profileData) return
    try {
      const profiles = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}")
      profiles[userId] = {
        ...profileData,
        cachedAt: Date.now(),
      }
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error("Error saving profile to cache:", error)
    }
  }

  const getCachedProfile = (userId: string): any => {
    if (typeof window === "undefined") return null
    try {
      const profiles = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}")
      const profile = profiles[userId]

      // Check if cache is valid (less than 1 hour old)
      if (profile && profile.cachedAt && Date.now() - profile.cachedAt < 3600000) {
        return profile
      }
      return null
    } catch (error) {
      console.error("Error getting cached profile:", error)
      return null
    }
  }

  // Function to handle fetch errors with retry logic
  const fetchWithRetry = async <T,>(
    fetchFn: () => Promise<T>,
    errorMessage: string,
    maxAttempts = maxRetries,
  ): Promise<{ data: T | null; error: Error | null }> => {
    let attempts = 0

    // If we're offline, don't even try to fetch
    if (!isOnline) {
      return { data: null, error: new Error("Device is offline") }
    }

    while (attempts < maxAttempts) {
      try {
        const result = await fetchFn()
        return { data: result, error: null }
      } catch (error) {
        attempts++
        console.error(`${errorMessage} (Attempt ${attempts}/${maxAttempts}):`, error)

        if (attempts >= maxAttempts) {
          return { data: null, error: error as Error }
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)))
      }
    }

    return { data: null, error: new Error("Max retry attempts reached") }
  }

  const fetchUserProfile = async (userId: string): Promise<any> => {
    // First check cache
    const cachedProfile = getCachedProfile(userId)
    if (cachedProfile) {
      console.log("Using cached profile for user:", userId)
      return cachedProfile
    }

    // If offline, return a minimal profile
    if (!isOnline) {
      console.log("Device is offline, using minimal profile")
      return {
        id: userId,
        role: "user",
        full_name: "",
      }
    }

    const supabase = supabaseRef.current

    try {
      // Use fetchWithRetry for the profile fetch
      const { data, error } = await fetchWithRetry(async () => {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) throw error
        return data
      }, "Error fetching profile")

      if (error) {
        console.error("All profile fetch attempts failed:", error)
        // Return a minimal profile to allow the app to function
        return {
          id: userId,
          role: "user",
          full_name: "",
        }
      }

      // Cache the successful profile fetch
      saveProfileToCache(userId, data)
      return data
    } catch (error) {
      console.error("Unexpected error in fetchUserProfile:", error)
      // Return a minimal profile as fallback
      return {
        id: userId,
        role: "user",
        full_name: "",
      }
    }
  }

  const refreshUser = async () => {
    try {
      const supabase = supabaseRef.current

      // If offline, use cached user
      if (!isOnline) {
        const cachedUser = getCachedUser()
        if (cachedUser) {
          setUser(cachedUser)
          setIsAdmin(cachedUser.role === "admin")
        }
        return
      }

      // Use fetchWithRetry for the session fetch
      const { data: sessionData, error: sessionFetchError } = await fetchWithRetry(async () => {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        return data
      }, "Error fetching session")

      if (sessionFetchError || !sessionData) {
        console.error("Failed to fetch session after retries")
        // Try to use cached user if available
        const cachedUser = getCachedUser()
        if (cachedUser) {
          setUser(cachedUser)
          setIsAdmin(cachedUser.role === "admin")
        } else {
          setUser(null)
          setIsAdmin(false)
        }
        return
      }

      const { session } = sessionData

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)

        const userInfo = {
          id: session.user.id,
          email: session.user.email!,
          full_name: profile?.full_name || session.user.user_metadata?.full_name,
          role: profile?.role || "user",
          email_confirmed: !!session.user.email_confirmed_at,
        }

        setUser(userInfo)
        setIsAdmin(profile?.role === "admin")
        saveUserToCache(userInfo)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("Error in refreshUser:", error)
      // Try to use cached user if available
      const cachedUser = getCachedUser()
      if (cachedUser) {
        setUser(cachedUser)
        setIsAdmin(cachedUser.role === "admin")
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    const getUser = async () => {
      try {
        // First check for cached user
        const cachedUser = getCachedUser()
        if (cachedUser && isMounted) {
          setUser(cachedUser)
          setIsAdmin(cachedUser.role === "admin")
        }

        // If offline, just use cached data and stop loading
        if (!isOnline) {
          if (isMounted) {
            setIsLoading(false)
          }
          return
        }

        const supabase = supabaseRef.current

        // Use fetchWithRetry for the session fetch
        const { data: sessionData, error: sessionFetchError } = await fetchWithRetry(async () => {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          return data
        }, "Error fetching initial session")

        if (sessionFetchError || !sessionData) {
          console.error("Failed to fetch initial session after retries")
          if (isMounted) {
            setIsLoading(false)
          }
          return
        }

        const { session } = sessionData

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)

          if (isMounted) {
            const userInfo = {
              id: session.user.id,
              email: session.user.email!,
              full_name: profile?.full_name || session.user.user_metadata?.full_name,
              role: profile?.role || "user",
              email_confirmed: !!session.user.email_confirmed_at,
            }

            setUser(userInfo)
            setIsAdmin(profile?.role === "admin")
            saveUserToCache(userInfo)
          }
        }
      } catch (error) {
        console.error("Error in getUser:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    getUser()

    const supabase = supabaseRef.current

    // Set up auth state change listener with error handling
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT") {
          if (isMounted) {
            setUser(null)
            setIsAdmin(false)
            // Clear cache on sign out
            if (typeof window !== "undefined") {
              localStorage.removeItem(USER_CACHE_KEY)
            }
          }
          return
        }

        if (session?.user) {
          try {
            const profile = await fetchUserProfile(session.user.id)

            if (isMounted) {
              const userInfo = {
                id: session.user.id,
                email: session.user.email!,
                full_name: profile?.full_name || session.user.user_metadata?.full_name,
                role: profile?.role || "user",
                email_confirmed: !!session.user.email_confirmed_at,
              }

              setUser(userInfo)
              setIsAdmin(profile?.role === "admin")
              saveUserToCache(userInfo)
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error)
            // Still set basic user info even if profile fetch fails
            if (isMounted) {
              const basicUserInfo = {
                id: session.user.id,
                email: session.user.email!,
                email_confirmed: !!session.user.email_confirmed_at,
              }
              setUser(basicUserInfo)
              saveUserToCache(basicUserInfo)
            }
          }
        } else if (isMounted) {
          setUser(null)
          setIsAdmin(false)
        }

        router.refresh()
      })

      subscription = data.subscription
    } catch (error) {
      console.error("Error setting up auth state change listener:", error)
    }

    return () => {
      isMounted = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.error("Error unsubscribing from auth state changes:", error)
        }
      }
    }
  }, [router, isOnline])

  const login = async (email: string, password: string) => {
    try {
      // If offline, return error
      if (!isOnline) {
        return {
          success: false,
          error: "Cannot login while offline. Please check your internet connection and try again.",
        }
      }

      const supabase = supabaseRef.current

      // Attempt to sign in with the provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        return { success: false, error: error.message }
      }

      if (!data.session) {
        return { success: false, error: "Failed to create session" }
      }

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        return {
          success: false,
          error: "Please confirm your email address before logging in. Check your inbox for a confirmation link.",
        }
      }

      // Check if profile exists, create one if it doesn't
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is the error code for "no rows returned"
          console.error("Error fetching profile during login:", profileError)
        }

        if (!profile) {
          // Create a profile for the user if it doesn't exist
          const { error: insertError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || "",
            role: "user", // Default role
          })

          if (insertError) {
            console.error("Error creating profile during login:", insertError)
          }
        } else {
          // Cache the profile
          saveProfileToCache(data.user.id, profile)
        }
      } catch (profileError) {
        console.error("Unexpected error checking/creating profile:", profileError)
        // Continue with login even if profile check/creation fails
      }

      // Cache basic user info
      const userInfo = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name,
        role: "user", // Default role until profile is loaded
        email_confirmed: !!data.user.email_confirmed_at,
      }
      saveUserToCache(userInfo)

      return { success: true }
    } catch (error: any) {
      console.error("Unexpected login error:", error)
      return { success: false, error: error.message || "An unexpected error occurred" }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      // If offline, return error
      if (!isOnline) {
        return {
          success: false,
          error: "Cannot register while offline. Please check your internet connection and try again.",
        }
      }

      const supabase = supabaseRef.current

      // Sign up the user with email confirmation
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        try {
          // Create a profile for the new user
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: name,
            role: "user", // Default role
          })

          if (profileError) {
            console.error("Error creating profile during registration:", profileError)
            return { success: false, error: profileError.message }
          }
        } catch (profileError: any) {
          console.error("Unexpected error creating profile:", profileError)
          return { success: false, error: profileError.message || "Error creating user profile" }
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Unexpected registration error:", error)
      return { success: false, error: error.message || "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      const supabase = supabaseRef.current

      // Clear cache first
      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_CACHE_KEY)
      }

      // Clear user state immediately
      setUser(null)
      setIsAdmin(false)

      // If offline, just redirect without trying to sign out from Supabase
      if (!isOnline) {
        router.push("/")
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Logout error:", error.message)
      // Still redirect even if there's an error
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        isAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
