import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env file or environment settings.", {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
  })
}

export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "")

// Debug function to test Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("quizzes").select("count").single()
    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error }
    }
    console.log("Supabase connection successful:", data)
    return { success: true, data }
  } catch (err) {
    console.error("Unexpected error testing Supabase connection:", err)
    return { success: false, error: err }
  }
}
