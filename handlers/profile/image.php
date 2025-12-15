<?php
session_start();
require "../../config/database.php";

if (!isset($_SESSION['session_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Не авторизован']);
    exit;
}

$stmt = $main_pdo->prepare("SELECT * FROM users WHERE hash = ?");
$stmt->execute([$_SESSION['session_id']]);
$user = $stmt->fetch();

if (!$user) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
    exit;
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Файл не загружен']);
    exit;
}

$file = $_FILES['avatar'];

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Допустимые форматы: JPG, PNG, GIF, WebP']);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Максимальный размер файла: 5MB']);
    exit;
}

$uploadDir = '../../uploads/avatars/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = 'avatar_' . $user['id'] . '_' . time() . '.' . $fileExtension;
$filePath = $uploadDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $filePath)) {
    $avatarUrl = 'https://www.maismena.ru/uploads/avatars/' . $fileName;
    
    $updateStmt = $main_pdo->prepare("UPDATE users SET avatar_path = ? WHERE id = ?");
    $updateStmt->execute([$avatarUrl, $user['id']]);
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true, 
        'message' => 'Аватар успешно загружен',
        'avatar_url' => $avatarUrl
    ]);
} else {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Ошибка при загрузке файла']);
}
?>