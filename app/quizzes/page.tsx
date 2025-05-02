"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Loader2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { DebugPanel } from "@/components/debug-panel"

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  // Fetch quizzes from Supabase
  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true)
      setError(null)

      try {
        console.log("Fetching quizzes from Supabase...")

        // Direct approach - get all quizzes
        const { data, error } = await supabase.from("quizzes").select("*")

        if (error) {
          throw error
        }

        console.log("Raw quizzes data:", data)

        if (!data || data.length === 0) {
          console.log("No quizzes found in the database")
          setQuizzes([])
          return
        }

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
      } catch (err) {
        console.error("Error fetching quizzes:", err)
        setError(err.message || "Failed to load quizzes")

        // Don't set sample quiz in production - show the error instead
      } finally {
        setLoading(false)
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

  if (loading) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto min-h-screen p-4 py-8 bg-gradient-to-b from-white to-purple-50/30">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-quiz-purple to-quiz-blue">
          Available Quizzes
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="text-xs">
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
          <Link href="/">
            <Button variant="ghost" className="gap-2 hover:bg-quiz-purple/10">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {showDebug && <DebugPanel />}

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Error Loading Quizzes</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {quizzes.length === 0 && !error && (
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
