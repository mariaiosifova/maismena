<?php
session_start(); // ДОБАВИЛИ ДЛЯ СЕССИИ

// Включаем вывод всех ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Настройки CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Обработка preflight OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Логируем начало обработки
error_log("=== REGISTRATION REQUEST START ===");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Content Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Получаем raw JSON данные
        $json_input = file_get_contents('php://input');
        error_log("Raw input: " . $json_input);
        
        $input = json_decode($json_input, true);
        
        // Проверяем JSON decoding
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON: ' . json_last_error_msg());
        }
        
        error_log("Parsed input: " . print_r($input, true));
        
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        
        // Валидация
        if (empty($username)) {
            http_response_code(400);
            echo json_encode(['error' => 'Логин обязателен']);
            exit;
        }
        
        if (empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Пароль обязателен']);
            exit;
        }
        
        if (strlen($username) < 3) {
            http_response_code(400);
            echo json_encode(['error' => 'Логин должен быть не менее 3 символов']);
            exit;
        }
        
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Пароль должен быть не менее 6 символов']);
            exit;
        }
        
        // Путь для сохранения данных
        $dataDir = dirname(__FILE__) . '/data/';
        $filename = $dataDir . 'users.txt';
        
        // Создаем директорию если не существует
        if (!is_dir($dataDir)) {
            if (!mkdir($dataDir, 0755, true)) {
                throw new Exception('Не удалось создать каталог для данных');
            }
        }
        
        // Проверяем возможность записи
        if (!is_writable($dataDir)) {
            throw new Exception('Нет прав на запись в каталог данных');
        }
        
        // Проверяем, не занят ли логин
        if (file_exists($filename)) {
            $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $existingUser = json_decode($line, true);
                if ($existingUser && $existingUser['username'] === $username) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Пользователь с таким логином уже существует']);
                    exit;
                }
            }
        }
        
        // Подготовка данных пользователя
        $userData = [
            'id' => uniqid(),
            'username' => $username,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'registration_date' => date('Y-m-d H:i:s'),
            'timestamp' => time(),
            'role' => 'user', // ← ДОБАВИЛИ ПОЛЕ РОЛИ (по умолчанию 'user')
            'profile_data' => [
                'lastname' => '',
                'firstname' => '',
                'middlename' => '',
                'group' => '',
                'direction' => '',
                'faculty' => ''
            ]
        ];
        
        error_log("User data to save: " . print_r($userData, true));
        
        // Сохраняем в файл
        $result = file_put_contents(
            $filename, 
            json_encode($userData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
            FILE_APPEND | LOCK_EX
        );
        
        if ($result === false) {
            throw new Exception('Ошибка сохранения данных в файл');
        }
        
        error_log("Data saved successfully. Bytes written: " . $result);
        
        // СОЗДАЕМ СЕССИЮ ДЛЯ НОВОГО ПОЛЬЗОВАТЕЛЯ
        $_SESSION['user_id'] = $userData['id'];
        $_SESSION['username'] = $userData['username'];
        
        // Успешный ответ
// На:
echo json_encode([
    'success' => true,
    'user' => [
        'id' => $userData['id'],
        'username' => $userData['username'],
        'role' => $userData['role']
    ]
]);
        
    } catch (Exception $e) {
        error_log("ERROR: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Внутренняя ошибка сервера',
            'debug_info' => $e->getMessage()
        ]);
    }
    
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Для тестирования - показываем информацию о файле
    $dataDir = dirname(__FILE__) . '/data/';
    $filename = $dataDir . 'users.txt';
    
    $info = [
        'status' => 'PHP работает!',
        'file_exists' => file_exists($filename),
        'file_path' => $filename,
        'data_dir_writable' => is_writable($dataDir),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if (file_exists($filename)) {
        $lines = file($filename, FILE_SKIP_EMPTY_LINES | FILE_IGNORE_NEW_LINES);
        $users = [];
        foreach ($lines as $line) {
            $userData = json_decode($line, true);
            if ($userData) {
                $users[] = $userData;
            }
        }
        $info['users_count'] = count($users);
        $info['last_user'] = $users ? end($users) : null;
    }
    
    echo json_encode($info, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} else {
    http_response_code(405);
    echo json_encode([
        'error' => 'Метод не разрешен', 
        'allowed_methods' => ['POST', 'GET']
    ]);
}

error_log("=== REGISTRATION REQUEST END ===");
?>