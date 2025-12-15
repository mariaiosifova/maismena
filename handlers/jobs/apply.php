<?php
require "../loginer/index.php";

if ($sessionStatus == false) {
    echo json_encode(['success' => false, 'message' => 'Требуется авторизация']);
    exit;
}

require "../../config/database.php";

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$jobId = isset($input['job_id']) ? intval($input['job_id']) : 0;

if ($jobId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Неверный ID вакансии']);
    exit;
}

$stmt = $main_pdo->prepare("SELECT id FROM jobs WHERE id = :job_id");
$stmt->execute([':job_id' => $jobId]);
$jobExists = $stmt->fetch();

if (!$jobExists) {
    echo json_encode(['success' => false, 'message' => 'Вакансия не найдена']);
    exit;
}

$stmt = $main_pdo->prepare("SELECT id FROM users_jobs WHERE user_id = :user_id AND job_id = :job_id");
$stmt->execute([
    ':user_id' => $userData["id"],
    ':job_id' => $jobId
]);
$existingApplication = $stmt->fetch();

if ($existingApplication) {
    echo json_encode(['success' => false, 'message' => 'Вы уже откликались на эту вакансию']);
    exit;
}

try {
    $stmt = $main_pdo->prepare("INSERT INTO users_jobs (user_id, job_id) VALUES (:user_id, :job_id)");
    $result = $stmt->execute([
        ':user_id' => $userData["id"],
        ':job_id' => $jobId
    ]);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Вы успешно откликнулись на вакансию!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Произошла ошибка при сохранении']);
    }
} catch (PDOException $e) {
    error_log("Database error in apply.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных. Попробуйте позже.']);
}