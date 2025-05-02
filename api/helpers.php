<?php
require_once 'config.php';

/**
 * Make an HTTP request to Supabase API
 *
 * @param string $method HTTP method (GET, POST, PUT, DELETE)
 * @param string $endpoint API endpoint (without base URL)
 * @param array $data Request data for POST/PUT methods
 * @param string $authToken JWT token for authenticated requests (optional)
 * @return array Response data
 */
function supabaseRequest($method, $endpoint, $data = null, $authToken = null) {
    $url = SUPABASE_URL . $endpoint;
    
    $headers = [
        'Content-Type: application/json',
        'apikey: ' . SUPABASE_ANON_KEY,
    ];
    
    if ($authToken) {
        $headers[] = 'Authorization: Bearer ' . $authToken;
    }
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    
    if ($data && ($method === 'POST' || $method === 'PUT' || $method === 'PATCH')) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    $responseData = json_decode($response, true);
    
    return [
        'status' => $httpCode,
        'data' => $responseData
    ];
}

/**
 * Get the JWT token from the Authorization header
 *
 * @return string|null The token or null if not found
 */
function getAuthToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $auth = $headers['Authorization'];
        if (strpos($auth, 'Bearer ') === 0) {
            return substr($auth, 7);
        }
    }
    
    return null;
}

/**
 * Verify if a user is authenticated
 *
 * @return array User data and status
 */
function authenticateUser() {
    $token = getAuthToken();
    
    if (!$token) {
        return [
            'authenticated' => false,
            'message' => 'No authentication token provided',
            'user' => null
        ];
    }
    
    $response = supabaseRequest('GET', '/auth/v1/user', null, $token);
    
    if ($response['status'] !== 200) {
        return [
            'authenticated' => false,
            'message' => 'Invalid or expired token',
            'user' => null
        ];
    }
    
    return [
        'authenticated' => true,
        'message' => 'Authentication successful',
        'user' => $response['data']
    ];
}

/**
 * Send a JSON response
 *
 * @param array $data Response data
 * @param int $statusCode HTTP status code
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Get request data from JSON input
 *
 * @return array Request data
 */
function getRequestData() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
} 