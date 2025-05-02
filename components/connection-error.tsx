"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function ConnectionError({ message = "We're having trouble connecting to the database." }) {
  return (
    <Card className="max-w-md mx-auto border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          Connection Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{message}</p>
        <div className="bg-red-50 p-4 rounded-md text-sm">
          <p className="font-medium mb-2">Possible causes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Missing or incorrect environment variables</li>
            <li>Network connectivity issues</li>
            <li>Supabase service might be temporarily unavailable</li>
            <li>CORS or browser security settings</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
