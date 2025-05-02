"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Medal, Star, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

export default function LeaderboardsPage() {
  const searchParams = useSearchParams()
  const initialQuizId = searchParams.get("quiz")
  const { user } = useAuth()

  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(initialQuizId || "")
  const [leaderboardData, setLeaderboardData] = useState({})
  const [loading, setLoading] = useState(true)

  // Load quizzes
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const { data, error } = await supabase.from("quizzes").select("id, title").order("title")

        if (error) {
          throw error
        }

        setQuizzes(data)

        // Set initial selected quiz if not provided in URL
        if (!initialQuizId && data.length > 0) {
          setSelectedQuiz(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        setQuizzes([{ id: "test-quiz", title: "Sample Quiz" }])
      }
    }

    fetchQuizzes()
  }, [initialQuizId])

  // Load leaderboard data when selected quiz changes
  useEffect(() => {
    async function fetchLeaderboard() {
      if (!selectedQuiz) return

      setLoading(true)
      try {
        // Use the get_quiz_leaderboard function
        const { data, error } = await supabase.rpc("get_quiz_leaderboard", {
          quiz_uuid: selectedQuiz,
          limit_count: 20,
        })

        if (error) {
          throw error
        }

        // Format leaderboard data
        const formattedData = data.map((entry, index) => ({
          rank: entry.rank,
          name: entry.user_name,
          userId: entry.user_id,
          score: entry.score,
          avatar: entry.avatar_url || `/placeholder.svg?height=40&width=40&text=${entry.user_name.charAt(0)}`,
          completedAt: entry.completed_at,
        }))

        setLeaderboardData((prev) => ({
          ...prev,
          [selectedQuiz]: formattedData,
        }))
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        setLeaderboardData((prev) => ({
          ...prev,
          [selectedQuiz]: [],
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedQuiz])

  // Handle quiz selection change
  const handleQuizChange = (quizId) => {
    setSelectedQuiz(quizId)
  }

  // Check if an entry is the current user
  const isCurrentUser = (entry) => {
    return user && entry.userId === user.id
  }

  if (loading && quizzes.length === 0) {
    return (
      <div className="container mx-auto min-h-screen p-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading leaderboards...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto min-h-screen p-4 py-8 bg-gradient-to-b from-white to-purple-50/30">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-quiz-purple to-quiz-blue">
          Leaderboards
        </h1>
        <Link href="/">
          <Button variant="ghost" className="gap-2 hover:bg-quiz-purple/10">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm">
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

            {selectedQuiz && (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b bg-muted p-3 text-sm font-medium">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-7">Player</div>
                  <div className="col-span-4 text-right">Score</div>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    <p>Loading leaderboard...</p>
                  </div>
                ) : leaderboardData[selectedQuiz]?.length > 0 ? (
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
                            entry.rank
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
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No leaderboard data available yet.</p>
                    <p className="text-sm mt-2">Be the first to complete this quiz!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
