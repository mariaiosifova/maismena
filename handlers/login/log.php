<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require "../../config/database.php";

$username = trim($_POST['usernameLog']) ?? null;
$password = trim($_POST['passwordLog']) ?? null;

if ($username == null || $password == null) {
    header("Location: ../../login/error?error=empty");
    die();
    exit;
}

try {
    $stmt = $main_pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $data = $stmt->fetch();

    if ($data) {
        if (password_verify($password, $data['password'])) {
            $_SESSION['session_id'] = $data['hash'];
            header("Location: ../../events/");
            die();
            exit;
        } else {
            header("Location: ../../login/error?error=wrong");
            die();
            exit;
        }
    } else {
        header("Location: ../../login/error?error=wrong");
        die();
        exit;
    }
} catch (PDOException $e) {
    header("Location: ../../login/error?error=dberror");
    die();
    exit;
}
