import { createClient } from "@supabase/supabase-js"

// Server-side client
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and service role key are required. Please check your environment variables."
    )
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "X-Supabase-Auth-Role": "service_role",
      },
    },
  })
}

// Client-side singleton
let clientSupabaseInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  // Client-side
  if (typeof window !== "undefined") {
    if (clientSupabaseInstance) return clientSupabaseInstance

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase client credentials")
      return createMockSupabaseClient()
    }

    clientSupabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storageKey: "arquilitas-auth-token",
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

    return clientSupabaseInstance
  }

  // Server-side (for SSR/SSG)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase client credentials")
    return createMockSupabaseClient()
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Mock client remains the same
function createMockSupabaseClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({
          data: { session: null, user: null },
          error: { message: "Authentication unavailable in preview mode" },
        }),
      signUp: () =>
        Promise.resolve({
          data: { session: null, user: null },
          error: { message: "Authentication unavailable in preview mode" },
        }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
    }),
  }
}
