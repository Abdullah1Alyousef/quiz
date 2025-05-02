<?php
require_once 'config.php';
require_once 'helpers.php';

/**
 * Handle authentication requests
 *
 * @param string $method HTTP method
 * @param string $action The action to perform (signup, login, etc.)
 */
function handleAuth($method, $action) {
    switch ($action) {
        case 'signup':
            if ($method !== 'POST') {
                sendResponse(['error' => 'Method not allowed'], 405);
            }
            signup();
            break;
            
        case 'login':
            if ($method !== 'POST') {
                sendResponse(['error' => 'Method not allowed'], 405);
            }
            login();
            break;
            
        case 'user':
            if ($method !== 'GET') {
                sendResponse(['error' => 'Method not allowed'], 405);
            }
            getCurrentUser();
            break;
            
        case 'logout':
            if ($method !== 'POST') {
                sendResponse(['error' => 'Method not allowed'], 405);
            }
            logout();
            break;
            
        default:
            sendResponse(['error' => 'Invalid auth action'], 404);
    }
}

/**
 * Handle user signup
 */
function signup() {
    $data = getRequestData();
    
    // Check required fields
    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(['error' => 'Email and password are required'], 400);
    }
    
    // Validate email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendResponse(['error' => 'Invalid email format'], 400);
    }
    
    // Validate password length
    if (strlen($data['password']) < 6) {
        sendResponse(['error' => 'Password must be at least 6 characters'], 400);
    }
    
    // Create user in Supabase
    $response = supabaseRequest('POST', '/auth/v1/signup', [
        'email' => $data['email'],
        'password' => $data['password'],
        'data' => [
            'full_name' => $data['full_name'] ?? ''
        ]
    ]);
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => $response['data']['message'] ?? 'Error creating user',
            'details' => $response['data']
        ], $response['status']);
    }
    
    sendResponse([
        'message' => 'User created successfully',
        'user' => $response['data']
    ]);
}

/**
 * Handle user login
 */
function login() {
    $data = getRequestData();
    
    // Check required fields
    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(['error' => 'Email and password are required'], 400);
    }
    
    // Login user in Supabase
    $response = supabaseRequest('POST', '/auth/v1/token?grant_type=password', [
        'email' => $data['email'],
        'password' => $data['password']
    ]);
    
    if ($response['status'] >= 400) {
        sendResponse([
            'error' => $response['data']['error_description'] ?? 'Login failed',
            'details' => $response['data']
        ], $response['status']);
    }
    
    sendResponse([
        'message' => 'Login successful',
        'session' => $response['data']
    ]);
}

/**
 * Get current user info
 */
function getCurrentUser() {
    $authResult = authenticateUser();
    
    if (!$authResult['authenticated']) {
        sendResponse(['error' => $authResult['message']], 401);
    }
    
    sendResponse($authResult['user']);
}

/**
 * Logout user
 */
function logout() {
    $token = getAuthToken();
    
    if (!$token) {
        sendResponse(['error' => 'No authentication token provided'], 401);
    }
    
    $response = supabaseRequest('POST', '/auth/v1/logout', null, $token);
    
    sendResponse(['message' => 'Logout successful']);
} 