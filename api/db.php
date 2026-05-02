<?php
/**
 * PDO connection — copy MySQL values from your host’s control panel (InfinityFree:
 * Dashboard → MySQL Databases → hostname like sql*.infinityfree.com, DB name, user, password).
 * Homework note: use the hostname your provider shows for PHP on that server (often not plain
 * “localhost” on free hosts — follow the red-labelled values in the assignment PDFs).
 */
$host = "sql113.infinityfree.com";
$db   = "if0_41812004_project";
$user = "if0_41812004";
$pass = "GRDh2Koe9QWv1pS";

// Example after uploading to InfinityFree (replace with YOUR panel values):
// $host = "sql123.infinityfree.com";
// $db   = "if0_XXXXXX_yourdbname";
// $user = "if0_XXXXXX";
// $pass = "your_database_password";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["ok" => false, "error" => "Database connection failed"]);
    exit;
}
