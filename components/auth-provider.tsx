"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

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
  logout: () => void
  updateUserProgress: (quizId: string, score: number) => void
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call
    // For this demo, we'll check localStorage

    const usersJSON = localStorage.getItem("users")
    const users = usersJSON ? JSON.parse(usersJSON) : []

    const foundUser = users.find((u: any) => u.email === email)

    if (!foundUser) {
      return { success: false, message: "User not found" }
    }

    // In a real app, you would hash passwords and not store them in plain text
    if (foundUser.password !== password) {
      return { success: false, message: "Incorrect password" }
    }

    // Remove password before storing in state
    const { password: _, ...userWithoutPassword } = foundUser

    // Set user in state and localStorage
    setUser(userWithoutPassword)
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    // In a real app, this would make an API call
    // For this demo, we'll store in localStorage

    const usersJSON = localStorage.getItem("users")
    const users = usersJSON ? JSON.parse(usersJSON) : []

    // Check if email already exists
    if (users.some((u: any) => u.email === email)) {
      return { success: false, message: "Email already in use" }
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, you would hash this
      avatar: `/placeholder.svg?height=40&width=40&text=${name.charAt(0)}`,
      createdAt: new Date().toISOString(),
      completedQuizzes: [],
    }

    // Add to users array
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Remove password before storing in state
    const { password: _, ...userWithoutPassword } = newUser

    // Set user in state and localStorage
    setUser(userWithoutPassword)
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  // Update user progress
  const updateUserProgress = (quizId: string, score: number) => {
    if (!user) return

    // Create updated user object
    const updatedUser = { ...user }

    // Initialize completedQuizzes array if it doesn't exist
    if (!updatedUser.completedQuizzes) {
      updatedUser.completedQuizzes = []
    }

    // Add or update quiz completion
    const existingQuizIndex = updatedUser.completedQuizzes.findIndex((q) => q.quizId === quizId)

    if (existingQuizIndex >= 0) {
      // Update existing entry if score is better
      if (score > updatedUser.completedQuizzes[existingQuizIndex].score) {
        updatedUser.completedQuizzes[existingQuizIndex] = {
          quizId,
          score,
          completedAt: new Date().toISOString(),
        }
      }
    } else {
      // Add new entry
      updatedUser.completedQuizzes.push({
        quizId,
        score,
        completedAt: new Date().toISOString(),
      })
    }

    // Update user in state and localStorage
    setUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))

    // Also update in users array
    const usersJSON = localStorage.getItem("users")
    if (usersJSON) {
      const users = JSON.parse(usersJSON)
      const userIndex = users.findIndex((u: any) => u.id === user.id)

      if (userIndex >= 0) {
        // Keep the password when updating the users array
        const password = users[userIndex].password
        users[userIndex] = { ...updatedUser, password }
        localStorage.setItem("users", JSON.stringify(users))
      }
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
