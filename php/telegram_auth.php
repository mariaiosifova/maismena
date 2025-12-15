<?php
session_start();
header('Access-Control-Allow-Origin: https://maismena.ru');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $telegramId = $input['telegram_id'];
    $username = $input['username'] ?? '';
    $firstName = $input['first_name'] ?? '';
    $lastName = $input['last_name'] ?? '';
    
    // Путь к файлу данных
    $dataDir = dirname(__FILE__) . '/data/';
    $usersFile = $dataDir . 'users.txt';
    $telegramUsersFile = $dataDir . 'telegram_users.txt';
    
    // Создаем директорию если не существует
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Проверяем есть ли пользователь в базе Telegram
    $userFound = false;
    $userId = '';
    
    if (file_exists($telegramUsersFile)) {
        $lines = file($telegramUsersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $userData = json_decode($line, true);
            if ($userData && $userData['telegram_id'] == $telegramId) {
                $userFound = true;
                $userId = $userData['user_id'];
                break;
            }
        }
    }
    
    if (!$userFound) {
        // Создаем нового пользователя
        $userId = uniqid();
        $username = $username ?: 'tg_' . $telegramId;
        
        // Данные для основного users.txt
        $userData = [
            'id' => $userId,
            'username' => $username,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'registration_date' => date('Y-m-d H:i:s'),
            'role' => 'user',
            'profile_data' => [
                'lastname' => $lastName,
                'firstname' => $firstName,
                'middlename' => '',
                'group' => '',
                'direction' => '',
                'faculty' => ''
            ]
        ];
        
        // Сохраняем в основную базу
        file_put_contents(
            $usersFile, 
            json_encode($userData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
            FILE_APPEND | LOCK_EX
        );
        
        // Сохраняем в базу Telegram пользователей
        $telegramUserData = [
            'telegram_id' => $telegramId,
            'user_id' => $userId,
            'username' => $username,
            'linked_at' => date('Y-m-d H:i:s')
        ];
        
        file_put_contents(
            $telegramUsersFile, 
            json_encode($telegramUserData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
            FILE_APPEND | LOCK_EX
        );
    }
    
    // Создаем сессию
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'username' => $username,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => 'user'
        ],
        'message' => 'Авторизация через Telegram успешна'
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>