"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Medal, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

export default function LeaderboardsPage() {
  const searchParams = useSearchParams()
  const initialQuizId = searchParams.get("quiz")
  const { user } = useAuth()

  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(initialQuizId || "")
  const [leaderboardData, setLeaderboardData] = useState({})
  const [loading, setLoading] = useState(true)

  // Load quizzes and leaderboard data
  useEffect(() => {
    // Load quizzes from localStorage
    const savedQuizzes = localStorage.getItem("adminQuizzes")
    let adminQuizzes = []

    if (savedQuizzes) {
      adminQuizzes = JSON.parse(savedQuizzes)
    }

    // If no admin quizzes, use default quizzes
    if (adminQuizzes.length === 0) {
      adminQuizzes = [
        { id: "default1", title: "General Knowledge" },
        { id: "default2", title: "Science Quiz" },
        { id: "default3", title: "Pop Culture" },
        { id: "default4", title: "History Masters" },
      ]
    }

    setQuizzes(adminQuizzes)

    // Set initial selected quiz
    if (!initialQuizId && adminQuizzes.length > 0) {
      setSelectedQuiz(adminQuizzes[0].id)
    }

    // Load leaderboard data
    const savedLeaderboards = localStorage.getItem("quizLeaderboards")
    let leaderboards = {}

    if (savedLeaderboards) {
      leaderboards = JSON.parse(savedLeaderboards)
    }

    // Generate default leaderboard data for quizzes without data
    adminQuizzes.forEach((quiz) => {
      if (!leaderboards[quiz.id]) {
        // Generate random leaderboard data
        leaderboards[quiz.id] = generateRandomLeaderboard()
      }
    })

    setLeaderboardData(leaderboards)
    setLoading(false)
  }, [initialQuizId])

  // Generate random leaderboard data
  const generateRandomLeaderboard = () => {
    const names = ["Alex", "Sam", "Jamie", "Taylor", "Jordan", "Casey", "Riley", "Morgan", "Quinn", "Avery"]
    const surnames = ["Johnson", "Smith", "Brown", "Wilson", "Davis", "Miller", "Martin", "Lee", "Harris", "White"]

    const entries = []
    for (let i = 0; i < 10; i++) {
      const name = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`
      entries.push({
        name,
        score: Math.floor(Math.random() * 30) + 70, // Score between 70-100
        date: new Date().toISOString(),
        avatar: "/placeholder.svg?height=40&width=40",
      })
    }

    // Sort by score (highest first)
    entries.sort((a, b) => b.score - a.score)

    // Add rank
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
  }

  // Handle quiz selection change
  const handleQuizChange = (quizId) => {
    setSelectedQuiz(quizId)
  }

  // Check if an entry is the current user
  const isCurrentUser = (entry) => {
    return user && entry.userId === user.id
  }

  if (loading) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex items-center justify-center">
        <p>Loading leaderboards...</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto min-h-screen p-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Leaderboard</CardTitle>
          <CardDescription>Select a quiz to view its leaderboard and see who's at the top.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="max-w-xs">
              <Select value={selectedQuiz} onValueChange={handleQuizChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedQuiz && leaderboardData[selectedQuiz] && (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b bg-muted p-3 text-sm font-medium">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-7">Player</div>
                  <div className="col-span-4 text-right">Score</div>
                </div>

                <div className="divide-y">
                  {leaderboardData[selectedQuiz].map((entry, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-12 items-center p-3 ${isCurrentUser(entry) ? "bg-primary/10" : ""}`}
                    >
                      <div className="col-span-1 text-center font-medium">
                        {index < 3 ? (
                          <Medal
                            className={`mx-auto h-5 w-5 ${
                              index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-700"
                            }`}
                          />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="col-span-7 flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
                          <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.name}</span>
                          {isCurrentUser(entry) && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              You
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-4 text-right font-bold">{entry.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
