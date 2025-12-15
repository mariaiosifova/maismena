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
    // Получаем данные из JSON
    $json_input = file_get_contents('php://input');
    $input = json_decode($json_input, true);
    
    // Логируем что пришло
    error_log("=== VACANCY FORM DATA ===");
    error_log("Raw JSON: " . $json_input);
    error_log("Title: " . ($input['title'] ?? 'NULL'));
    error_log("Description: " . ($input['description'] ?? 'NULL'));
    error_log("Work date: " . ($input['work_date'] ?? 'NULL'));
    error_log("Time start: " . ($input['time_start'] ?? 'NULL'));
    error_log("Time end: " . ($input['time_end'] ?? 'NULL'));
    error_log("Payment: " . ($input['payment'] ?? 'NULL'));
    
    // ПРОВЕРКА ДАННЫХ ИЗ ФОРМЫ
    $required_fields = ['title', 'description', 'work_date', 'time_start', 'time_end', 'payment'];
    $missing_fields = [];
    
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || $input[$field] === '' || $input[$field] === null) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        error_log("MISSING FIELDS: " . implode(', ', $missing_fields));
        http_response_code(400);
        echo json_encode([
            'error' => 'Заполните все обязательные поля',
            'missing_fields' => $missing_fields
        ]);
        exit;
    }
    
    // СОХРАНЕНИЕ ДАННЫХ ИЗ ФОРМЫ
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
    
    error_log("SAVING VACANCY: " . print_r($vacancyData, true));
    
    $dataDir = dirname(__FILE__) . '/data/';
    $filename = $dataDir . 'vacancies.txt';
    
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    $result = file_put_contents(
        $filename, 
        json_encode($vacancyData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
        FILE_APPEND | LOCK_EX
    );
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сохранения']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Вакансия создана!',
        'vacancy_id' => $vacancyData['id'],
        'saved_data' => $vacancyData // Для отладки
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>