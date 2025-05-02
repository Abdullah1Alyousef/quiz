"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"

export default function QuizPage({ params }) {
  const router = useRouter()
  const { id } = params
  const { user, updateUserProgress } = useAuth()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [answers, setAnswers] = useState([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)

  // Load quiz data
  useEffect(() => {
    const loadQuiz = () => {
      const savedQuizzes = localStorage.getItem("adminQuizzes")
      if (savedQuizzes) {
        const allQuizzes = JSON.parse(savedQuizzes)
        const foundQuiz = allQuizzes.find((q) => q.id === id)

        if (foundQuiz) {
          setQuiz(foundQuiz)
          setTimeLeft(Number.parseInt(foundQuiz.timeLimit) * 60) // Convert minutes to seconds
        } else {
          // If no quiz found with this ID, redirect to quizzes page
          router.push("/quizzes")
        }
      } else {
        // If no quizzes in localStorage, redirect to quizzes page
        router.push("/quizzes")
      }
      setLoading(false)
    }

    loadQuiz()
  }, [id, router])

  // Timer countdown
  useEffect(() => {
    if (!quiz || quizCompleted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleQuizEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, quizCompleted, timeLeft])

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId)
  }

  // Handle next question
  const handleNextQuestion = () => {
    // Save answer
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = selectedOption
    setAnswers(newAnswers)

    // Move to next question or end quiz
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption("")
    } else {
      handleQuizEnd()
    }
  }

  // Handle quiz end
  const handleQuizEnd = () => {
    // Calculate score
    let correctAnswers = 0
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctOption) {
        correctAnswers++
      }
    })

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100)
    setScore(finalScore)
    setQuizCompleted(true)

    // Update user progress if logged in
    if (user) {
      updateUserProgress(id, finalScore)
    }

    // Save score to leaderboard
    const leaderboardData = JSON.parse(localStorage.getItem("quizLeaderboards") || "{}")
    const quizLeaderboard = leaderboardData[id] || []

    // Add score to leaderboard with user info if logged in
    if (user) {
      quizLeaderboard.push({
        name: user.name,
        score: finalScore,
        date: new Date().toISOString(),
        avatar: user.avatar,
        userId: user.id,
      })
    } else {
      // Generate a random name for anonymous users
      const names = ["Alex", "Sam", "Jamie", "Taylor", "Jordan", "Casey", "Riley", "Morgan", "Quinn", "Avery"]
      const surnames = ["Johnson", "Smith", "Brown", "Wilson", "Davis", "Miller", "Martin", "Lee", "Harris", "White"]
      const randomName = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`

      quizLeaderboard.push({
        name: randomName,
        score: finalScore,
        date: new Date().toISOString(),
        avatar: "/placeholder.svg?height=40&width=40",
      })
    }

    // Sort by score (highest first)
    quizLeaderboard.sort((a, b) => b.score - a.score)

    // Update leaderboard in localStorage
    leaderboardData[id] = quizLeaderboard
    localStorage.setItem("quizLeaderboards", JSON.stringify(leaderboardData))
  }

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Get difficulty badge variant
  const getDifficultyVariant = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "success"
      case "Medium":
        return "warning"
      case "Hard":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex items-center justify-center">
        <p>Loading quiz...</p>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
        <p className="text-muted-foreground mb-6">The quiz you're looking for doesn't exist.</p>
        <Link href="/quizzes">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    )
  }

  // Quiz completed screen
  if (quizCompleted) {
    return (
      <main className="container mx-auto min-h-screen p-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Quiz Results</h1>
          <Link href="/quizzes">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Quizzes
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">{quiz.title} - Complete!</CardTitle>
            <CardDescription className="text-center">Here's how you did</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{score}%</div>
              <p className="text-muted-foreground">
                You answered {answers.filter((answer, index) => answer === quiz.questions[index].correctOption).length}{" "}
                out of {quiz.questions.length} questions correctly
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>0%</span>
                <span>100%</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Link href="/quizzes">
              <Button variant="outline">Try Another Quiz</Button>
            </Link>
            <Link href={`/leaderboards?quiz=${id}`}>
              <Button>View Leaderboard</Button>
            </Link>
            {user && (
              <Link href="/dashboard">
                <Button variant="outline">My Dashboard</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </main>
    )
  }

  // Current question
  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <main className="container mx-auto min-h-screen p-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <Badge variant={getDifficultyVariant(quiz.difficulty)}>{quiz.difficulty}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatTimeRemaining(timeLeft)}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Complete</span>
        </div>
        <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="h-2" />
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption} className="space-y-3">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-colors ${
                  selectedOption === option.id ? "bg-muted border-primary" : ""
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/quizzes")}>
            Quit Quiz
          </Button>
          <Button onClick={handleNextQuestion} disabled={!selectedOption}>
            {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
