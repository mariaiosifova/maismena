<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}
// Настройки CORS
header('Access-Control-Allow-Origin: https://www.maismena.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Обработка preflight OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получаем JSON данные
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($input['username'] ?? '');
    
    // Валидация
    if (empty($username)) {
        http_response_code(400);
        echo json_encode(['error' => 'Логин обязателен']);
        exit;
    }
    
    // Путь к файлу данных
    $dataDir = dirname(__FILE__) . '/data/';
    $filename = $dataDir . 'users.txt';
    
    if (!file_exists($filename)) {
        http_response_code(404);
        echo json_encode(['error' => 'База пользователей не найдена']);
        exit;
    }
    
    // Ищем пользователя
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $userFound = null;
    
    foreach ($lines as $line) {
        $userData = json_decode($line, true);
        if ($userData && $userData['username'] === $username) {
            $userFound = $userData;
            break;
        }
    }
    
    if (!$userFound) {
        http_response_code(404);
        echo json_encode(['error' => 'Пользователь не найден']);
        exit;
    }
    
    // Возвращаем данные профиля
    echo json_encode([
        'success' => true,
        'profile_data' => $userFound['profile_data'] ?? [
            'lastname' => '',
            'firstname' => '',
            'middlename' => '',
            'group' => '',
            'direction' => '',
            'faculty' => ''
        ]
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>