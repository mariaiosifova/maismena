<?php
header('Content-Type: text/html; charset=utf-8');

$filename = __DIR__ . '/users.txt';

echo '<!DOCTYPE html>
<html>
<head>
    <title>Пользователи МАИ Смена</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Зарегистрированные пользователи МАИ Смена</h1>';

if (!file_exists($filename)) {
    echo '<p>Файл с пользователями не найден</p>';
} else {
    $users = [];
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $userData = json_decode($line, true);
        if ($userData) {
            $users[] = $userData;
        }
    }

    if (empty($users)) {
        echo '<p>Нет зарегистрированных пользователей</p>';
    } else {
        echo '<table>
                <tr>
                    <th>ID</th>
                    <th>Логин</th>
                    <th>IP</th>
                    <th>Дата регистрации</th>
                </tr>';

        foreach ($users as $user) {
            echo '<tr>
                    <td>' . htmlspecialchars($user['id']) . '</td>
                    <td>' . htmlspecialchars($user['username']) . '</td>
                    <td>' . htmlspecialchars($user['ip']) . '</td>
                    <td>' . htmlspecialchars($user['registration_date']) . '</td>
                  </tr>';
        }

        echo '</table>';
        echo '<p><strong>Всего пользователей:</strong> ' . count($users) . '</p>';
    }
}

echo '</body></html>';
?>