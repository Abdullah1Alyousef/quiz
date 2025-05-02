-- Create a function to increment participant count
CREATE OR REPLACE FUNCTION increment_quiz_participants(quiz_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Check if the quiz exists
  IF EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_uuid) THEN
    -- Create participants column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'quizzes' AND column_name = 'participants'
    ) THEN
      ALTER TABLE quizzes ADD COLUMN participants INTEGER DEFAULT 0;
    END IF;
    
    -- Increment the participant count
    UPDATE quizzes 
    SET participants = COALESCE(participants, 0) + 1 
    WHERE id = quiz_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;
