<?php
require "../../handlers/loginer/index.php";

if (!$sessionStatus || $userRank != "admin") {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Доступ запрещен. Требуются права администратора.'
    ]);
    exit;
}

require "../../config/database.php";

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Неправильный метод запроса. Требуется POST.'
    ]);
    exit;
}

$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$workDate = trim($_POST['work_date'] ?? '');
$timeStart = trim($_POST['time_start'] ?? '');
$timeEnd = trim($_POST['time_end'] ?? '');
$payment = trim($_POST['paymentMai'] ?? '');
$paymentRub = trim($_POST['paymentRub'] ?? '');
$payment_type = trim($_POST['payment_type'] ?? '');
$all_limit = trim($_POST['all_limit'] ?? '');

$errors = [];

if (empty($title)) {
    $errors[] = 'Название вакансии обязательно для заполнения';
}

if (empty($description)) {
    $errors[] = 'Описание работы обязательно для заполнения';
}

if (empty($payment_type)) {
    $errors[] = 'Вид оплаты обьязательно для заполнения';
}

if (empty($all_limit)) {
    $errors[] = 'Максимальное количество людей обьязательно для заполнения';
}

if (empty($workDate)) {
    $errors[] = 'Дата работы обязательна для заполнения';
} elseif (!strtotime($workDate)) {
    $errors[] = 'Неверный формат даты работы';
}

if (empty($timeStart)) {
    $errors[] = 'Время начала обязательно для заполнения';
}

if (empty($timeEnd)) {
    $errors[] = 'Время окончания обязательно для заполнения';
}

if (empty($paymentRub)) {
    $errors[] = 'Оплата обязательна для заполнения';
} elseif (!is_numeric($paymentRub) || $paymentRub < 1) {
    $errors[] = 'Оплата должна быть положительным числом';
}

if (empty($payment)) {
    $errors[] = 'Оплата обязательна для заполнения';
} elseif (!is_numeric($payment) || $payment < 1) {
    $errors[] = 'Оплата должна быть положительным числом';
}

if (!empty($timeStart) && !empty($timeEnd)) {
    if ($timeStart >= $timeEnd) {
        $errors[] = 'Время окончания должно быть позже времени начала';
    }
}

if (!empty($workDate)) {
    $today = date('Y-m-d');
    if ($workDate < $today) {
        $errors[] = 'Дата работы не может быть в прошлом';
    }
}

if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'error' => implode('. ', $errors)
    ]);
    exit;
}

try {
    $dataStart = $timeStart;
    $dataEnd = $timeEnd;
    
    $addedBy = $userData['username'] ?? 'unknown'; 
    $sql = "INSERT INTO jobs (name, description, data_start, data_end, payment, payment_rub, all_limit, payment_type, added_by) 
            VALUES (:name, :description, :data_start, :data_end, :payment, :payment_rub, :all_limit, :payment_type, :added_by)";
    
    $stmt = $main_pdo->prepare($sql);
    
    $result = $stmt->execute([
        ':name' => $title,
        ':description' => $description,
        ':data_start' => $dataStart,
        ':data_end' => $dataEnd,
        ':payment' => $payment,
        ":payment_rub" => $paymentRub,
        ":all_limit" => $all_limit,
        ":payment_type" => $payment_type,
        ':added_by' => $addedBy
    ]);
    
    if ($result) {
        $lastId = $main_pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Вакансия успешно создана!',
            'vacancy_id' => $lastId
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Ошибка при сохранении вакансии в базу данных'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Произошла ошибка базы данных. Попробуйте позже.'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Произошла непредвиденная ошибка. Попробуйте позже.'
    ]);
}
?>