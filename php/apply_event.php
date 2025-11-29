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
    $username = $_SESSION['username'];
    
    // Валидация
    if (empty($eventId)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID мероприятия обязательно']);
        exit;
    }
    
    // Проверяем существование мероприятия
    $dataDir = dirname(__FILE__) . '/data/';
    $eventsFile = $dataDir . 'events.txt';
    $eventExists = false;
    
    if (file_exists($eventsFile)) {
        $lines = file($eventsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $eventData = json_decode($line, true);
            if ($eventData && $eventData['id'] === $eventId) {
                $eventExists = true;
                break;
            }
        }
    }
    
    if (!$eventExists) {
        http_response_code(404);
        echo json_encode(['error' => 'Мероприятие не найдено']);
        exit;
    }
    
    // Проверяем, не регистрировался ли уже пользователь
    $registrationsFile = $dataDir . 'event_registrations.txt';
    $alreadyRegistered = false;
    
    if (file_exists($registrationsFile)) {
        $lines = file($registrationsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $registration = json_decode($line, true);
            if ($registration && $registration['event_id'] === $eventId && $registration['user_id'] === $userId) {
                $alreadyRegistered = true;
                break;
            }
        }
    }
    
    if ($alreadyRegistered) {
        http_response_code(400);
        echo json_encode(['error' => 'Вы уже зарегистрированы на это мероприятие']);
        exit;
    }
    
    // Создаем запись о регистрации
    $registrationData = [
        'id' => uniqid('reg_'),
        'event_id' => $eventId,
        'user_id' => $userId,
        'username' => $username,
        'registered_at' => date('Y-m-d H:i:s'),
        'status' => 'registered'
    ];
    
    // Сохраняем регистрацию
    $result = file_put_contents(
        $registrationsFile, 
        json_encode($registrationData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
        FILE_APPEND | LOCK_EX
    );
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сохранения регистрации']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Регистрация на мероприятие успешна!',
        'registration_id' => $registrationData['id']
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>