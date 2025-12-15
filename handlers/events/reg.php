<?php
require "../../config/database.php";
require "../../handlers/loginer/index.php";

if (!$sessionStatus) {
    echo json_encode(['success' => false, 'message' => 'Требуется авторизация']);
    exit;
}

if ($sessionStatus && !$userStatus) {
    echo json_encode(['success' => false, 'message' => 'Требуется заполнение профиля']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Неправильный метод запроса']);
    exit;
}

$eventId = isset($_POST['event_id']) ? (int)$_POST['event_id'] : 0;
$action = $_POST['action'] ?? '';

if ($eventId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Неверный ID мероприятия']);
    exit;
}

if ($action !== 'register') {
    echo json_encode(['success' => false, 'message' => 'Неверное действие']);
    exit;
}

try {
    $stmt = $main_pdo->prepare("SELECT id FROM events WHERE id = ?");
    $stmt->execute([$eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$event) {
        echo json_encode(['success' => false, 'message' => 'Мероприятие не найдено']);
        exit;
    }
    
    $stmt = $main_pdo->prepare("SELECT id FROM users_events WHERE user_id = ? AND event_id = ?");
    $stmt->execute([$userData['id'], $eventId]);
    $existingRegistration = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingRegistration) {
        echo json_encode(['success' => false, 'message' => 'Вы уже зарегистрированы на это мероприятие']);
        exit;
    }
    
    $stmt = $main_pdo->prepare("INSERT INTO users_events (user_id, event_id, data) VALUES (?, ?, NOW())");
    $result = $stmt->execute([$userData['id'], $eventId]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Регистрация прошла успешно']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении в базу данных']);
    }
    
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера при регистрации']);
}
?>