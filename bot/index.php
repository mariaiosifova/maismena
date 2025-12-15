<?php
require '../config/database.php';
$update = json_decode(file_get_contents('php://input'), true);
$json_response = json_encode($update, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (isset($update['message'])) {
    $chatId = $update['message']['chat']['id'];
    $userId;
    $userText = $update['message']['text'];
    $chatType = $update['message']['chat']['type'];
    $firstName = $update['message']['from']['first_name'] ?? "Новый пользователь";
    $url = "https://api.telegram.org/bot$token/sendMessage";
    $data = [
        'chat_id' => $chatId,
        'parse_mode' => 'HTML'
    ];
    $dataSend = false;

    if (
        isset($update['message']['from']['id']) &&
        !(isset($update['message']['from']['is_bot']) && $update['message']['from']['is_bot'])
    ) {
        $userId = $update['message']['from']['id'];
    } elseif (isset($update['message']['chat']['id']) && $update['message']['chat']['type'] == 'private') {
        $userId = $update['message']['chat']['id'];
    } else {
        $userId = $update['message']['chat']['id'];
    }
    if ($userId === null) {
        error_log("Cannot determine user_id for update: " . json_encode($update));
        return;
    }

    try {
        $stmt = $main_pdo->prepare("SELECT * FROM users WHERE telegram_id = ?");
        $stmt->execute([$userId]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (empty($userData)) {
            $username = $firstName . "_" . $userId;
            $session_id = bin2hex(random_bytes(32));
            $stmt = $main_pdo->prepare("INSERT INTO users (username, first_name, hash, telegram_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([$username, $firstName, $session_id, $userId]);
        }
    } catch (PDOException $e) {
        $data['text'] = "Ошибка базы данных! Попробуйте позже";
        $dataSend = true;
    }

    switch (true) {
        case strpos($userText, '/start') === 0:
            try {
                $stmt = $main_pdo->prepare("SELECT * FROM users WHERE telegram_id = ?");
                $stmt->execute([$userId]);
                $userData = $stmt->fetch(PDO::FETCH_ASSOC);

                $link = "https://www.maismena.ru/login/telegram/index.php?telegram_id=" .  $userId . "&hash=" . $userData['hash'];

                $data['text'] = "<b>❄️ Привет, " . $userData['first_name'] . "\n\n<blockquote>❤️ Для авторизации нажми на кнопку ниже:</blockquote></b>";

                $data['reply_markup'] = json_encode([
                    'inline_keyboard' => [
                        [
                            [
                                'text' => '🔐 Авторизоваться на сайте',
                                'url' => $link
                            ]
                        ]
                    ]
                ]);
            } catch (PDOException $e) {
                $data['text'] = "Ошибка базы данных! Попробуйте позже";
            }
            $dataSend = true;
            break;
    }

    if ($dataSend) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
    }
}
