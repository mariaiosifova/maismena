<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: https://maismena.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Логируем всё
error_log("=== DEBUG VACANCY REQUEST ===");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    error_log("❌ Не авторизован");
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получаем сырые данные
    $raw_input = file_get_contents('php://input');
    error_log("📥 Raw input: " . $raw_input);
    
    $input = json_decode($raw_input, true);
    error_log("📦 Parsed JSON: " . print_r($input, true));
    
    // ПРОСТАЯ ПРОВЕРКА - выводим что пришло
    echo json_encode([
        'success' => true,
        'debug_received' => $input,
        'message' => 'Данные получены успешно!'
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}

error_log("=== DEBUG VACANCY END ===");
?>