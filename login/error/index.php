<?php
$error = $_GET['error'];
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мероприятия | МАИ СМЕНА</title>
    <link rel="stylesheet" href="../../css/topdesk/index.css">
    <link rel="stylesheet" href="../../css/header.css">
</head>

<body>
    <div class="menu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../../jobs/">ТОПс вакансии</a>
            <a href="../../topdesk/">Лидерборд</a>
            <a href="../../profile/">Профиль</a>

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
                        <li><a href="../../events/">Мероприятия</a></li>
                        <li><a href="../../jobs/">ТОПс вакансии</a></li>
                        <li><a href="../../topdesk/">Лидерборд</a></li>
                    </ul>

                    <ul>
                        <li><a href="../../profile/">Профиль</a></li>
                    </ul>
                </div>
            </header>
        </div>

        <div class="body--errors">
            <h1>Ошибка</h1>
            <?php
                if ($error == "empty") echo('Заполните все поля');
                if ($error == "len") echo('Длина пароля не может быть меньше или равна 4 и больше 200 ИЛИ длина юзернейма не может быть меньше 4 и не может быть больше 200');
                if ($error == "passwordNotMatch") echo('Пароли не совпадают');
                if ($error == "dberror") echo("Ошибка базы данных");
                if ($error == "username") echo("Такой юзернейм уже занят");
                if ($error == "wrong") echo("Неверный логин или пароль");
                if ($error == "403") echo("У вас нет доступа к этой странице");
                if ($error == "telegram_invalid") echo("Вы пытались войти через телеграм, но мы не смогли вас идентифицировать. Пожалуйста, попробуйте ввести /start в боте и войти по ссылке из нового сообщения. Если это не помогло, стоит обратиться к администратору");
                if ($error == null) echo('Неизвестная ошибка');
            ?>
        </div>
    </div>

    <script src="../js/events/index.js"></script>
</body>

</html>