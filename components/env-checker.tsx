"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EnvChecker() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const requiredVars = [
      { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL },
      { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    ]

    const missing = requiredVars.filter((v) => !v.value).map((v) => v.name)
    setMissingVars(missing)
    setChecked(true)
  }, [])

  if (!checked || missingVars.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Critical Configuration Error</AlertTitle>
      <AlertDescription>
        <p>The following required environment variables are missing:</p>
        <ul className="list-disc pl-5 mt-2">
          {missingVars.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="mt-2">
          Please check your environment configuration. The application will not function correctly without these
          variables.
        </p>
      </AlertDescription>
    </Alert>
  )
}
