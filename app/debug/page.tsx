"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function DebugPage() {
  const [status, setStatus] = useState("Loading...")
  const [quizzes, setQuizzes] = useState([])
  const [envVars, setEnvVars] = useState({})

  useEffect(() => {
    checkConnection()

    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...`
        : undefined,
    })
  }, [])

  async function checkConnection() {
    try {
      setStatus("Testing connection...")

      // Test basic connection
      const { data, error } = await supabase.from("quizzes").select("*")

      if (error) {
        setStatus(`Connection error: ${error.message}`)
        return
      }

      setQuizzes(data || [])
      setStatus(`Connected successfully! Found ${data?.length || 0} quizzes.`)
    } catch (err) {
      setStatus(`Unexpected error: ${err.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Page</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Connection Status</span>
            <Button size="sm" onClick={checkConnection}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{status}</p>

          <h3 className="font-medium mb-2">Environment Variables:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">{JSON.stringify(envVars, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quizzes in Database</CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="border p-4 rounded">
                  <h3 className="font-bold">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">{quiz.description || "No description"}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">ID:</span> {quiz.id}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Difficulty:</span> {quiz.difficulty}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Time Limit:</span> {quiz.time_limit} minutes
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No quizzes found in the database.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Link href="/quizzes">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    </div>
  )
}
