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
$filename = $dataDir . 'vacancies.txt';

$vacancies = [];

if (file_exists($filename)) {
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        $vacancyData = json_decode($line, true);
        if ($vacancyData && ($vacancyData['status'] ?? 'active') === 'active') {
            // Убедимся, что есть все необходимые поля
            $vacancyData['work_date'] = $vacancyData['work_date'] ?? '';
            $vacancyData['time_start'] = $vacancyData['time_start'] ?? '';
            $vacancyData['time_end'] = $vacancyData['time_end'] ?? '';
            $vacancies[] = $vacancyData;
        }
    }
    
    // Сортируем по дате создания (новые сначала)
    usort($vacancies, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
}

echo json_encode([
    'success' => true,
    'vacancies' => $vacancies
]);
?>