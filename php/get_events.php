<?php
header('Access-Control-Allow-Origin: https://www.maismena.ru');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataDir = dirname(__FILE__) . '/data/';
$filename = $dataDir . 'events.txt';

$events = [];

if (file_exists($filename)) {
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        $eventData = json_decode($line, true);
        if ($eventData && ($eventData['status'] ?? 'active') === 'active') {
            // Убедимся, что есть все необходимые поля
            $eventData['time_start'] = $eventData['time_start'] ?? '';
            $eventData['time_end'] = $eventData['time_end'] ?? '';
            $eventData['image'] = $eventData['image'] ?? '';
            $events[] = $eventData;
        }
    }
    
    // Сортируем по дате создания (новые сначала)
    usort($events, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
}

echo json_encode([
    'success' => true,
    'events' => $events
]);
?>