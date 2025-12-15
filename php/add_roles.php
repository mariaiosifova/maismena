<?php
$dataDir = dirname(__FILE__) . '/data/';
$filename = $dataDir . 'users.txt';

if (!file_exists($filename)) {
    die('Файл users.txt не найден');
}

$lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$updatedUsers = [];

foreach ($lines as $line) {
    $userData = json_decode($line, true);
    if ($userData) {
        // Добавляем поле role если его нет
        if (!isset($userData['role'])) {
            $userData['role'] = 'user';
        }
        $updatedUsers[] = $userData;
    }
}

// Перезаписываем файл с обновленными данными
file_put_contents($filename, '');
foreach ($updatedUsers as $user) {
    file_put_contents($filename, json_encode($user, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

echo "Роли добавлены для " . count($updatedUsers) . " пользователей!";
?>