"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// Default empty question template
const emptyQuestion = {
  id: "",
  text: "",
  options: [
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ],
  correctOption: "",
}

export default function QuizCreator({ existingQuiz = null, onComplete }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  // Quiz details state
  const [quizDetails, setQuizDetails] = useState({
    id: Date.now().toString(),
    title: "",
    description: "",
    difficulty: "Medium",
    timeLimit: "10",
    questions: [],
  })

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState({ ...emptyQuestion, id: "1" })
  const [activeTab, setActiveTab] = useState("details")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Load existing quiz data if editing
  useEffect(() => {
    if (existingQuiz) {
      setQuizDetails(existingQuiz)
      if (existingQuiz.questions && existingQuiz.questions.length > 0) {
        setCurrentQuestion(existingQuiz.questions[0])
      }
    }
  }, [existingQuiz])

  // Handle quiz details change
  const handleDetailsChange = (e) => {
    const { name, value } = e.target
    setQuizDetails((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select change for difficulty
  const handleSelectChange = (name, value) => {
    setQuizDetails((prev) => ({ ...prev, [name]: value }))
  }

  // Handle question text change
  const handleQuestionTextChange = (e) => {
    setCurrentQuestion((prev) => ({ ...prev, text: e.target.value }))
  }

  // Handle option text change
  const handleOptionChange = (optionId, value) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option) => (option.id === optionId ? { ...option, text: value } : option)),
    }))
  }

  // Handle correct option selection
  const handleCorrectOptionChange = (value) => {
    setCurrentQuestion((prev) => ({ ...prev, correctOption: value }))
  }

  // Save current question
  const saveQuestion = () => {
    // Validate question
    if (
      !currentQuestion.text ||
      !currentQuestion.correctOption ||
      currentQuestion.options.some((option) => !option.text)
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields for the question and options, and select a correct answer.",
        variant: "destructive",
      })
      return
    }

    const updatedQuestions = [...quizDetails.questions]
    const existingIndex = updatedQuestions.findIndex((q) => q.id === currentQuestion.id)

    if (existingIndex >= 0) {
      // Update existing question
      updatedQuestions[existingIndex] = currentQuestion
    } else {
      // Add new question
      updatedQuestions.push(currentQuestion)
    }

    setQuizDetails((prev) => ({ ...prev, questions: updatedQuestions }))

    // Clear form for next question
    const nextId = (updatedQuestions.length + 1).toString()
    setCurrentQuestion({ ...emptyQuestion, id: nextId })
    setCurrentQuestionIndex(updatedQuestions.length)

    toast({
      title: "Question Saved",
      description: "Your question has been saved successfully.",
    })
  }

  // Load a question for editing
  const editQuestion = (index) => {
    setCurrentQuestion({ ...quizDetails.questions[index] })
    setCurrentQuestionIndex(index)
  }

  // Delete a question
  const deleteQuestion = (index) => {
    const updatedQuestions = [...quizDetails.questions]
    updatedQuestions.splice(index, 1)
    setQuizDetails((prev) => ({ ...prev, questions: updatedQuestions }))

    // Reset current question if needed
    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1))
      if (updatedQuestions.length > 0) {
        setCurrentQuestion({ ...updatedQuestions[updatedQuestions.length - 1] })
      } else {
        setCurrentQuestion({ ...emptyQuestion, id: "1" })
      }
    }

    toast({
      title: "Question Deleted",
      description: "The question has been removed from this quiz.",
    })
  }

  // Save the entire quiz to Supabase
  const saveQuiz = async () => {
    // Validate quiz details
    if (!quizDetails.title || !quizDetails.description || quizDetails.questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all quiz details and add at least one question.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create or edit quizzes.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Format questions for the create_quiz function
      const formattedQuestions = quizDetails.questions.map((q, index) => ({
        text: q.text,
        order: index + 1,
        options: q.options.map((opt) => ({
          text: opt.text,
          is_correct: opt.id === q.correctOption,
          key: opt.id,
        })),
      }))

      if (existingQuiz) {
        // Update existing quiz
        // First, delete the old quiz and its questions/options
        const { error: deleteError } = await supabase.from("quizzes").delete().eq("id", existingQuiz.id)

        if (deleteError) {
          throw new Error(`Error deleting existing quiz: ${deleteError.message}`)
        }
      }

      // Create new quiz using the stored procedure
      const { data, error } = await supabase.rpc("create_quiz", {
        p_title: quizDetails.title,
        p_description: quizDetails.description,
        p_difficulty: quizDetails.difficulty,
        p_time_limit: Number.parseInt(quizDetails.timeLimit),
        p_questions: formattedQuestions,
      })

      if (error) {
        throw new Error(`Error creating quiz: ${error.message}`)
      }

      toast({
        title: "Success!",
        description: existingQuiz ? "Quiz updated successfully." : "Quiz created successfully.",
      })

      // Notify parent component
      onComplete()
    } catch (error) {
      console.error("Error saving quiz:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="details">Quiz Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                name="title"
                value={quizDetails.title}
                onChange={handleDetailsChange}
                placeholder="Enter quiz title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={quizDetails.description}
                onChange={handleDetailsChange}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={quizDetails.difficulty}
                  onValueChange={(value) => handleSelectChange("difficulty", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  name="timeLimit"
                  type="number"
                  min="1"
                  max="60"
                  value={quizDetails.timeLimit}
                  onChange={handleDetailsChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setActiveTab("questions")}
              className="gap-2 bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90"
            >
              Continue to Questions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
            {/* Questions sidebar */}
            <Card className="h-[500px] flex flex-col bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="pt-0">
                  {quizDetails.questions.length > 0 ? (
                    <div className="space-y-2">
                      {quizDetails.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                            currentQuestionIndex === index
                              ? "bg-gradient-to-r from-quiz-purple/20 to-quiz-blue/20"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => editQuestion(index)}
                        >
                          <div className="truncate flex-1">
                            <span className="font-medium">Q{index + 1}:</span> {question.text}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteQuestion(index)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No questions added yet</div>
                  )}
                </CardContent>
              </ScrollArea>
              <CardFooter className="border-t pt-3">
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-gradient-to-r from-quiz-purple/10 to-quiz-blue/10 border-quiz-purple/20 hover:bg-quiz-purple/20"
                  onClick={() => {
                    setCurrentQuestion({ ...emptyQuestion, id: (quizDetails.questions.length + 1).toString() })
                    setCurrentQuestionIndex(quizDetails.questions.length)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add New Question
                </Button>
              </CardFooter>
            </Card>

            {/* Question editor */}
            <Card className="bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {currentQuestionIndex < quizDetails.questions.length
                    ? `Edit Question ${currentQuestionIndex + 1}`
                    : `New Question ${quizDetails.questions.length + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="questionText">Question</Label>
                    <Textarea
                      id="questionText"
                      value={currentQuestion.text}
                      onChange={handleQuestionTextChange}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {currentQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {option.id.toUpperCase()}
                        </Badge>
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(option.id, e.target.value)}
                          placeholder={`Option ${option.id.toUpperCase()}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <RadioGroup
                      value={currentQuestion.correctOption}
                      onValueChange={handleCorrectOptionChange}
                      className="grid grid-cols-2 gap-2"
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`}>Option {option.id.toUpperCase()}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Details
                </Button>
                <Button
                  onClick={saveQuestion}
                  className="gap-2 bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  Save Question
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={saveQuiz}
              disabled={isSaving}
              className="gap-2 bg-gradient-to-r from-quiz-purple to-quiz-blue hover:opacity-90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {existingQuiz ? "Updating Quiz..." : "Creating Quiz..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {existingQuiz ? "Update Quiz" : "Create Quiz"}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
