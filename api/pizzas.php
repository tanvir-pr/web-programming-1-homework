<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require __DIR__ . "/db.php";

$method = $_SERVER["REQUEST_METHOD"];

function read_json_body(): array
{
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function veg_flag($v): int
{
    if (is_bool($v)) {
        return $v ? 1 : 0;
    }
    if (is_numeric($v)) {
        return (int)$v === 1 ? 1 : 0;
    }
    return 0;
}

try {
    switch ($method) {
        case "GET":
            $stmt = $pdo->query(
                "SELECT id, pname, categoryname, vegetarian FROM pizzas ORDER BY id ASC"
            );
            $rows = $stmt->fetchAll();
            foreach ($rows as &$row) {
                $row["vegetarian"] = (int)$row["vegetarian"];
                $row["id"] = (int)$row["id"];
            }
            unset($row);
            echo json_encode(["ok" => true, "data" => $rows]);
            break;

        case "POST":
            $data = read_json_body();
            $pname = isset($data["pname"]) ? trim((string)$data["pname"]) : "";
            $category =
                isset($data["categoryname"]) ? trim((string)$data["categoryname"]) : "";
            $veg = veg_flag($data["vegetarian"] ?? 0);
            if ($pname === "" || $category === "") {
                http_response_code(400);
                echo json_encode([
                    "ok" => false,
                    "error" => "pname and categoryname are required",
                ]);
                exit;
            }
            $stmt = $pdo->prepare(
                "INSERT INTO pizzas (pname, categoryname, vegetarian) VALUES (?, ?, ?)"
            );
            $stmt->execute([$pname, $category, $veg]);
            $id = (int)$pdo->lastInsertId();
            echo json_encode(["ok" => true, "id" => $id]);
            break;

        case "PUT":
            $data = read_json_body();
            $id = isset($data["id"]) ? (int)$data["id"] : 0;
            $pname = isset($data["pname"]) ? trim((string)$data["pname"]) : "";
            $category =
                isset($data["categoryname"]) ? trim((string)$data["categoryname"]) : "";
            $veg = veg_flag($data["vegetarian"] ?? 0);
            if ($id < 1 || $pname === "" || $category === "") {
                http_response_code(400);
                echo json_encode([
                    "ok" => false,
                    "error" => "id, pname and categoryname are required",
                ]);
                exit;
            }
            $stmt = $pdo->prepare(
                "UPDATE pizzas SET pname = ?, categoryname = ?, vegetarian = ? WHERE id = ?"
            );
            $stmt->execute([$pname, $category, $veg, $id]);
            echo json_encode(["ok" => true]);
            break;

        case "DELETE":
            $data = read_json_body();
            $id = isset($data["id"]) ? (int)$data["id"] : 0;
            if ($id < 1) {
                http_response_code(400);
                echo json_encode(["ok" => false, "error" => "id is required"]);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM pizzas WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["ok" => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["ok" => false, "error" => "Method not allowed"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Database error"]);
}
