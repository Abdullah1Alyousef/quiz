<?php
// Supabase Configuration
define('SUPABASE_URL', 'https://ojbxcgtehezzkhhlmjyb.supabase.co');
define('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYnhjZ3RlaGV6emtoaGxtanliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjg0ODcsImV4cCI6MjA2MTc0NDQ4N30.P54eyOdx0GTSXpB6BqzKcoDZs3bUT4CnIWS7B7-5ubM');
define('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYnhjZ3RlaGV6emtoaGxtanliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE2ODQ4NywiZXhwIjoyMDYxNzQ0NDg3fQ.0tYV34sTIYQ8_5iwSotubIM8xMTtKEq9n7qtQ6t28Wo');

// Response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
} 