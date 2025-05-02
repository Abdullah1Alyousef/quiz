"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase, testSupabaseConnection } from "@/lib/supabase"

export function DebugPanel() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "success" | "error">("loading")
  const [quizCount, setQuizCount] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [envVars, setEnvVars] = useState<{ [key: string]: string | undefined }>({})

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5) + "...", // Show only first 5 chars for security
    })

    // Test connection
    testConnection()
  }, [])

  const testConnection = async () => {
    setConnectionStatus("loading")
    setErrorMessage(null)

    try {
      const result = await testSupabaseConnection()

      if (result.success) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
        setErrorMessage(result.error?.message || "Unknown error")
      }

      // Get quiz count
      const { data, error } = await supabase.from("quizzes").select("*")

      if (error) {
        console.error("Error fetching quizzes:", error)
        setErrorMessage((prev) => `${prev || ""}\nQuiz fetch error: ${error.message}`)
      } else {
        console.log("Quizzes fetched:", data)
        setQuizCount(data?.length || 0)
      }
    } catch (err) {
      console.error("Error in testConnection:", err)
      setConnectionStatus("error")
      setErrorMessage(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <Card className="mb-6 border-2 border-orange-300">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Supabase Debug Panel</span>
          <Button size="sm" onClick={testConnection}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">Connection Status:</h3>
          <div
            className={`mt-1 px-3 py-1 rounded-md inline-block
            ${
              connectionStatus === "success"
                ? "bg-green-100 text-green-800"
                : connectionStatus === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {connectionStatus === "success" ? "Connected" : connectionStatus === "error" ? "Error" : "Checking..."}
          </div>
        </div>

        {quizCount !== null && (
          <div>
            <h3 className="font-medium">Quiz Count in Database:</h3>
            <p>{quizCount}</p>
          </div>
        )}

        <div>
          <h3 className="font-medium">Environment Variables:</h3>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">{JSON.stringify(envVars, null, 2)}</pre>
        </div>

        {errorMessage && (
          <div>
            <h3 className="font-medium text-red-600">Error:</h3>
            <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-auto whitespace-pre-wrap">
              {errorMessage}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
