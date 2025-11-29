<?php
session_start(); // ← ДОБАВИМ ЭТО

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
    $password = $input['password'] ?? '';
    
    // Валидация
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Логин и пароль обязательны']);
        exit;
    }
    
    // Функция проверки пользователя
    function verifyUser($username, $password) {
        $dataDir = dirname(__FILE__) . '/data/';
        $filename = $dataDir . 'users.txt';
        
        if (!file_exists($filename)) {
            return false;
        }
        
        $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            $userData = json_decode($line, true);
            if ($userData && $userData['username'] === $username) {
                // Проверяем пароль
                if (password_verify($password, $userData['password_hash'])) {
                    return $userData;
                }
            }
        }
        
        return false;
    }
    
    // Проверяем пользователя
    $user = verifyUser($username, $password);
    
    if ($user) {
        // Сохраняем пользователя в сессии ← ДОБАВИМ ЭТО
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        
        // Успешный вход
        // В блоке успешного входа замени:
// На:
echo json_encode([
    'success' => true,
    'message' => 'Вход выполнен успешно!',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'] ?? 'user'  // ← ДОБАВИЛИ РОЛЬ
    ],
    'redirect_url' => '/dashboard.html'
]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный логин или пароль']);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>