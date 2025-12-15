<?php
session_start();
require "../../config/database.php";

if (isset($_SESSION['session_id'])) {
    header("Location: ../../events");
    //echo "Already logged in";
    exit;
}

$telegram_id = null;
$hash = null;

if (isset($_GET['telegram_id']) && isset($_GET['hash'])) {
    $telegram_id = $_GET['telegram_id'];
    $hash = $_GET['hash'];
} else {
    header("Location: ../error?error=telegram_invalid");
    //echo "Telegram invalgsfdaid";
    exit;
}

try {
    $stmt = $main_pdo->prepare("SELECT * FROM users WHERE telegram_id = ? AND hash = ?");
    $stmt->execute([$telegram_id, $hash]);
    $data = $stmt->fetch();

    if (empty($data)) {
        header("Location: ../error?error=telegram_invalid");
        //echo "Telegram invalid";
        exit();
    } else {
        header("Location: ../../events");
        $_SESSION['session_id'] = $data['hash'];
        //echo "Logged in";
        exit;
    }
} catch (Exception $e) {
    header("Location: ../error?error=dberror");
    exit;
}
