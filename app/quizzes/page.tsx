"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Loader2 } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { ConnectionError } from "@/components/connection-error"

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connectionTimeout, setConnectionTimeout] = useState(false)

  // Fetch quizzes from Supabase with timeout
  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setError("Supabase is not properly configured. Check your environment variables.")
      setLoading(false)
      return
    }

    async function fetchQuizzes() {
      setLoading(true)
      setError(null)
      setConnectionTimeout(false)

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setConnectionTimeout(true)
        setLoading(false)
      }, 10000) // 10 seconds timeout

      try {
        console.log("Attempting to fetch quizzes from Supabase...")

        // Simple query to test connection first
        const { data: testData, error: testError } = await supabase.from("quizzes").select("count").single()

        if (testError) {
          console.error("Connection test failed:", testError)
          throw new Error(`Connection test failed: ${testError.message}`)
        }

        console.log("Connection test successful, fetching quizzes...")

        // Now fetch the actual quizzes
        const { data, error } = await supabase.from("quizzes").select("*")

        // Clear timeout since we got a response
        clearTimeout(timeoutId)

        if (error) {
          throw new Error(`Failed to fetch quizzes: ${error.message}`)
        }

        console.log("Quizzes fetched successfully:", data)

        if (!data || data.length === 0) {
          console.log("No quizzes found in the database")
          setQuizzes([])
        } else {
          // Transform the data to match the expected format
          const formattedQuizzes = data.map((quiz) => ({
            id: quiz.id,
            title: quiz.title || "Untitled Quiz",
            description: quiz.description || "No description provided",
            difficulty: quiz.difficulty || "Medium",
            timeLimit: String(quiz.time_limit || 10),
            participants: 0, // We'll set this to 0 for now
          }))

          console.log("Formatted quizzes:", formattedQuizzes)
          setQuizzes(formattedQuizzes)
        }
      } catch (err) {
        console.error("Error in fetchQuizzes:", err)
        setError(err.message || "Failed to load quizzes")
        clearTimeout(timeoutId)
      } finally {
        if (!connectionTimeout) {
          setLoading(false)
        }
      }
    }

    fetchQuizzes()
  }, [])

  // Get difficulty badge variant
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "badge-easy text-white"
      case "Medium":
        return "badge-medium text-white"
      case "Hard":
        return "badge-hard text-white"
      default:
        return ""
    }
  }

  // Get card color class based on index
  const getCardColorClass = (index) => {
    const colors = [
      "from-quiz-purple/10 to-quiz-blue/10 border-quiz-purple/20",
      "from-quiz-pink/10 to-quiz-purple/10 border-quiz-pink/20",
      "from-quiz-green/10 to-quiz-blue/10 border-quiz-green/20",
      "from-quiz-orange/10 to-quiz-yellow/10 border-quiz-orange/20",
      "from-quiz-blue/10 to-quiz-teal/10 border-quiz-blue/20",
    ]
    return colors[index % colors.length]
  }

  // Show connection timeout message
  if (connectionTimeout) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex items-center justify-center">
        <ConnectionError message="Connection to the database is taking too long. This might indicate a network issue or that the database is currently unavailable." />
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading quizzes...</p>
          <p className="text-sm text-muted-foreground mt-2">This should only take a moment...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex items-center justify-center">
        <ConnectionError message={`Error loading quizzes: ${error}`} />
      </div>
    )
  }

  return (
    <main className="container mx-auto min-h-screen p-4 py-8 bg-gradient-to-b from-white to-purple-50/30">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-quiz-purple to-quiz-blue">
          Available Quizzes
        </h1>
        <Link href="/">
          <Button variant="ghost" className="gap-2 hover:bg-quiz-purple/10">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz, index) => (
          <Card
            key={quiz.id}
            className={`overflow-hidden transition-all bg-gradient-to-br ${getCardColorClass(index)} card-hover-effect`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>{quiz.title}</CardTitle>
                <Badge className={getDifficultyClass(quiz.difficulty)}>{quiz.difficulty}</Badge>
              </div>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.timeLimit} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{quiz.participants || 0} participants</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/quizzes/${quiz.id}`} className="w-full">
                <Button className="w-full bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90">
                  Start Quiz
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">No quizzes available</h2>
          <p className="text-muted-foreground mb-6">Check back later or visit the admin page to create quizzes.</p>
          <Link href="/admin">
            <Button className="bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90">Go to Admin</Button>
          </Link>
        </div>
      )}
    </main>
  )
}
