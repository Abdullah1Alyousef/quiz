<?php
require_once 'config.php';
require_once 'helpers.php';

// File to setup the database tables in Supabase

// Check if this is a direct access (not included in another file)
if (basename($_SERVER['SCRIPT_NAME']) === 'setup.php') {
    setupDatabase();
}

/**
 * Create all necessary database tables in Supabase
 */
function setupDatabase() {
    $serviceKey = SUPABASE_SERVICE_KEY;
    
    echo "<h1>Supabase Database Setup</h1>";
    echo "<p>Creating tables for the Quiz Leaderboard application...</p>";
    
    // Create quizzes table
    echo "<h2>Creating quizzes table</h2>";
    $response = supabaseRequest(
        'POST',
        '/rest/v1/rpc/table_create',
        [
            'table_name' => 'quizzes',
            'columns' => [
                [
                    'name' => 'id',
                    'type' => 'text',
                    'primary' => true
                ],
                [
                    'name' => 'title',
                    'type' => 'text'
                ],
                [
                    'name' => 'description',
                    'type' => 'text'
                ],
                [
                    'name' => 'difficulty',
                    'type' => 'text'
                ],
                [
                    'name' => 'time_limit',
                    'type' => 'integer'
                ],
                [
                    'name' => 'user_id',
                    'type' => 'uuid'
                ],
                [
                    'name' => 'created_at',
                    'type' => 'timestamp with time zone'
                ],
                [
                    'name' => 'updated_at',
                    'type' => 'timestamp with time zone'
                ]
            ]
        ],
        $serviceKey
    );
    
    echo "<pre>" . print_r($response, true) . "</pre>";
    
    // Create quiz_questions table
    echo "<h2>Creating quiz_questions table</h2>";
    $response = supabaseRequest(
        'POST',
        '/rest/v1/rpc/table_create',
        [
            'table_name' => 'quiz_questions',
            'columns' => [
                [
                    'name' => 'id',
                    'type' => 'text',
                    'primary' => true
                ],
                [
                    'name' => 'quiz_id',
                    'type' => 'text'
                ],
                [
                    'name' => 'text',
                    'type' => 'text'
                ],
                [
                    'name' => 'options',
                    'type' => 'jsonb'
                ],
                [
                    'name' => 'correct_option',
                    'type' => 'text'
                ],
                [
                    'name' => 'question_order',
                    'type' => 'integer'
                ],
                [
                    'name' => 'created_at',
                    'type' => 'timestamp with time zone'
                ],
                [
                    'name' => 'updated_at',
                    'type' => 'timestamp with time zone'
                ]
            ]
        ],
        $serviceKey
    );
    
    echo "<pre>" . print_r($response, true) . "</pre>";
    
    // Create quiz_attempts table
    echo "<h2>Creating quiz_attempts table</h2>";
    $response = supabaseRequest(
        'POST',
        '/rest/v1/rpc/table_create',
        [
            'table_name' => 'quiz_attempts',
            'columns' => [
                [
                    'name' => 'id',
                    'type' => 'text',
                    'primary' => true
                ],
                [
                    'name' => 'quiz_id',
                    'type' => 'text'
                ],
                [
                    'name' => 'user_id',
                    'type' => 'uuid'
                ],
                [
                    'name' => 'score',
                    'type' => 'numeric'
                ],
                [
                    'name' => 'answers',
                    'type' => 'jsonb'
                ],
                [
                    'name' => 'created_at',
                    'type' => 'timestamp with time zone'
                ]
            ]
        ],
        $serviceKey
    );
    
    echo "<pre>" . print_r($response, true) . "</pre>";
    
    // Create leaderboard table
    echo "<h2>Creating leaderboard table</h2>";
    $response = supabaseRequest(
        'POST',
        '/rest/v1/rpc/table_create',
        [
            'table_name' => 'leaderboard',
            'columns' => [
                [
                    'name' => 'id',
                    'type' => 'text',
                    'primary' => true
                ],
                [
                    'name' => 'quiz_id',
                    'type' => 'text'
                ],
                [
                    'name' => 'user_id',
                    'type' => 'uuid'
                ],
                [
                    'name' => 'name',
                    'type' => 'text'
                ],
                [
                    'name' => 'score',
                    'type' => 'numeric'
                ],
                [
                    'name' => 'created_at',
                    'type' => 'timestamp with time zone'
                ],
                [
                    'name' => 'updated_at',
                    'type' => 'timestamp with time zone'
                ]
            ]
        ],
        $serviceKey
    );
    
    echo "<pre>" . print_r($response, true) . "</pre>";
    
    // Create foreign key constraints
    echo "<h2>Setting up foreign key constraints</h2>";
    
    // Foreign keys can be set up using SQL, but this requires additional privileges
    // Best to set these up manually in the Supabase dashboard
    
    echo "<p>Setup complete! You may need to set up foreign key constraints manually in the Supabase dashboard.</p>";
    
    // Setup RLS (Row Level Security) policies
    echo "<h2>Setting up RLS policies</h2>";
    echo "<p>For security reasons, RLS policies should be configured manually in the Supabase dashboard.</p>";
    echo "<p>Here are recommended policies for each table:</p>";
    
    echo "<ul>";
    echo "<li>quizzes: Allow authenticated users to view all quizzes, but only modify their own</li>";
    echo "<li>quiz_questions: Allow authenticated users to view all questions, but only modify their own quiz questions</li>";
    echo "<li>quiz_attempts: Allow authenticated users to view and create quiz attempts</li>";
    echo "<li>leaderboard: Allow anyone to view leaderboard entries, but only authenticated users can create/modify entries</li>";
    echo "</ul>";
    
    echo "<p>Database setup is now complete.</p>";
} 