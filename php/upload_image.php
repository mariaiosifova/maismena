<?php
session_start();
header('Access-Control-Allow-Origin: https://www.maismena.ru');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Проверяем, есть ли загруженный файл
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Файл не загружен или произошла ошибка']);
        exit;
    }

    $uploadedFile = $_FILES['image'];
    
    // Проверяем тип файла
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = mime_content_type($uploadedFile['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Разрешены только изображения (JPEG, PNG, GIF, WebP)']);
        exit;
    }
    
    // Проверяем размер файла (максимум 5MB)
    if ($uploadedFile['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['error' => 'Размер файла не должен превышать 5MB']);
        exit;
    }
    
    // Создаем директорию для загрузок если не существует
    $uploadDir = dirname(__FILE__) . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Генерируем уникальное имя файла
    $fileExtension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('event_') . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    // Перемещаем загруженный файл
    if (move_uploaded_file($uploadedFile['tmp_name'], $filePath)) {
        // Возвращаем URL к загруженному изображению
        $imageUrl = './php/uploads/' . $fileName;
        
        echo json_encode([
            'success' => true,
            'image_url' => $imageUrl,
            'message' => 'Изображение успешно загружено'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка при сохранении файла']);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
}
?>