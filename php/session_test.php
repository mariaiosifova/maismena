<?php
session_start();
echo "<h1>Тест сессии</h1>";
echo "<p>Session ID: " . session_id() . "</p>";
echo "<p>Session Name: " . session_name() . "</p>";
echo "<pre>Session Data: ";
print_r($_SESSION);
echo "</pre>";

// Попробуем установить тестовую сессию
$_SESSION['test_time'] = date('Y-m-d H:i:s');
$_SESSION['test_user'] = 'test_user_123';

echo "<p>Установлена тестовая сессия</p>";
?>