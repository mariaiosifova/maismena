<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require dirname(__DIR__, 2) . '/config/database.php';

$session = $_SESSION['session_id'] ?? null;
$sessionStatus = false;
$userStatus = false;
$userRank = null;
$userData = null;

if ($session != null) {
    try {
        $stmt = $main_pdo->prepare("SELECT * FROM users WHERE hash = ?");
        $stmt->execute([$session]);
        $user = $stmt->fetch();

        if (!empty($user)) {
            $sessionStatus = true;
            $userRank = $user['user_rank'];
            $userData = $user;

            if ($user['full'] == "1") {
                $userStatus = true;
            }
        } else {
            $_SESSION['session_id'] = null;
            session_destroy();
        }
    } catch (Exception $e) {
        error_log("Auth check error: " . $e->getMessage());
        $sessionStatus = false;
    }
}
?>