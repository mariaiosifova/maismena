<?php
session_start();
header('Access-Control-Allow-Origin: https://www.maismena.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $vacancyId = trim($input['vacancy_id'] ?? '');
    $userId = $_SESSION['user_id'];
    
    $dataDir = dirname(__FILE__) . '/data/';
    $applicationsFile = $dataDir . 'vacancy_applications.txt';
    
    $hasApplied = false;
    
    if (file_exists($applicationsFile)) {
        $lines = file($applicationsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $application = json_decode($line, true);
            if ($application && $application['vacancy_id'] === $vacancyId && $application['user_id'] === $userId) {
                $hasApplied = true;
                break;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'has_applied' => $hasApplied
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>