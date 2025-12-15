<?php
require_once '../config/database.php';
require_once 'auth_functions.php';

checkAdminAuth();

if (!canManageAdmins()) {
    header('Location: index.php?access_denied=1');
    exit;
}
$id = $_GET['id'] ?? 0;

if (!$id) {
    header('Location: manage_admins.php?error=Неверный ID администратора');
    exit;
}

if ($id == $_SESSION['admin_id']) {
    header('Location: manage_admins.php?error=Нельзя удалить самого себя');
    exit;
}

try {
    $stmt = $main_pdo->prepare("DELETE FROM admin_users WHERE id = ?");
    $stmt->execute([$id]);
    
    header('Location: manage_admins.php?success=Администратор успешно удален');
    exit;
} catch (PDOException $e) {
    header('Location: manage_admins.php?error=Ошибка при удалении: ' . urlencode($e->getMessage()));
    exit;
}
?>