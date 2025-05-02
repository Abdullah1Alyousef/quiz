"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, AlertCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

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
  const [userAnswers, setUserAnswers] = useState([])

  // Load quiz data from Supabase
  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true)
      try {
        // Get quiz details
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("id, title, description, difficulty, time_limit")
          .eq("id", id)
          .single()

        if (quizError) {
          throw quizError
        }

        // Get questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("id, text, order_num")
          .eq("quiz_id", id)
          .order("order_num")

        if (questionsError) {
          throw questionsError
        }

        // Get options for each question
        const questions = await Promise.all(
          questionsData.map(async (question) => {
            const { data: optionsData, error: optionsError } = await supabase
              .from("options")
              .select("id, text, is_correct, option_key")
              .eq("question_id", question.id)
              .order("option_key")

            if (optionsError) {
              throw optionsError
            }

            // Format options and find correct option
            const options = optionsData.map((opt) => ({
              id: opt.option_key,
              text: opt.text,
            }))

            const correctOption = optionsData.find((opt) => opt.is_correct)?.option_key || ""

            return {
              id: question.id,
              text: question.text,
              options,
              correctOption,
            }
          }),
        )

        // Format quiz data
        const formattedQuiz = {
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          difficulty: quizData.difficulty,
          timeLimit: quizData.time_limit.toString(),
          questions,
        }

        setQuiz(formattedQuiz)
        setTimeLeft(quizData.time_limit * 60) // Convert minutes to seconds
        setAnswers(new Array(questions.length).fill(""))
      } catch (error) {
        console.error("Error fetching quiz:", error)
        router.push("/quizzes")
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
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

    // Save user answer for submission
    const currentQuestion = quiz.questions[currentQuestionIndex]
    const selectedOptionObj = currentQuestion.options.find((opt) => opt.id === selectedOption)

    setUserAnswers((prev) => [
      ...prev,
      {
        question_id: currentQuestion.id,
        selected_option_id: selectedOptionObj ? selectedOption : null,
        is_correct: selectedOption === currentQuestion.correctOption,
      },
    ])

    // Move to next question or end quiz
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption("")
    } else {
      handleQuizEnd()
    }
  }

  // Handle quiz end
  const handleQuizEnd = async () => {
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

    // Submit results to Supabase
    if (user) {
      try {
        // Calculate time taken
        const timeTaken = Number.parseInt(quiz.timeLimit) * 60 - timeLeft

        // Submit quiz results using the stored procedure
        await supabase.rpc("submit_quiz_results", {
          p_quiz_id: id,
          p_score: finalScore,
          p_time_taken: timeTaken,
          p_answers: userAnswers,
        })

        // Update local user progress
        await updateUserProgress(id, finalScore)
      } catch (error) {
        console.error("Error submitting quiz results:", error)
      }
    }
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
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading quiz...</p>
        </div>
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
