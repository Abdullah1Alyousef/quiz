"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users } from "lucide-react"

// Default quizzes to show if no admin quizzes exist
const defaultQuizzes = [
  {
    id: "default1",
    title: "General Knowledge",
    description: "Test your knowledge on various topics from history to science.",
    difficulty: "Medium",
    timeLimit: "10",
    participants: 1245,
  },
  {
    id: "default2",
    title: "Science Quiz",
    description: "Challenge yourself with questions about physics, chemistry, and biology.",
    difficulty: "Hard",
    timeLimit: "15",
    participants: 876,
  },
  {
    id: "default3",
    title: "Pop Culture",
    description: "How well do you know movies, music, and celebrities?",
    difficulty: "Easy",
    timeLimit: "8",
    participants: 2134,
  },
  {
    id: "default4",
    title: "History Masters",
    description: "Travel through time with questions about world history.",
    difficulty: "Medium",
    timeLimit: "12",
    participants: 654,
  },
]

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState(defaultQuizzes)

  // Load quizzes from localStorage on component mount
  useEffect(() => {
    const loadQuizzes = () => {
      const savedQuizzes = localStorage.getItem("adminQuizzes")
      if (savedQuizzes) {
        const adminQuizzes = JSON.parse(savedQuizzes)

        // Only use admin quizzes if there are any
        if (adminQuizzes.length > 0) {
          // Add random participant count to admin quizzes
          const enhancedQuizzes = adminQuizzes.map((quiz) => ({
            ...quiz,
            participants: Math.floor(Math.random() * 2000) + 100,
          }))
          setQuizzes(enhancedQuizzes)
        }
      }
    }

    loadQuizzes()

    // Add event listener to refresh when localStorage changes
    window.addEventListener("storage", loadQuizzes)

    return () => {
      window.removeEventListener("storage", loadQuizzes)
    }
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
                  <span>{quiz.participants.toLocaleString()} participants</span>
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
