-- Create a function to delete a quiz and all related data
CREATE OR REPLACE FUNCTION delete_quiz(quiz_uuid UUID)
RETURNS boolean AS $$
DECLARE
  success BOOLEAN := false;
BEGIN
  -- Delete related user answers
  DELETE FROM user_answers
  WHERE question_id IN (
    SELECT id FROM questions WHERE quiz_id = quiz_uuid
  );
  
  -- Delete related user quiz results
  DELETE FROM user_quiz_results
  WHERE quiz_id = quiz_uuid;
  
  -- Delete options for all questions in the quiz
  DELETE FROM options
  WHERE question_id IN (
    SELECT id FROM questions WHERE quiz_id = quiz_uuid
  );
  
  -- Delete questions
  DELETE FROM questions
  WHERE quiz_id = quiz_uuid;
  
  -- Finally delete the quiz
  DELETE FROM quizzes
  WHERE id = quiz_uuid;
  
  -- Check if the quiz was deleted
  IF NOT EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_uuid) THEN
    success := true;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql;
