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
    
    $eventId = trim($input['event_id'] ?? '');
    $userId = $_SESSION['user_id'];
    
    $dataDir = dirname(__FILE__) . '/data/';
    $registrationsFile = $dataDir . 'event_registrations.txt';
    
    $hasRegistered = false;
    
    if (file_exists($registrationsFile)) {
        $lines = file($registrationsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $registration = json_decode($line, true);
            if ($registration && $registration['event_id'] === $eventId && $registration['user_id'] === $userId) {
                $hasRegistered = true;
                break;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'has_registered' => $hasRegistered
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>