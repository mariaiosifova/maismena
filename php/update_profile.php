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
    $profileData = $input['profile_data'] ?? [];
    
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
    
    // Читаем всех пользователей
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $users = [];
    $userFound = false;
    
    foreach ($lines as $line) {
        $userData = json_decode($line, true);
        if ($userData && $userData['username'] === $username) {
            // Обновляем профиль для найденного пользователя
            $userData['profile_data'] = $profileData;
            $userFound = true;
        }
        if ($userData) {
            $users[] = $userData;
        }
    }
    
    if (!$userFound) {
        http_response_code(404);
        echo json_encode(['error' => 'Пользователь не найден']);
        exit;
    }
    
    // Перезаписываем файл с обновленными данными
    $result = file_put_contents($filename, '');
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка очистки файла']);
        exit;
    }
    
    foreach ($users as $user) {
        $writeResult = file_put_contents($filename, json_encode($user, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);
        if ($writeResult === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Ошибка записи данных']);
            exit;
        }
    }
    
    // Успех
    echo json_encode([
        'success' => true,
        'message' => 'Профиль успешно обновлен'
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>