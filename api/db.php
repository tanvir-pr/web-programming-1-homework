<?php
/**
 * PDO connection — change credentials on InfinityFree / Nethely / localhost XAMPP.
 * Matches homework pattern: host, db name, user, password.
 */
$host = "localhost";
$db   = "webprog1_homework";
$user = "root";
$pass = "";

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
