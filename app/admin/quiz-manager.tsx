"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function QuizManager({ onEditQuiz }) {
  const [quizzes, setQuizzes] = useState([])
  const [deleteQuizId, setDeleteQuizId] = useState(null)

  // Load quizzes from localStorage on component mount
  useEffect(() => {
    const loadQuizzes = () => {
      const savedQuizzes = localStorage.getItem("adminQuizzes")
      if (savedQuizzes) {
        setQuizzes(JSON.parse(savedQuizzes))
      }
    }

    loadQuizzes()

    // Add event listener to refresh when localStorage changes
    window.addEventListener("storage", loadQuizzes)

    return () => {
      window.removeEventListener("storage", loadQuizzes)
    }
  }, [])

  // Delete a quiz
  const handleDeleteQuiz = (id) => {
    const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== id)
    setQuizzes(updatedQuizzes)
    localStorage.setItem("adminQuizzes", JSON.stringify(updatedQuizzes))
    setDeleteQuizId(null)
  }

  // Get difficulty badge variant
  const getDifficultyVariant = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "success"
      case "Medium":
        return "warning"
      case "Hard":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div>
      {quizzes.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Time Limit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge variant={getDifficultyVariant(quiz.difficulty)}>{quiz.difficulty}</Badge>
                  </TableCell>
                  <TableCell>{quiz.questions.length}</TableCell>
                  <TableCell>{quiz.timeLimit} min</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEditQuiz(quiz)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteQuizId(quiz.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground mb-4">No quizzes created yet</p>
          <Button onClick={() => onEditQuiz(null)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Quiz
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteQuizId} onOpenChange={() => setDeleteQuizId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz and all its questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteQuiz(deleteQuizId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
