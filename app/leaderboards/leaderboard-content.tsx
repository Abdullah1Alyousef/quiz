"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal } from "lucide-react"

// Type definitions
type Quiz = {
  id: number
  title: string
}

type LeaderboardEntry = {
  rank: number
  name: string
  score: number
  avatar: string
}

type LeaderboardData = {
  [key: string]: LeaderboardEntry[]
}

type LeaderboardContentProps = {
  quizzes: Quiz[]
  leaderboardData: LeaderboardData
}

export default function LeaderboardContent({ quizzes, leaderboardData }: LeaderboardContentProps) {
  const [selectedQuiz, setSelectedQuiz] = useState("1")

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Select defaultValue="1" onValueChange={setSelectedQuiz}>
          <SelectTrigger>
            <SelectValue placeholder="Select a quiz" />
          </SelectTrigger>
          <SelectContent>
            {quizzes.map((quiz) => (
              <SelectItem key={quiz.id} value={quiz.id.toString()}>
                {quiz.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-12 border-b bg-muted p-3 text-sm font-medium">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-7">Player</div>
          <div className="col-span-4 text-right">Score</div>
        </div>

        <div className="divide-y">
          {leaderboardData[selectedQuiz].map((entry) => (
            <div key={entry.rank} className="grid grid-cols-12 items-center p-3">
              <div className="col-span-1 text-center font-medium">
                {entry.rank <= 3 ? (
                  <Medal
                    className={`mx-auto h-5 w-5 ${
                      entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-amber-700"
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
                <span className="font-medium">{entry.name}</span>
              </div>
              <div className="col-span-4 text-right font-bold">{entry.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
