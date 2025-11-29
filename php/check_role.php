<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://www.maismena.ru');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false, 
        'error' => 'Не авторизован',
        'need_login' => true
    ]);
    exit;
}

$dataDir = dirname(__FILE__) . '/data/';
$filename = $dataDir . 'users.txt';

if (!file_exists($filename)) {
    echo json_encode(['success' => false, 'error' => 'База не найдена']);
    exit;
}

$lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$currentUser = null;

foreach ($lines as $line) {
    $userData = json_decode($line, true);
    if ($userData && isset($userData['id']) && $userData['id'] === $_SESSION['user_id']) {
        $currentUser = $userData;
        break;
    }
}

if (!$currentUser) {
    echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
    exit;
}

// Возвращаем роль (по умолчанию 'user' если нет поля)
$role = $currentUser['role'] ?? 'user';

echo json_encode([
    'success' => true,
    'role' => $role,
    'username' => $currentUser['username']
]);
?>