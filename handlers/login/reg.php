<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require "../../config/database.php";

$username = trim($_POST['username']) ?? null;
$passwordFirst = trim($_POST['passwordFirst']) ?? null;
$passwordSecond = trim($_POST['passwordSecond']) ?? null;

if ($username == null || $passwordFirst == null || $passwordSecond == null) {
    header("Location: ../../login/error?error=empty");
    die();
    exit;
}

if ($passwordFirst != $passwordSecond) {
    header("Location: ../../login/error?error=passwordNotMatch");
    die();
    exit;
}

if (strlen($passwordFirst) <= 4 || strlen($passwordFirst) > 200 || strlen($username) < 4 || strlen($username) > 200) {
    header("Location: ../../login/error?error=len");
    die();
    exit;
}

try {
    $stmt = $main_pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt -> execute([$username]);

    if ($stmt -> rowCount() > 0) {
        header("Location: ../../login/error?error=username");
        exit;
        die();
    }
    $passwordHash = password_hash($passwordFirst, PASSWORD_DEFAULT);

    $session_id = bin2hex(random_bytes(32));
    $_SESSION['session_id'] = $session_id;
    $stmt = $main_pdo->prepare("INSERT INTO users (username, password, hash) VALUES (?, ?, ?)");
    $stmt -> execute([$username, $passwordHash, $session_id]);

    header("Location: ../../events/");
} catch (PDOException $e) {
    header("Location: ../../login/error?error=dberror");
    die();
    exit;
}