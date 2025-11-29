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
    $username = $_SESSION['username'];
    
    // Валидация
    if (empty($vacancyId)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID вакансии обязателен']);
        exit;
    }
    
    // Проверяем существование вакансии
    $dataDir = dirname(__FILE__) . '/data/';
    $vacanciesFile = $dataDir . 'vacancies.txt';
    $vacancyExists = false;
    
    if (file_exists($vacanciesFile)) {
        $lines = file($vacanciesFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $vacancyData = json_decode($line, true);
            if ($vacancyData && $vacancyData['id'] === $vacancyId) {
                $vacancyExists = true;
                break;
            }
        }
    }
    
    if (!$vacancyExists) {
        http_response_code(404);
        echo json_encode(['error' => 'Вакансия не найдена']);
        exit;
    }
    
    // Проверяем, не откликался ли уже пользователь
    $applicationsFile = $dataDir . 'vacancy_applications.txt';
    $alreadyApplied = false;
    
    if (file_exists($applicationsFile)) {
        $lines = file($applicationsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $application = json_decode($line, true);
            if ($application && $application['vacancy_id'] === $vacancyId && $application['user_id'] === $userId) {
                $alreadyApplied = true;
                break;
            }
        }
    }
    
    if ($alreadyApplied) {
        http_response_code(400);
        echo json_encode(['error' => 'Вы уже откликались на эту вакансию']);
        exit;
    }
    
    // Создаем запись об отклике
    $applicationData = [
        'id' => uniqid('apply_'),
        'vacancy_id' => $vacancyId,
        'user_id' => $userId,
        'username' => $username,
        'applied_at' => date('Y-m-d H:i:s'),
        'status' => 'pending' // pending, accepted, rejected
    ];
    
    // Сохраняем отклик
    $result = file_put_contents(
        $applicationsFile, 
        json_encode($applicationData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
        FILE_APPEND | LOCK_EX
    );
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сохранения отклика']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Отклик успешно отправлен!',
        'application_id' => $applicationData['id']
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>