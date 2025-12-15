<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

$eventName = $_POST['eventName'] ?? '';
$eventDesc = $_POST['eventDesc'] ?? '';
$eventLocation = $_POST['eventLocation'] ?? '';
$eventData = $_POST['eventData'] ?? '';
$eventLink = $_POST['eventLink'] ?? '';

if (empty($eventName) || empty($eventLocation) || empty($eventData) || empty($eventLink)) {
    echo json_encode(['success' => false, 'message' => 'Заполните все обязательные поля']);
    exit;
}

$imagePath = '';
if (isset($_FILES['eventImage']) && $_FILES['eventImage']['error'] === UPLOAD_ERR_OK) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = mime_content_type($_FILES['eventImage']['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Недопустимый тип файла. Разрешены: JPG, PNG, GIF, WebP']);
        exit;
    }
    
    if ($_FILES['eventImage']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'Файл слишком большой. Максимум 5MB']);
        exit;
    }

    $uploadDir = __DIR__ . '/../../../uploads/events/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileExtension = pathinfo($_FILES['eventImage']['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('event_', true) . '.' . $fileExtension;
    $uploadPath = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['eventImage']['tmp_name'], $uploadPath)) {
        $imagePath = 'https://www.maismena.ru/uploads/events/' . $fileName; #TODO
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при загрузке изображения']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Изображение обязательно для загрузки']);
    exit;
}

try {
    $stmt = $main_pdo->prepare("
        INSERT INTO events (name, description, location, event_data, image_path, more) 
        VALUES (:name, :description, :location, :event_data, :image_path, :more)
    ");
    
    $stmt->execute([
        ':name' => $eventName,
        ':description' => $eventDesc,
        ':location' => $eventLocation,
        ':event_data' => $eventData,
        ':image_path' => $imagePath,
        ':more' => $eventLink
    ]);
    
    $eventId = $main_pdo->lastInsertId();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Мероприятие успешно добавлено',
        'event_id' => $eventId
    ]);
    
} catch (PDOException $e) {
    if ($imagePath && file_exists(__DIR__ . '/../../../' . $imagePath)) {
        unlink(__DIR__ . '/../../../' . $imagePath);
    }
    
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка базы данных: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    if ($imagePath && file_exists(__DIR__ . '/../../../' . $imagePath)) {
        unlink(__DIR__ . '/../../../' . $imagePath);
    }
    
    error_log("Error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Ошибка: ' . $e->getMessage()
    ]);
}
?>