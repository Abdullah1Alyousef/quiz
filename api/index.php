<?php
require_once 'config.php';
require_once 'helpers.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$resource = $request[0] ?? '';
$id = $request[1] ?? null;
$action = $request[2] ?? null;

// Route the request to the appropriate handler
try {
    switch ($resource) {
        case 'quizzes':
            include_once 'quizzes.php';
            handleQuizzes($method, $id, $action);
            break;
            
        case 'auth':
            include_once 'auth.php';
            handleAuth($method, $action);
            break;
            
        case 'leaderboard':
            include_once 'leaderboard.php';
            handleLeaderboard($method, $id, $action);
            break;
            
        case 'health':
            // Health check endpoint
            sendResponse(['status' => 'OK', 'message' => 'API is running']);
            break;
            
        default:
            // If no valid resource is specified
            sendResponse(['error' => 'Invalid API endpoint'], 404);
    }
} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
} 