<?php
function startSessionIfNotStarted() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function getCurrentAdminRole() {
    return $_SESSION['admin_role'] ?? null;
}

function hasAdminRole($required_role) {
    $current_role = getCurrentAdminRole();
    
    if (!$current_role) {
        return false;
    }
    
    $roles_hierarchy = [
        'super_admin' => 3,
        'admin' => 2,
        'moderator' => 1
    ];
    
    $current_role_level = $roles_hierarchy[$current_role] ?? 0;
    $required_role_level = $roles_hierarchy[$required_role] ?? 0;
    
    return $current_role_level >= $required_role_level;
}

function canAddRecords() {
    return hasAdminRole('admin'); 
}

function canDeleteRecords() {
    return hasAdminRole('admin'); 
}
function canEditRecords() {
    return hasAdminRole('admin'); 
}

function canManageAdmins() {
    return hasAdminRole('super_admin');
}

function checkAdminAuth() {
    startSessionIfNotStarted();
    
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
    
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
        session_unset();
        session_destroy();
        header('Location: login.php?expired=1');
        exit;
    }
    
    $_SESSION['last_activity'] = time();
    
    if (isset($_SESSION['admin_id'])) {
        global $main_pdo;
        
        if (!isset($main_pdo)) {
            require_once '../config/database.php';
        }
        
        $stmt = $main_pdo->prepare("
            SELECT au.* 
            FROM admin_users au 
            WHERE au.id = ? AND au.is_active = 1
        ");
        $stmt->execute([$_SESSION['admin_id']]);
        $admin = $stmt->fetch();
        
        if (!$admin) {
            session_unset();
            session_destroy();
            header('Location: login.php?invalid=1');
            exit;
        }
        
        $_SESSION['admin_role'] = $admin['role'];
        $_SESSION['admin_username'] = $admin['username'];
        
        return $admin;
    }
    
    return null;
}

function loginAdmin($username, $password) {
    global $main_pdo;
    
    if (!isset($main_pdo)) {
        require_once '../config/database.php';
    }
    
    $stmt = $main_pdo->prepare("
        SELECT au.* 
        FROM admin_users au 
        WHERE au.username = ? AND au.is_active = 1
    ");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        return ['success' => false, 'message' => 'Неверное имя пользователя или пароль'];
    }
    
    if (!password_verify($password, $admin['password_hash'])) {
        return ['success' => false, 'message' => 'Неверное имя пользователя или пароль'];
    }
    
    $update_stmt = $main_pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
    $update_stmt->execute([$admin['id']]);
    
    startSessionIfNotStarted();
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];
    $_SESSION['admin_role'] = $admin['role'];
    $_SESSION['last_activity'] = time();
    
    return ['success' => true, 'admin' => $admin];
}


function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function validatePassword($password) {
    if (strlen($password) < 8) {
        return 'Пароль должен содержать минимум 8 символов';
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        return 'Пароль должен содержать хотя бы одну заглавную букву';
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        return 'Пароль должен содержать хотя бы одну строчную букву';
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        return 'Пароль должен содержать хотя бы одну цифру';
    }
    
    return true;
}

function generateRandomPassword($length = 12) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    $password = '';
    
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[random_int(0, strlen($chars) - 1)];
    }
    
    return $password;
}

function logoutAdmin() {
    startSessionIfNotStarted();
    session_unset();
    session_destroy();
}
?>