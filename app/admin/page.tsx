"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus } from "lucide-react"
import QuizCreator from "./quiz-creator"
import QuizManager from "./quiz-manager"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("manage")
  const [editingQuiz, setEditingQuiz] = useState(null)

  // Handle editing a quiz
  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz)
    setActiveTab("create")
  }

  return (
    <main className="container mx-auto min-h-screen p-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quiz Admin Dashboard</h1>
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manage">Manage Quizzes</TabsTrigger>
          <TabsTrigger value="create">Create Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quiz Management</CardTitle>
                  <CardDescription>Manage your existing quizzes or create a new one.</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingQuiz(null)
                    setActiveTab("create")
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Quiz
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <QuizManager onEditQuiz={handleEditQuiz} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</CardTitle>
              <CardDescription>
                {editingQuiz
                  ? "Edit your quiz details and questions."
                  : "Fill in the details and add questions to create a new quiz."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuizCreator
                existingQuiz={editingQuiz}
                onComplete={() => {
                  setEditingQuiz(null)
                  setActiveTab("manage")
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
