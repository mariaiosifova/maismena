<?php
require "../handlers/loginer/index.php";
require "../config/database.php";

try {
    $stmt = $main_pdo->prepare(
        "SELECT balance, username 
        FROM users 
        ORDER BY balance DESC 
        LIMIT 100;"
    );
    $stmt->execute();
    $data = $stmt->fetchAll();
} catch (PDOException $e) {
    echo "";
}
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мероприятия | МАИ СМЕНА</title>
    <link rel="stylesheet" href="../css/topdesk/index.css">
    <link rel="stylesheet" href="../css/header.css">
</head>

<body>
    <div class="menu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../events/">Мероприятия</a>
            <a href="../jobs/">ТОПс вакансии</a>
            <a href="../profile/">
                <?php
                if ($sessionStatus) {
                    echo htmlspecialchars($userData['username']);
                } else {
                    echo ("Профиль");
                }
                ?>
            </a>

            <button onclick="closeMenu()">Закрыть</button>
        </div>
    </div>

    <div class="body">
        <div class="body--header">
            <header class="header">
                <div class="header--left">
                    <div class="header--left--image">
                        <img src="../images/mai_logo.png" alt="">
                    </div>

                    <div class="header--left--db">МАИ смена</div>
                </div>

                <div class="header--nb">
                    <button onclick="openMenu()">☰</button>
                </div>

                <div class="header--nav">
                    <ul>
                        <li><a href="../events/">Мероприятия</a></li>
                        <li><a href="../jobs/">ТОПс вакансии</a></li>
                        <li>
                            <a href="../profile/">
                                <?php
                                if ($sessionStatus) {
                                    echo htmlspecialchars($userData['username']);
                                } else {
                                    echo ("Профиль");
                                }
                                ?>
                            </a>
                        </li>
                    </ul>
                </div>
            </header>
        </div>

        <div class="body--content">
            <div class="content">
                <div class="content--header">
                    <p>Приветсвуем в наш топ пользователей по балансу МАИКоинов!</p>
                </div>

                <div class="content--body">
                    <div class="container">
                        <table>
                            <caption>
                                МАИ ТОП
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col">Место</th>
                                    <th scope="col">Никнейм</th>
                                    <th scope="col">Баланс</th>
                                </tr>
                            </thead>

                            <tbody>
                                <?php foreach ($data as $row) : ?>
                                    <tr>
                                        <td scope="row"></td>
                                        <td scope="row"><?php echo htmlspecialchars($row['username']) ?></td>
                                        <td scope="row"><?php echo htmlspecialchars($row['balance']) ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/events/index.js"></script>
</body>

</html>