<?php
session_start();
require "../../config/database.php";

$stmt = $main_pdo->prepare("SELECT id, full FROM users WHERE hash = ?");
$stmt->execute([$_SESSION["session_id"]]);
$user = $stmt->fetch();

if (!$user) {
    header("Location: ../../login/");
    exit();
}

$first_name = trim($_POST['first_name'] ?? '');
$last_name = trim($_POST['last_name'] ?? '');
$father_name = trim($_POST['father_name'] ?? '');
$e_direction = trim($_POST['e_direction'] ?? '');
$e_group = trim($_POST['e_group'] ?? '');
$e_elective = trim($_POST['e_elective'] ?? '');

error_log("Получены данные: first_name=$first_name, last_name=$last_name, direction=$e_direction, group=$e_group, elective=$e_elective");

if (empty($first_name) || empty($last_name) || empty($e_direction) || empty($e_group) || empty($e_elective)) {
    $_SESSION['error'] = "Все обязательные поля должны быть заполнены";
    header("Location: ../../profile/");
    exit();
}

function addIfNew($pdo, $table, $name, $value) {
    if (!empty($value)) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` WHERE `name` = ?");
        $stmt->execute([$value]);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            $stmt = $pdo->prepare("INSERT INTO `$table` (`name`) VALUES (?)");
            $stmt->execute([$value]);
        }
    }
}

addIfNew($main_pdo, 'direction', 'name', $e_direction);
addIfNew($main_pdo, 'student_groups', 'name', $e_group);
addIfNew($main_pdo, 'electives', 'name', $e_elective);

$stmt = $main_pdo->prepare("
    UPDATE users SET 
    first_name = ?, 
    last_name = ?, 
    father_name = ?, 
    e_direction = ?, 
    e_group = ?, 
    e_elective = ?,
    full = '1'
    WHERE hash = ?
");

try {
    $stmt->execute([
        $first_name,
        $last_name,
        $father_name,
        $e_direction,
        $e_group,
        $e_elective,
        $_SESSION["session_id"]
    ]);
    
    $_SESSION['success'] = "Профиль успешно обновлен";
    header("Location: ../../profile/");
    exit();
    
} catch (PDOException $e) {
    $_SESSION['error'] = "Ошибка при обновлении профиля: " . $e->getMessage();
    header("Location: ../../profile/");
    exit();
}