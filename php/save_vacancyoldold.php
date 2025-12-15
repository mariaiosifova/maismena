<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: https://maismena.ru');
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
    
    // ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
    error_log("=== VACANCY DATA RECEIVED ===");
    error_log("Title: " . ($input['title'] ?? 'NOT SET'));
    error_log("Description: " . ($input['description'] ?? 'NOT SET'));
    error_log("Work date: " . ($input['work_date'] ?? 'NOT SET'));
    error_log("Time start: " . ($input['time_start'] ?? 'NOT SET'));
    error_log("Time end: " . ($input['time_end'] ?? 'NOT SET'));
    error_log("Payment: " . ($input['payment'] ?? 'NOT SET'));
    error_log("Requirements: " . ($input['requirements'] ?? 'NOT SET'));
    
    // УПРОЩЕННАЯ ПРОВЕРКА
    $required_fields = ['title', 'description', 'work_date', 'time_start', 'time_end', 'payment'];
    $missing = [];
    
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            $missing[] = $field;
            error_log("❌ Missing field: " . $field);
        }
    }
    
    if (!empty($missing)) {
        error_log("❌ Missing fields: " . implode(', ', $missing));
        http_response_code(400);
        echo json_encode([
            'error' => 'Все обязательные поля должны быть заполнены',
            'missing_fields' => $missing,
            'received_data' => $input
        ]);
        exit;
    }
    
    // ЕСЛИ ДОШЛИ СЮДА - ВСЕ ПОЛЯ ЕСТЬ!
    error_log("✅ Все поля присутствуют!");
    
    // Сохраняем данные
    $vacancyData = [
        'id' => uniqid('vacancy_'),
        'title' => trim($input['title']),
        'description' => trim($input['description']),
        'work_date' => $input['work_date'],
        'time_start' => $input['time_start'],
        'time_end' => $input['time_end'],
        'payment' => intval($input['payment']),
        'requirements' => $input['requirements'] ?? '',
        'created_by' => $_SESSION['username'],
        'created_by_id' => $_SESSION['user_id'],
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ];
    
    $dataDir = dirname(__FILE__) . '/data/';
    $filename = $dataDir . 'vacancies.txt';
    
    // Создаем директорию если не существует
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Сохраняем
    $result = file_put_contents(
        $filename, 
        json_encode($vacancyData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
        FILE_APPEND | LOCK_EX
    );
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сохранения вакансии']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Вакансия успешно создана!',
        'vacancy_id' => $vacancyData['id'],
        'debug' => 'Данные успешно сохранены'
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>