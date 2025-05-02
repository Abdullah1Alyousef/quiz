"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch quizzes from Supabase
  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true)
      try {
        // Get quizzes
        const { data: quizzesData, error } = await supabase
          .from("quizzes")
          .select(`
            id, 
            title, 
            description, 
            difficulty, 
            time_limit,
            created_at
          `)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Get participant counts for each quiz
        const { data: participantCounts, error: countError } = await supabase
          .from("user_quiz_results")
          .select("quiz_id, count")
          .select("quiz_id, count(*)", { count: "exact" })
          .group("quiz_id")

        if (countError) {
          console.error("Error fetching participant counts:", countError)
        }

        // Map participant counts to quizzes
        const quizzesWithCounts = quizzesData.map((quiz) => {
          const countData = participantCounts?.find((p) => p.quiz_id === quiz.id)
          return {
            ...quiz,
            participants: countData ? Number.parseInt(countData.count) : 0,
            timeLimit: quiz.time_limit.toString(),
          }
        })

        setQuizzes(quizzesWithCounts)
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        // If there's an error, use a sample quiz for testing
        setQuizzes([
          {
            id: "test-quiz",
            title: "Sample Quiz",
            description: "This is a sample quiz for testing the frontend while developing the backend.",
            difficulty: "Medium",
            timeLimit: "10",
            participants: 0,
          },
        ])
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
