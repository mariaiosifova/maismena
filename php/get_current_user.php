<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://www.maismena.ru');

// Проверяем авторизацию
if (!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
    echo json_encode(['success' => false, 'error' => 'Пользователь не авторизован']);
    exit;
}

// Возвращаем данные текущего пользователя
echo json_encode([
    'success' => true,
    'user' => [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username']
    ]
]);
?>