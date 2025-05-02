<?php
require_once 'config.php';
require_once 'helpers.php';

/**
 * Handle quiz-related requests
 *
 * @param string $method HTTP method
 * @param string|null $id Quiz ID
 * @param string|null $action Additional action
 */
function handleQuizzes($method, $id, $action) {
    // Special case for quiz actions
    if ($id && $action) {
        switch ($action) {
            case 'questions':
                handleQuizQuestions($method, $id);
                return;
                
            case 'submit':
                if ($method !== 'POST') {
                    sendResponse(['error' => 'Method not allowed'], 405);
                }
                submitQuizAttempt($id);
                return;
        }
    }
    
    // Standard CRUD operations
    switch ($method) {
        case 'GET':
            if ($id) {
                getQuiz($id);
            } else {
                getQuizzes();
            }
            break;
            
        case 'POST':
            createQuiz();
            break;
            
        case 'PUT':
            if (!$id) {
                sendResponse(['error' => 'Quiz ID is required'], 400);
            }
            updateQuiz($id);
            break;
            
        case 'DELETE':
            if (!$id) {
                sendResponse(['error' => 'Quiz ID is required'], 400);
            }
            deleteQuiz($id);
            break;
            
        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
}

/**
 * Get all quizzes
 */
function getQuizzes() {
    // Optional query parameters
    $limit = $_GET['limit'] ?? 100;
    $offset = $_GET['offset'] ?? 0;
    
    // Build query
    $query = [
        'select' => '*',
        'limit' => $limit,
        'offset' => $offset,
        'order' => 'created_at.desc'
    ];
    
    // Get quizzes from Supabase
    $response = supabaseRequest(
        'GET', 
        '/rest/v1/quizzes?' . http_build_query($query)
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error fetching quizzes',
            'details' => $response['data']
        ], $response['status']);
    }
    
    sendResponse($response['data']);
}

/**
 * Get a specific quiz
 *
 * @param string $id Quiz ID
 */
function getQuiz($id) {
    // Get quiz from Supabase
    $response = supabaseRequest(
        'GET', 
        '/rest/v1/quizzes?id=eq.' . urlencode($id) . '&select=*'
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error fetching quiz',
            'details' => $response['data']
        ], $response['status']);
    }
    
    if (empty($response['data'])) {
        sendResponse(['error' => 'Quiz not found'], 404);
    }
    
    sendResponse($response['data'][0]);
}

/**
 * Create a new quiz
 */
function createQuiz() {
    // Check authentication
    $authResult = authenticateUser();
    if (!$authResult['authenticated']) {
        sendResponse(['error' => 'Authentication required'], 401);
    }
    
    $data = getRequestData();
    
    // Validate required fields
    if (empty($data['title']) || empty($data['description'])) {
        sendResponse(['error' => 'Title and description are required'], 400);
    }
    
    // Prepare quiz data
    $quizData = [
        'id' => $data['id'] ?? uniqid(),
        'title' => $data['title'],
        'description' => $data['description'],
        'difficulty' => $data['difficulty'] ?? 'Medium',
        'time_limit' => $data['timeLimit'] ?? 10,
        'user_id' => $authResult['user']['id'],
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    // Insert quiz into Supabase
    $response = supabaseRequest(
        'POST', 
        '/rest/v1/quizzes', 
        $quizData, 
        getAuthToken()
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error creating quiz',
            'details' => $response['data']
        ], $response['status']);
    }
    
    // If questions provided, save them too
    if (!empty($data['questions']) && is_array($data['questions'])) {
        saveQuizQuestions($quizData['id'], $data['questions']);
    }
    
    sendResponse([
        'message' => 'Quiz created successfully',
        'id' => $quizData['id']
    ]);
}

/**
 * Update an existing quiz
 *
 * @param string $id Quiz ID
 */
function updateQuiz($id) {
    // Check authentication
    $authResult = authenticateUser();
    if (!$authResult['authenticated']) {
        sendResponse(['error' => 'Authentication required'], 401);
    }
    
    // Check quiz ownership
    checkQuizOwnership($id, $authResult['user']['id']);
    
    $data = getRequestData();
    
    // Prepare quiz data
    $quizData = [
        'title' => $data['title'] ?? null,
        'description' => $data['description'] ?? null,
        'difficulty' => $data['difficulty'] ?? null,
        'time_limit' => $data['timeLimit'] ?? null,
        'updated_at' => date('c')
    ];
    
    // Remove null values
    $quizData = array_filter($quizData, function($value) {
        return $value !== null;
    });
    
    if (empty($quizData)) {
        sendResponse(['error' => 'No data provided for update'], 400);
    }
    
    // Update quiz in Supabase
    $response = supabaseRequest(
        'PATCH', 
        '/rest/v1/quizzes?id=eq.' . urlencode($id), 
        $quizData, 
        getAuthToken()
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error updating quiz',
            'details' => $response['data']
        ], $response['status']);
    }
    
    // If questions provided, update them too
    if (isset($data['questions']) && is_array($data['questions'])) {
        // Delete existing questions
        supabaseRequest(
            'DELETE',
            '/rest/v1/quiz_questions?quiz_id=eq.' . urlencode($id),
            null,
            getAuthToken()
        );
        
        // Save new questions
        saveQuizQuestions($id, $data['questions']);
    }
    
    sendResponse(['message' => 'Quiz updated successfully']);
}

/**
 * Delete a quiz
 *
 * @param string $id Quiz ID
 */
function deleteQuiz($id) {
    // Check authentication
    $authResult = authenticateUser();
    if (!$authResult['authenticated']) {
        sendResponse(['error' => 'Authentication required'], 401);
    }
    
    // Check quiz ownership
    checkQuizOwnership($id, $authResult['user']['id']);
    
    // Delete questions first (due to foreign key constraint)
    $questionsResponse = supabaseRequest(
        'DELETE',
        '/rest/v1/quiz_questions?quiz_id=eq.' . urlencode($id),
        null,
        getAuthToken()
    );
    
    // Delete quiz from Supabase
    $response = supabaseRequest(
        'DELETE', 
        '/rest/v1/quizzes?id=eq.' . urlencode($id), 
        null, 
        getAuthToken()
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error deleting quiz',
            'details' => $response['data']
        ], $response['status']);
    }
    
    sendResponse(['message' => 'Quiz deleted successfully']);
}

/**
 * Handle quiz questions
 *
 * @param string $method HTTP method
 * @param string $quizId Quiz ID
 */
function handleQuizQuestions($method, $quizId) {
    switch ($method) {
        case 'GET':
            getQuizQuestions($quizId);
            break;
            
        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
}

/**
 * Get questions for a specific quiz
 *
 * @param string $quizId Quiz ID
 */
function getQuizQuestions($quizId) {
    // Get questions from Supabase
    $response = supabaseRequest(
        'GET', 
        '/rest/v1/quiz_questions?quiz_id=eq.' . urlencode($quizId) . '&select=*&order=question_order.asc'
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error fetching quiz questions',
            'details' => $response['data']
        ], $response['status']);
    }
    
    sendResponse($response['data']);
}

/**
 * Save quiz questions
 *
 * @param string $quizId Quiz ID
 * @param array $questions Questions data
 */
function saveQuizQuestions($quizId, $questions) {
    foreach ($questions as $index => $question) {
        // Validate question data
        if (empty($question['text']) || empty($question['options']) || !isset($question['correctOption'])) {
            continue; // Skip invalid questions
        }
        
        // Prepare question data
        $questionData = [
            'id' => $question['id'] ?? uniqid(),
            'quiz_id' => $quizId,
            'text' => $question['text'],
            'options' => json_encode($question['options']),
            'correct_option' => $question['correctOption'],
            'question_order' => $index,
            'created_at' => date('c'),
            'updated_at' => date('c')
        ];
        
        // Insert question into Supabase
        supabaseRequest(
            'POST', 
            '/rest/v1/quiz_questions', 
            $questionData, 
            getAuthToken()
        );
    }
}

/**
 * Submit a quiz attempt
 *
 * @param string $quizId Quiz ID
 */
function submitQuizAttempt($quizId) {
    $data = getRequestData();
    
    // Validate required data
    if (!isset($data['answers']) || !is_array($data['answers'])) {
        sendResponse(['error' => 'Answers are required'], 400);
    }
    
    // Get user if authenticated
    $authResult = authenticateUser();
    $userId = $authResult['authenticated'] ? $authResult['user']['id'] : null;
    
    // Get correct answers from database
    $questionsResponse = supabaseRequest(
        'GET', 
        '/rest/v1/quiz_questions?quiz_id=eq.' . urlencode($quizId) . '&select=id,correct_option'
    );
    
    if ($questionsResponse['status'] >= 400 || empty($questionsResponse['data'])) {
        sendResponse([
            'error' => 'Error fetching quiz questions',
            'details' => $questionsResponse['data']
        ], $questionsResponse['status']);
    }
    
    // Create a map of question ids to correct answers
    $correctAnswers = [];
    foreach ($questionsResponse['data'] as $question) {
        $correctAnswers[$question['id']] = $question['correct_option'];
    }
    
    // Calculate score
    $totalQuestions = count($correctAnswers);
    $correctCount = 0;
    
    foreach ($data['answers'] as $questionId => $answer) {
        if (isset($correctAnswers[$questionId]) && $correctAnswers[$questionId] === $answer) {
            $correctCount++;
        }
    }
    
    $score = $totalQuestions > 0 ? ($correctCount / $totalQuestions) * 100 : 0;
    $scoreRounded = round($score, 2);
    
    // Save attempt data
    $attemptData = [
        'id' => uniqid(),
        'quiz_id' => $quizId,
        'user_id' => $userId,
        'score' => $scoreRounded,
        'answers' => json_encode($data['answers']),
        'created_at' => date('c')
    ];
    
    // Insert attempt into Supabase
    $response = supabaseRequest(
        'POST', 
        '/rest/v1/quiz_attempts', 
        $attemptData, 
        getAuthToken()
    );
    
    // If authenticated user, update leaderboard
    if ($userId) {
        updateLeaderboard($quizId, $userId, $data['name'] ?? 'Anonymous', $scoreRounded);
    }
    
    sendResponse([
        'score' => $scoreRounded,
        'correctCount' => $correctCount,
        'totalQuestions' => $totalQuestions
    ]);
}

/**
 * Check if a user owns a quiz
 *
 * @param string $quizId Quiz ID
 * @param string $userId User ID
 */
function checkQuizOwnership($quizId, $userId) {
    // Get quiz from Supabase
    $response = supabaseRequest(
        'GET', 
        '/rest/v1/quizzes?id=eq.' . urlencode($quizId) . '&select=user_id', 
        null, 
        getAuthToken()
    );
    
    if ($response['status'] >= 400 || empty($response['data'])) {
        sendResponse(['error' => 'Quiz not found'], 404);
    }
    
    if ($response['data'][0]['user_id'] !== $userId) {
        sendResponse(['error' => 'Unauthorized to modify this quiz'], 403);
    }
}

/**
 * Update the leaderboard after a quiz attempt
 *
 * @param string $quizId Quiz ID
 * @param string $userId User ID
 * @param string $name User's name
 * @param float $score Score value
 */
function updateLeaderboard($quizId, $userId, $name, $score) {
    // Check if user already has a score on this quiz
    $response = supabaseRequest(
        'GET', 
        '/rest/v1/leaderboard?quiz_id=eq.' . urlencode($quizId) . '&user_id=eq.' . urlencode($userId) . '&select=id,score', 
        null, 
        getAuthToken()
    );
    
    if (!empty($response['data'])) {
        $existingEntry = $response['data'][0];
        
        // Only update if new score is higher
        if ($score <= $existingEntry['score']) {
            return;
        }
        
        // Update existing entry
        supabaseRequest(
            'PATCH', 
            '/rest/v1/leaderboard?id=eq.' . urlencode($existingEntry['id']), 
            [
                'score' => $score,
                'updated_at' => date('c')
            ], 
            getAuthToken()
        );
    } else {
        // Create new leaderboard entry
        $leaderboardData = [
            'id' => uniqid(),
            'quiz_id' => $quizId,
            'user_id' => $userId,
            'name' => $name,
            'score' => $score,
            'created_at' => date('c'),
            'updated_at' => date('c')
        ];
        
        supabaseRequest(
            'POST', 
            '/rest/v1/leaderboard', 
            $leaderboardData, 
            getAuthToken()
        );
    }
} 