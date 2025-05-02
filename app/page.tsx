import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, FileQuestion, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center animated-bg p-4">
      <div className="container flex max-w-4xl flex-col items-center justify-center gap-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Welcome to <span className="text-yellow-300">QuizMaster</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/90 sm:text-xl">
            Test your knowledge with our quizzes and compete for the top spot on our leaderboards.
          </p>
        </div>

        <div className="grid w-full max-w-lg grid-cols-1 gap-6 sm:grid-cols-2">
          <Link href="/quizzes" className="w-full">
            <Button
              className="h-32 w-full flex-col gap-2 text-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/30 text-white"
              size="lg"
            >
              <FileQuestion className="h-8 w-8" />
              Take Quizzes
            </Button>
          </Link>
          <Link href="/leaderboards" className="w-full">
            <Button
              className="h-32 w-full flex-col gap-2 text-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 text-white"
              size="lg"
            >
              <Trophy className="h-8 w-8" />
              View Leaderboards
            </Button>
          </Link>
        </div>

        <div className="mt-4">
          <Link href="/admin">
            <Button
              variant="outline"
              className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20 text-white"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
