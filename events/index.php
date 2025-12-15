<?php
require "../config/database.php";
require "../handlers/loginer/index.php";

if (!$sessionStatus) {
    header('Location: ../login/');
    exit;
}

if ($sessionStatus && !$userStatus) {
    header('Location: ../profile/');
    exit;
}

try {
    $stmt = $main_pdo->prepare("SELECT * FROM events");
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
    <link rel="stylesheet" href="../css/events/index.css">
    <link rel="stylesheet" href="../css/header.css">
</head>

<body>
    <div class="menu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../jobs/">ТОПс вакансии</a>
            <a href="../topdesk/">Лидерборд</a>
            <a href="../profile/"><?php echo htmlspecialchars($userData['username']) ?></a>

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
                        <li><a href="../jobs/">ТОПс вакансии</a></li>
                        <li><a href="../topdesk/">Лидерборд</a></li>
                    </ul>

                    <ul>
                        <li><a href="../profile/"><?php echo htmlspecialchars($userData['username']) ?></a></li>
                    </ul>
                </div>
            </header>
        </div>

        <div class="body--content">
            <div class="content">
                <div class="content--header">
                    <?php if ($userData['user_rank'] == "user") : ?>
                        <p>Мероприятия в МАИ - это способ <span>проявить себя</span> в разных мероприятиях</p>
                    <?php elseif ($userData['user_rank'] == "admin"): ?>
                        <p><a href="../admin/event/index.php">Добавить мероприятия</a></p>
                    <?php endif; ?>
                </div>

                <div class="content--body">
                    <?php
                    foreach ($data as $event) {
                    ?>
                        <div class="container">
                            <div class="container--body">
                                <div class="container--image">
                                    <img src="<?php echo htmlspecialchars($event["image_path"]) ?>" alt="">
                                </div>

                                <div class="container--body--title">
                                    <p class="container--body--title--title"><?php echo htmlspecialchars($event["name"]) ?></p>
                                    <p class="container--body--title--desc"><?php echo htmlspecialchars($event["description"]) ?></p>
                                    <hr>
                                    <p>📅 <?php echo htmlspecialchars($event["event_data"]) ?></p>
                                    <p>📍 <?php echo htmlspecialchars($event["location"]) ?></p>
                                    <a href="<?php echo htmlspecialchars($event["more"]) ?>">Подробности</a>
                                    <button onclick="window.location.href='/events/reg?event=<?php echo htmlspecialchars($event['id']) ?>'">Подписаться</button>
                                </div>
                            </div>
                        </div>
                    <?php
                    }
                    ?>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/events/index.js"></script>
</body>

</html>