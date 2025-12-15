<?php
require "../../config/database.php";
require "../../handlers/loginer/index.php";

if (!$sessionStatus) {
    header('Location: ../login/');
    exit;
}

if ($sessionStatus && !$userStatus) {
    header('Location: ../profile/');
    exit;
}

$eventId = isset($_GET['event']) ? (int)$_GET['event'] : null;

if ($eventId === null || $eventId <= 0) {
    header('Location: ../');
    exit;
}

$eventData = null;
$regData = [];

if ($eventId > 0) {
    try {
        $stmt = $main_pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$eventId]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($event) {
            $eventData = $event;
        } else {
            header('Location: ../');
            exit;
        }
    } catch (PDOException $e) {
        error_log("Error loading event: " . $e->getMessage());
        die("Ошибка при загрузке информации о мероприятии");
    }
}

if ($eventData) {
    try {
        $stmt = $main_pdo->prepare("SELECT * FROM users_events WHERE user_id = ? AND event_id = ?");
        $stmt->execute([$userData['id'] ?? 0, $eventId]);
        $regData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error loading registration data: " . $e->getMessage());
        $regData = [];
    }
}

if (!$eventData) {
    header('Location: ../');
    exit;
}

?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мероприятия | МАИ СМЕНА</title>
    <link rel="stylesheet" href="../../css/events/reg/index.css">
    <link rel="stylesheet" href="../../css/header.css">
</head>

<body>
    <div class="menu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../">ТОПс вакансии</a>
            <a href="../../topdesk/">Лидерборд</a>
            <a href="../../profile/"><?php echo htmlspecialchars($userData['username'] ?? 'Пользователь') ?></a>
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
                        <li><a href="../">ТОПс вакансии</a></li>
                        <li><a href="../../topdesk/">Лидерборд</a></li>
                    </ul>

                    <ul>
                        <li><a href="../../profile/"><?php echo htmlspecialchars($userData['username'] ?? 'Пользователь') ?></a></li>
                    </ul>
                </div>
            </header>
        </div>

        <div class="body--content">
            <div class="content">
                <?php if ($eventData): ?>
                    <div class="event-card">
                        <?php if (!empty($eventData['image_path'])): ?>
                            <div class="event-image">
                                <img src="<?php echo htmlspecialchars($eventData['image_path']) ?>" alt="Изображение мероприятия">
                            </div>
                        <?php endif; ?>

                        <div class="event-content">
                            <h1 class="event-title"><?php echo htmlspecialchars($eventData['name'] ?? 'Название мероприятия') ?></h1>

                            <div class="event-description">
                                <p><?php echo htmlspecialchars($eventData['description'] ?? 'Описание отсутствует') ?></p>
                            </div>

                            <div class="event-details">
                                <?php if (!empty($eventData['location'])): ?>
                                    <div class="detail-item">
                                        <span class="detail-label">📍 Место:</span>
                                        <span class="detail-value"><?php echo htmlspecialchars($eventData['location']) ?></span>
                                    </div>
                                <?php endif; ?>

                                <?php if (!empty($eventData['event_data'])): ?>
                                    <div class="detail-item">
                                        <span class="detail-label">📅 Дата:</span>
                                        <span class="detail-value"><?php echo htmlspecialchars($eventData['event_data']) ?></span>
                                    </div>
                                <?php endif; ?>

                                <?php if (!empty($eventData['more'])): ?>
                                    <div class="detail-item">
                                        <span class="detail-label">🔗 Источник:</span>
                                        <a href="<?php echo htmlspecialchars($eventData['more']) ?>" target="_blank" class="detail-link">Источник</a>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <div class="event-status">
                                <div class="status-badge <?php echo !empty($regData) ? 'registered' : 'not-registered' ?>">
                                    <?php if (!empty($regData)) : ?>
                                        ✅ Вы зарегистрированы
                                    <?php else : ?>
                                        ❌ Вы не зарегистрированы
                                    <?php endif; ?>
                                </div>
                            </div>

                            <div class="event-actions">
                                <?php if (empty($regData)) : ?>
                                    <button class="btn btn-primary" id="register-btn">Зарегистрироваться</button>
                                <?php else : ?>
                                    <button class="btn btn-secondary" id="unregister-btn">Выйти из мероприятия</button>
                                    <button class="btn btn-primary" id="register-btn" style="display: none;">Зарегистрироваться</button>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="error-message">
                        <h2>Мероприятие не найдено</h2>
                        <p>Запрошенное мероприятие не существует или было удалено.</p>
                        <a href="../" class="btn btn-primary">Вернуться на главную</a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script src="../../js/events/index.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const registerBtn = document.getElementById('register-btn');
        const unregisterBtn = document.getElementById('unregister-btn');

        if (registerBtn) {
            registerBtn.addEventListener('click', function() {
                registerBtn.disabled = true;
                registerBtn.textContent = 'Регистрация...';

                const formData = new FormData();
                formData.append('event_id', <?php echo $eventId; ?>);
                formData.append('action', 'register');

                fetch('../../handlers/events/reg.php', {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload();
                        } else {
                            registerBtn.disabled = false;
                            registerBtn.textContent = 'Зарегистрироваться';
                            alert('Ошибка: ' + (data.message || 'Не удалось зарегистрироваться'));
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка:', error);
                        registerBtn.disabled = false;
                        registerBtn.textContent = 'Зарегистрироваться';
                        alert('Произошла ошибка при отправке запроса');
                    });
            });
        }

        if (unregisterBtn) {
            unregisterBtn.addEventListener('click', function() {
                if (!confirm('Вы уверены, что хотите выйти из мероприятия?')) {
                    return;
                }

                unregisterBtn.disabled = true;
                unregisterBtn.textContent = 'Выход...';

                const formData = new FormData();
                formData.append('event_id', <?php echo $eventId; ?>);
                formData.append('action', 'unregister');

                fetch('../../handlers/events/unreg.php', {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload();
                        } else {
                            unregisterBtn.disabled = false;
                            unregisterBtn.textContent = 'Выйти из мероприятия';
                            alert('Ошибка: ' + (data.message || 'Не удалось выйти из мероприятия'));
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка:', error);
                        unregisterBtn.disabled = false;
                        unregisterBtn.textContent = 'Выйти из мероприятия';
                        alert('Произошла ошибка при отправке запроса');
                    });
            });
        }
    });
</script>
</body>

</html>