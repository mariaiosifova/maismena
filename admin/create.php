<?php
require_once '../config/database.php';

$user_id = 1;
$username = 'efh-Vtc-MTW-LqB';
$password = 'Vtc-MTW-QaB-GDp';
$role = 'admin';

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $main_pdo->prepare("
    INSERT INTO admin_users (user_id, username, password_hash, role, is_active) 
    VALUES (?, ?, ?, ?, 1)
");

if ($stmt->execute([$user_id, $username, $password_hash, $role])) {
    echo "Первый администратор успешно создан!";
    echo "<br>Логин: $username";
    echo "<br>Пароль: [скрыт]";
} else {
    echo "Ошибка при создании администратора";
}