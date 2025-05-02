"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, FileQuestion, Clock, BarChart, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [userStats, setUserStats] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    bestScore: 0,
    bestQuiz: null,
    recentActivity: [],
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Load quizzes and calculate stats
  useEffect(() => {
    if (!user) return

    // Load quizzes
    const savedQuizzes = localStorage.getItem("adminQuizzes")
    const loadedQuizzes = savedQuizzes ? JSON.parse(savedQuizzes) : []
    setQuizzes(loadedQuizzes)

    // Calculate user stats
    if (user.completedQuizzes && user.completedQuizzes.length > 0) {
      const completedQuizzes = user.completedQuizzes

      // Total quizzes taken
      const totalQuizzesTaken = completedQuizzes.length

      // Average score
      const totalScore = completedQuizzes.reduce((sum, quiz) => sum + quiz.score, 0)
      const averageScore = Math.round(totalScore / totalQuizzesTaken)

      // Best score and quiz
      const bestQuizAttempt = [...completedQuizzes].sort((a, b) => b.score - a.score)[0]
      const bestScore = bestQuizAttempt.score

      // Find quiz details for best quiz
      const bestQuiz = loadedQuizzes.find((q) => q.id === bestQuizAttempt.quizId)

      // Recent activity (sort by date)
      const recentActivity = [...completedQuizzes]
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 5)
        .map((activity) => {
          const quizDetails = loadedQuizzes.find((q) => q.id === activity.quizId)
          return {
            ...activity,
            quizTitle: quizDetails ? quizDetails.title : "Unknown Quiz",
          }
        })

      setUserStats({
        totalQuizzesTaken,
        averageScore,
        bestScore,
        bestQuiz,
        recentActivity,
      })
    }
  }, [user])

  // If loading or no user, show loading state
  if (isLoading || !user) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get recommended quizzes (quizzes user hasn't taken yet)
  const getRecommendedQuizzes = () => {
    if (!user.completedQuizzes) return quizzes.slice(0, 3)

    const completedQuizIds = user.completedQuizzes.map((q) => q.quizId)
    const notCompletedQuizzes = quizzes.filter((quiz) => !completedQuizIds.includes(quiz.id))

    // If user has completed all quizzes, recommend ones with lowest scores
    if (notCompletedQuizzes.length === 0) {
      const lowestScoreQuizzes = [...user.completedQuizzes]
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((attempt) => {
          return quizzes.find((q) => q.id === attempt.quizId)
        })
        .filter(Boolean)

      return lowestScoreQuizzes
    }

    return notCompletedQuizzes.slice(0, 3)
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
    <main className="container py-8 bg-gradient-to-b from-white to-purple-50/30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-quiz-purple to-quiz-blue">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">Track your progress and see how you compare to others.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-quiz-purple/10 to-quiz-blue/10 border-quiz-purple/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                <FileQuestion className="h-4 w-4 text-quiz-purple" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalQuizzesTaken}</div>
                <p className="text-xs text-muted-foreground">
                  {quizzes.length > 0 &&
                    `${Math.round((userStats.totalQuizzesTaken / quizzes.length) * 100)}% of all quizzes`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-quiz-pink/10 to-quiz-purple/10 border-quiz-pink/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart className="h-4 w-4 text-quiz-pink" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.averageScore}%</div>
                <Progress
                  value={userStats.averageScore}
                  className="h-2 mt-2 bg-white/50"
                  style={{
                    background: "linear-gradient(to right, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))",
                    "--tw-progress-bar": "linear-gradient(to right, #EC4899, #8B5CF6)",
                  }}
                />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-quiz-green/10 to-quiz-blue/10 border-quiz-green/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                <Trophy className="h-4 w-4 text-quiz-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.bestScore}%</div>
                <p className="text-xs text-muted-foreground">
                  {userStats.bestQuiz ? `on ${userStats.bestQuiz.title}` : "No quizzes taken yet"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-quiz-orange/10 to-quiz-yellow/10 border-quiz-orange/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Challenge</CardTitle>
                <Clock className="h-4 w-4 text-quiz-orange" />
              </CardHeader>
              <CardContent>
                {getRecommendedQuizzes()[0] ? (
                  <>
                    <div className="text-md font-medium truncate">{getRecommendedQuizzes()[0].title}</div>
                    <Link href={`/quizzes/${getRecommendedQuizzes()[0].id}`}>
                      <Button variant="link" className="h-auto p-0 text-xs text-quiz-orange">
                        Take this quiz <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="text-sm">No quizzes available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-quiz-purple to-quiz-blue">
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {userStats.recentActivity && userStats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {userStats.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{activity.quizTitle}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(activity.completedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{activity.score}%</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <Link href={`/quizzes/${activity.quizId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-quiz-purple/10 to-quiz-blue/10 border-quiz-purple/20 hover:bg-quiz-purple/20"
                          >
                            Retry
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't taken any quizzes yet</p>
                  <Link href="/quizzes">
                    <Button className="bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90">
                      Browse Quizzes
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-quiz-purple to-quiz-blue">
                Quiz Progress
              </CardTitle>
              <CardDescription>Your performance across all quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              {user.completedQuizzes && user.completedQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {quizzes.map((quiz) => {
                    const attempt = user.completedQuizzes.find((q) => q.quizId === quiz.id)
                    return (
                      <div key={quiz.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{quiz.title}</span>
                            <Badge className={getDifficultyClass(quiz.difficulty)}>{quiz.difficulty}</Badge>
                          </div>
                          {attempt ? (
                            <span className="font-bold">{attempt.score}%</span>
                          ) : (
                            <Badge variant="outline">Not attempted</Badge>
                          )}
                        </div>
                        <Progress
                          value={attempt ? attempt.score : 0}
                          className="h-2"
                          style={{
                            background: "linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))",
                            "--tw-progress-bar": "linear-gradient(to right, #8B5CF6, #3B82F6)",
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't taken any quizzes yet</p>
                  <Link href="/quizzes">
                    <Button className="bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90">
                      Browse Quizzes
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {getRecommendedQuizzes().map((quiz, index) => (
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
                      <FileQuestion className="h-4 w-4" />
                      <span>{quiz.questions.length} questions</span>
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

            {getRecommendedQuizzes().length === 0 && (
              <div className="col-span-full text-center py-6">
                <p className="text-muted-foreground mb-4">No recommendations available</p>
                <Link href="/quizzes">
                  <Button className="bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90">
                    Browse All Quizzes
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
