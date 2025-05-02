"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"

// Define user type
export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  completedQuizzes?: {
    quizId: string
    score: number
    completedAt: string
  }[]
}

// Define auth context type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  updateUserProgress: (quizId: string, score: number) => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from Supabase session on mount
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        await handleSessionChange(session)
      }

      setIsLoading(false)

      // Listen for auth changes
      const {
        data: { subscription },
      } = await supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          await handleSessionChange(session)
        } else {
          setUser(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    loadUser()
  }, [])

  // Handle session change
  const handleSessionChange = async (session: Session) => {
    const supabaseUser = session.user

    if (!supabaseUser) {
      setUser(null)
      return
    }

    // Get user profile from database
    const { data: profile, error } = await supabase.from("users").select("*").eq("id", supabaseUser.id).single()

    if (error || !profile) {
      console.error("Error fetching user profile:", error)
      return
    }

    // Get user's completed quizzes
    const { data: quizResults } = await supabase
      .from("user_quiz_results")
      .select("quiz_id, score, completed_at")
      .eq("user_id", supabaseUser.id)

    const completedQuizzes =
      quizResults?.map((result) => ({
        quizId: result.quiz_id,
        score: result.score,
        completedAt: result.completed_at,
      })) || []

    // Set user in state
    setUser({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar_url || undefined,
      createdAt: profile.created_at,
      completedQuizzes,
    })
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (authError) {
        return { success: false, message: authError.message }
      }

      if (!authData.user) {
        return { success: false, message: "Failed to create user" }
      }

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        name,
        email,
        avatar_url: `/placeholder.svg?height=40&width=40&text=${name.charAt(0)}`,
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        return { success: false, message: "Failed to create user profile" }
      }

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Update user progress
  const updateUserProgress = async (quizId: string, score: number) => {
    if (!user) return

    try {
      // Insert quiz result
      const { data, error } = await supabase
        .from("user_quiz_results")
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          time_taken: null, // We could track this in the future
        })
        .select()

      if (error) {
        console.error("Error updating user progress:", error)
        return
      }

      // Update local user state
      const updatedQuizzes = [...(user.completedQuizzes || [])]
      const existingQuizIndex = updatedQuizzes.findIndex((q) => q.quizId === quizId)

      if (existingQuizIndex >= 0) {
        // Update existing entry if score is better
        if (score > updatedQuizzes[existingQuizIndex].score) {
          updatedQuizzes[existingQuizIndex] = {
            quizId,
            score,
            completedAt: new Date().toISOString(),
          }
        }
      } else {
        // Add new entry
        updatedQuizzes.push({
          quizId,
          score,
          completedAt: new Date().toISOString(),
        })
      }

      setUser({
        ...user,
        completedQuizzes: updatedQuizzes,
      })
    } catch (error) {
      console.error("Error in updateUserProgress:", error)
    }
  }

  // Create context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUserProgress,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
