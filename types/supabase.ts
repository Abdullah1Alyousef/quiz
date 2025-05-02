export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          difficulty: "Easy" | "Medium" | "Hard"
          time_limit: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          difficulty: "Easy" | "Medium" | "Hard"
          time_limit: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          difficulty?: "Easy" | "Medium" | "Hard"
          time_limit?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          text: string
          order_num: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          text: string
          order_num: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          text?: string
          order_num?: number
          created_at?: string
          updated_at?: string
        }
      }
      options: {
        Row: {
          id: string
          question_id: string
          text: string
          is_correct: boolean
          option_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          text: string
          is_correct: boolean
          option_key: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          text?: string
          is_correct?: boolean
          option_key?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_quiz_results: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          completed_at: string
          time_taken: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score: number
          completed_at?: string
          time_taken?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          completed_at?: string
          time_taken?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_answers: {
        Row: {
          id: string
          result_id: string
          question_id: string
          selected_option_id: string | null
          is_correct: boolean
          created_at: string
        }
        Insert: {
          id?: string
          result_id: string
          question_id: string
          selected_option_id?: string | null
          is_correct: boolean
          created_at?: string
        }
        Update: {
          id?: string
          result_id?: string
          question_id?: string
          selected_option_id?: string | null
          is_correct?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      quiz_leaderboards: {
        Row: {
          quiz_id: string | null
          quiz_title: string | null
          user_id: string | null
          user_name: string | null
          avatar_url: string | null
          score: number | null
          completed_at: string | null
          rank: number | null
        }
      }
    }
    Functions: {
      get_quiz_leaderboard: {
        Args: {
          quiz_uuid: string
          limit_count?: number
        }
        Returns: {
          user_id: string
          user_name: string
          avatar_url: string | null
          score: number
          completed_at: string
          rank: number
        }[]
      }
      create_quiz: {
        Args: {
          p_title: string
          p_description: string
          p_difficulty: string
          p_time_limit: number
          p_questions: Json
        }
        Returns: string
      }
      submit_quiz_results: {
        Args: {
          p_quiz_id: string
          p_score: number
          p_time_taken: number
          p_answers: Json
        }
        Returns: string
      }
    }
  }
}
