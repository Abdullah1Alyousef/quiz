import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: Missing Supabase environment variables", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  })
}

// Create the client with error handling
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

try {
  supabaseInstance = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "")
  console.log("Supabase client initialized successfully")
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
}

export const supabase = supabaseInstance || createClient<Database>("", "")

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey
}

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: Error }> {
  try {
    const { data, error } = await supabase.from("quizzes").select("id").limit(1).single()

    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error }
    }

    console.log("Supabase connection test successful:", data)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error during Supabase connection test:", error)
    return { success: false, error: error instanceof Error ? error : new Error("An unexpected error occurred") }
  }
}
