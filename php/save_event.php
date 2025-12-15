<?php
session_start();
// Включаем вывод ошибок для отладки
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: https://www.maismena.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Логируем запрос
error_log("=== SAVE EVENT REQUEST ===");

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
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("📥 Получены данные: " . print_r($input, true));
    
    // Проверяем обязательные поля
    if (empty($input['title']) || empty($input['description'])) {
        error_log("❌ Отсутствуют обязательные поля");
        http_response_code(400);
        echo json_encode(['error' => 'Название и описание обязательны']);
        exit;
    }
    
    // Подготавливаем данные мероприятия
  // В части подготовки данных мероприятия ДОБАВИМ:
$eventData = [
    'id' => uniqid('event_'),
    'title' => trim($input['title']),
    'description' => trim($input['description']),
    'date' => $input['date'] ?? '',
    'time_start' => $input['time_start'] ?? '', // ← ДОБАВИЛИ
    'time_end' => $input['time_end'] ?? '',     // ← ДОБАВИЛИ
    'image' => $input['image'] ?? '',
    'location' => $input['location'] ?? '',
    'created_by' => $_SESSION['username'],
    'created_by_id' => $_SESSION['user_id'],
    'created_at' => date('Y-m-d H:i:s'),
    'status' => 'active'
];
    
    error_log("📝 Данные для сохранения: " . print_r($eventData, true));
    
    // Сохраняем в файл
    $dataDir = dirname(__FILE__) . '/data/';
    $filename = $dataDir . 'events.txt';
    
    error_log("📁 Путь к файлу: " . $filename);
    
    // Проверяем существование директории
    if (!is_dir($dataDir)) {
        error_log("📂 Директории нет, создаем: " . $dataDir);
        if (!mkdir($dataDir, 0755, true)) {
            error_log("❌ Не удалось создать директорию");
            http_response_code(500);
            echo json_encode(['error' => 'Не удалось создать директорию для данных']);
            exit;
        }
    }
    
    // Проверяем права доступа
    if (!is_writable($dataDir)) {
        error_log("❌ Нет прав на запись в директорию");
        http_response_code(500);
        echo json_encode(['error' => 'Нет прав на запись в директорию данных']);
        exit;
    }
    
    // Сохраняем мероприятие
    $result = file_put_contents(
        $filename, 
        json_encode($eventData, JSON_UNESCAPED_UNICODE) . PHP_EOL, 
        FILE_APPEND | LOCK_EX
    );
    
    error_log("💾 Результат записи: " . ($result === false ? 'FAIL' : 'SUCCESS (' . $result . ' bytes)'));
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сохранения мероприятия']);
        exit;
    }
    
    // Проверяем, что файл действительно создался
    if (file_exists($filename)) {
        error_log("✅ Файл создан, размер: " . filesize($filename));
    } else {
        error_log("❌ Файл не создан!");
    }
    
    error_log("✅ Мероприятие успешно сохранено: " . $eventData['id']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Мероприятие успешно создано!',
        'event_id' => $eventData['id']
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}

error_log("=== SAVE EVENT END ===");
?>