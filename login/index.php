<?php
require "../handlers/loginer/index.php";

if ($sessionStatus && !$userStatus) {
    header('Location: ../profile/');
    exit;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход | МАИ СМЕНА</title>
    <link rel="stylesheet" href="../css/login/index.css">
    <link rel="stylesheet" href="../css/header.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <div class="menu" id="mobileMenu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../events/">Мероприятия</a>
            <a href="../jobs/">ТОП вакансии</a>
            <a href="../topdesk/">Лидерборд</a>
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
                        <li><a href="../jobs/">ТОП вакансии</a></li>
                        <li><a href="../topdesk/">Лидерборд</a></li>
                    </ul>
                </div>
            </header>
        </div>

        <div class="body--content">
            <div class="content">
                <div class="content--header">
                    <p>Вход в систему <span>МАИ СМЕНА</span></p>
                </div>

                <div class="content--body">
                    <div class="container">
                        <div class="container--body">
                            <div class="auth-tabs">
                                <button class="tab-btn active" data-tab="telegram">
                                    <i class="fab fa-telegram"></i> Телеграм
                                </button>
                                <button class="tab-btn" data-tab="password">
                                    <i class="fas fa-key"></i> Пароль
                                </button>
                                <button class="tab-btn" data-tab="register">
                                    <i class="fas fa-user-plus"></i> Регистрация
                                </button>
                            </div>

                            <div class="auth-container">
                                <div class="auth-form active" id="telegram-form">
                                    <div class="form-header">
                                        <h3><i class="fab fa-telegram"></i> Вход через Telegram</h3>
                                        <p>Для входа через Telegram используйте кнопку ниже</p>
                                    </div>
                                    <div>
                                        <button class="auth-btn" onclick="window.location.href='https:\/\/t.me/MAI_smena_bot?start=start'">Войти через Telegram</button>
                                    </div>
                                </div>

                                <div class="auth-form" id="password-form">
                                    <div class="form-header">
                                        <h3><i class="fas fa-key"></i> Вход по логину и паролю</h3>
                                        <p>Введите свои учетные данные</p>
                                    </div>
                                    <form id="loginForm" method="POST" action="../handlers/login/log.php">
                                        <div class="form-group">
                                            <label for="username">
                                                <i class="fas fa-user"></i> Логин
                                            </label>
                                            <input type="text" id="username" name="usernameLog" 
                                                   placeholder="Введите ваш логин" required>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="password">
                                                <i class="fas fa-lock"></i> Пароль
                                            </label>
                                            <input type="password" id="password" name="passwordLog" 
                                                   placeholder="Введите ваш пароль" required>
                                            <div class="password-toggle">
                                                <i class="fas fa-eye" id="togglePassword"></i>
                                            </div>
                                        </div>

                                        <button type="submit" class="auth-btn login-btn">
                                            <i class="fas fa-sign-in-alt"></i> Войти
                                        </button>
                                    </form>
                                </div>

                                <div class="auth-form" id="register-form">
                                    <div class="form-header">
                                        <h3><i class="fas fa-user-plus"></i> Регистрация</h3>
                                        <p>Создайте новую учетную запись</p>
                                    </div>
                                    <form id="registerForm" method="POST" action="../handlers/login/reg.php">
                                        <div class="form-group">
                                            <label for="reg_username">
                                                <i class="fas fa-user"></i> Логин
                                            </label>
                                            <input type="text" id="reg_username" name="username" 
                                                   placeholder="Придумайте логин" required>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="reg_password">
                                                <i class="fas fa-lock"></i> Пароль
                                            </label>
                                            <input type="password" id="reg_password" name="passwordFirst" 
                                                   placeholder="Придумайте пароль" required>
                                        </div>

                                        <div class="form-group">
                                            <label for="reg_password_confirm">
                                                <i class="fas fa-lock"></i> Подтверждение пароля
                                            </label>
                                            <input type="password" id="reg_password_confirm" 
                                                   name="passwordSecond" placeholder="Повторите пароль" required>
                                        </div>

                                        <button type="submit" class="auth-btn register-btn">
                                            <i class="fas fa-user-plus"></i> Зарегистрироваться
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div class="auth-footer">
                                <p>Есть вопросы? <a href="https://t.me/arrur_52">Напишите нам</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/login/index.js"></script>
</body>
</html>