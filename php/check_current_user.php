<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://www.maismena.ru');

echo json_encode([
    'session' => $_SESSION,
    'server' => [
        'user_id' => $_SESSION['user_id'] ?? 'not_set',
        'username' => $_SESSION['username'] ?? 'not_set'
    ]
]);
?>