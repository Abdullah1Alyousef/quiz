<?php
require_once 'config.php';
require_once 'helpers.php';

/**
 * Handle leaderboard-related requests
 *
 * @param string $method HTTP method
 * @param string|null $id Quiz ID
 * @param string|null $action Additional action
 */
function handleLeaderboard($method, $id, $action) {
    switch ($method) {
        case 'GET':
            if ($id) {
                getLeaderboardByQuiz($id);
            } else {
                sendResponse(['error' => 'Quiz ID is required'], 400);
            }
            break;
            
        case 'POST':
            if ($id && $action === 'entry') {
                createLeaderboardEntry($id);
            } else {
                sendResponse(['error' => 'Invalid leaderboard action'], 400);
            }
            break;
            
        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
}

/**
 * Get leaderboard entries for a specific quiz
 *
 * @param string $id Quiz ID
 */
function getLeaderboardByQuiz($id) {
    // Optional query parameters
    $limit = $_GET['limit'] ?? 10;
    $offset = $_GET['offset'] ?? 0;
    
    // Build query
    $query = [
        'select' => '*',
        'limit' => $limit,
        'offset' => $offset,
        'order' => 'score.desc,updated_at.asc'
    ];
    
    // Get leaderboard entries from Supabase
    $response = supabaseRequest(
        'GET', 
        '/rest/v1/leaderboard?quiz_id=eq.' . urlencode($id) . '&' . http_build_query($query)
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error fetching leaderboard',
            'details' => $response['data']
        ], $response['status']);
    }
    
    // If no entries exist, generate default ones
    if (empty($response['data'])) {
        $defaultEntries = generateDefaultLeaderboard($id);
        sendResponse($defaultEntries);
    } else {
        sendResponse($response['data']);
    }
}

/**
 * Create a leaderboard entry
 *
 * @param string $quizId Quiz ID
 */
function createLeaderboardEntry($quizId) {
    $data = getRequestData();
    
    // Check required fields
    if (empty($data['name']) || !isset($data['score'])) {
        sendResponse(['error' => 'Name and score are required'], 400);
    }
    
    // Get user if authenticated
    $authResult = authenticateUser();
    $userId = $authResult['authenticated'] ? $authResult['user']['id'] : null;
    
    // Check if user already has a score on this quiz
    if ($userId) {
        $existingResponse = supabaseRequest(
            'GET', 
            '/rest/v1/leaderboard?quiz_id=eq.' . urlencode($quizId) . '&user_id=eq.' . urlencode($userId) . '&select=id,score', 
            null, 
            getAuthToken()
        );
        
        if (!empty($existingResponse['data'])) {
            $existingEntry = $existingResponse['data'][0];
            
            // Only update if new score is higher
            if ($data['score'] <= $existingEntry['score']) {
                sendResponse([
                    'message' => 'Existing score is higher',
                    'entry' => $existingEntry
                ]);
                return;
            }
            
            // Update existing entry
            $response = supabaseRequest(
                'PATCH', 
                '/rest/v1/leaderboard?id=eq.' . urlencode($existingEntry['id']), 
                [
                    'score' => $data['score'],
                    'name' => $data['name'],
                    'updated_at' => date('c')
                ], 
                getAuthToken()
            );
            
            if ($response['status'] >= 400) {
                sendResponse([
                    'error' => 'Error updating leaderboard entry',
                    'details' => $response['data']
                ], $response['status']);
            }
            
            sendResponse([
                'message' => 'Leaderboard entry updated',
                'id' => $existingEntry['id']
            ]);
            return;
        }
    }
    
    // Create new leaderboard entry
    $entryData = [
        'id' => uniqid(),
        'quiz_id' => $quizId,
        'user_id' => $userId,
        'name' => $data['name'],
        'score' => $data['score'],
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    $response = supabaseRequest(
        'POST', 
        '/rest/v1/leaderboard', 
        $entryData, 
        getAuthToken()
    );
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => 'Error creating leaderboard entry',
            'details' => $response['data']
        ], $response['status']);
    }
    
    sendResponse([
        'message' => 'Leaderboard entry created',
        'id' => $entryData['id']
    ]);
}

/**
 * Generate default leaderboard entries for a quiz
 *
 * @param string $quizId Quiz ID
 * @return array Array of default leaderboard entries
 */
function generateDefaultLeaderboard($quizId) {
    $names = [
        'Alex Johnson', 'Sam Wilson', 'Jamie Brown', 'Taylor Davis',
        'Jordan Miller', 'Casey Martin', 'Riley Lee', 'Morgan Harris',
        'Quinn White', 'Avery Jackson'
    ];
    
    $entries = [];
    $date = new DateTime();
    
    foreach ($names as $index => $name) {
        // Create random score between 70 and 100
        $score = rand(70, 100);
        
        // Each entry is a few hours earlier than the previous one
        $dateOffset = new DateInterval('PT' . ($index * 3) . 'H');
        $date->sub($dateOffset);
        
        $entries[] = [
            'id' => 'default_' . ($index + 1),
            'quiz_id' => $quizId,
            'user_id' => null,
            'name' => $name,
            'score' => $score,
            'created_at' => $date->format('c'),
            'updated_at' => $date->format('c')
        ];
    }
    
    return $entries;
} 