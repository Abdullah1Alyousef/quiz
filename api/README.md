# Quiz Leaderboard API

This is the backend API for the Quiz Leaderboard application. It is built using PHP and connects to a Supabase database.

## Setup

1. Upload these files to your `/api` directory in your Namecheap hosting.
2. Visit `/api/setup.php` in your browser to set up the database tables in Supabase.
3. After running setup, configure Row Level Security (RLS) policies in the Supabase dashboard.

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user

  - Request: `{ "email": "user@example.com", "password": "password123", "full_name": "John Doe" }`
  - Response: User data

- `POST /api/auth/login`: Login a user

  - Request: `{ "email": "user@example.com", "password": "password123" }`
  - Response: Session data with access token

- `GET /api/auth/user`: Get current user data (requires authentication)

  - Response: User data

- `POST /api/auth/logout`: Logout current user (requires authentication)
  - Response: Success message

### Quizzes

- `GET /api/quizzes`: Get all quizzes

  - Query params: `limit`, `offset`
  - Response: Array of quizzes

- `GET /api/quizzes/{id}`: Get a specific quiz

  - Response: Quiz data

- `POST /api/quizzes`: Create a new quiz (requires authentication)

  - Request:

  ```json
  {
    "title": "My Quiz",
    "description": "Quiz description",
    "difficulty": "Medium",
    "timeLimit": 10,
    "questions": [
      {
        "text": "Question text",
        "options": [
          { "id": "a", "text": "Option A" },
          { "id": "b", "text": "Option B" },
          { "id": "c", "text": "Option C" },
          { "id": "d", "text": "Option D" }
        ],
        "correctOption": "a"
      }
    ]
  }
  ```

  - Response: Quiz ID

- `PUT /api/quizzes/{id}`: Update a quiz (requires authentication, must be owner)

  - Request: Same format as create
  - Response: Success message

- `DELETE /api/quizzes/{id}`: Delete a quiz (requires authentication, must be owner)

  - Response: Success message

- `GET /api/quizzes/{id}/questions`: Get questions for a quiz

  - Response: Array of questions

- `POST /api/quizzes/{id}/submit`: Submit quiz answers
  - Request:
  ```json
  {
    "answers": {
      "question_id_1": "a",
      "question_id_2": "b"
    },
    "name": "Player Name"
  }
  ```
  - Response: Score data

### Leaderboard

- `GET /api/leaderboard/{quizId}`: Get leaderboard for a quiz

  - Query params: `limit`, `offset`
  - Response: Array of leaderboard entries

- `POST /api/leaderboard/{quizId}/entry`: Add or update leaderboard entry
  - Request: `{ "name": "Player Name", "score": 85 }`
  - Response: Entry ID

## Integration with Frontend

To connect your frontend to this API:

1. Update your frontend API calls to point to these endpoints
2. Set the appropriate authentication headers for protected endpoints:
   - `Authorization: Bearer YOUR_JWT_TOKEN`

## Security Notes

- All authentication is handled via Supabase authentication
- Row Level Security should be configured in the Supabase dashboard
- CORS headers are included to allow cross-origin requests
- Use HTTPS in production
