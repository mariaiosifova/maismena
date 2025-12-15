<?php
require "../handlers/loginer/index.php";

if ($sessionStatus == false) {
    header("Location: ../login/");
}

require "../config/database.php";

$stmt = $main_pdo->prepare("SELECT * FROM users WHERE hash = ?");
$stmt->execute([$_SESSION["session_id"]]);
$user = $stmt->fetch();

$userData = $user;
$userId = $user['id'];

$stmt_events = $main_pdo->prepare("
    SELECT e.*, ue.data as registration_date 
    FROM users_events ue 
    LEFT JOIN events e ON e.id = ue.event_id 
    WHERE ue.user_id = ? 
    ORDER BY ue.data DESC
");
$stmt_events->execute([$userId]);
$userEvents = $stmt_events->fetchAll();

$stmt_jobs = $main_pdo->prepare("
    SELECT j.*, uj.data as application_date 
    FROM users_jobs uj 
    LEFT JOIN jobs j ON j.id = uj.job_id 
    WHERE uj.user_id = ? 
    ORDER BY uj.data DESC
");
$stmt_jobs->execute([$userId]);
$userJobs = $stmt_jobs->fetchAll();

$directions = $main_pdo->query("SELECT * FROM direction ORDER BY name")->fetchAll();
$electives = $main_pdo->query("SELECT * FROM electives ORDER BY name")->fetchAll();
$groups = $main_pdo->query("SELECT * FROM student_groups ORDER BY name")->fetchAll();
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Профиль | МАИ СМЕНА</title>
    <link rel="stylesheet" href="../css/profile/index.css">
    <link rel="stylesheet" href="../css/header.css">
</head>

<body>
    <div class="menu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../events/">Мероприятия</a>
            <a href="../jobs/">ТОПс вакансии</a>
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
                        <li><a href="../jobs/">ТОПс вакансии</a></li>
                        <li><a href="../topdesk/">Лидерборд</a></li>
                    </ul>
                </div>
            </header>
        </div>

        <div class="body--content" style="box-sizing: border-box;">
            <div class="content">
                <?php if ($user['full'] == '0'): ?>
                    <div class="content--header">
                        <p>Заполните профиль для продолжения работы</p>
                    </div>
                <?php else: ?>
                    <div class="content--header">
                        <p>Редактирование профиля</p>
                    </div>
                <?php endif; ?>

                <div class="profile-form">
                    <div class="profile-info">
                        <p><strong>Логин:</strong> <?php echo htmlspecialchars($user['username']); ?></p>
                        <p><strong>Баланс:</strong> <?php echo htmlspecialchars($user['balance']); ?> MAI коинов</p>
                    </div>

                    <div class="avatar-section">
                        <div class="avatar-container">
                            <div class="avatar-preview">
                                <img id="avatarPreview"
                                    src="<?php echo htmlspecialchars($user['avatar_path']) ?>"
                                    alt="Аватар пользователя">
                            </div>

                            <form id="avatarForm" class="avatar-form" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="avatarInput" class="avatar-upload-btn" style="display: flex;
                                    justify-content: center; align-items: center;">
                                        <span>✎ Изменить фото</span>
                                        <input type="file" id="avatarInput" name="avatar" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" style="display: none;">
                                    </label>
                                    <div class="avatar-hint">
                                        Максимальный размер: 5MB. Форматы: JPG, PNG, GIF, WebP
                                    </div>
                                </div>
                                <button type="submit" id="avatarSubmitBtn" class="avatar-submit-btn" style="display: none;">
                                    Сохранить фото
                                </button>
                            </form>

                            <div id="avatarUploadStatus" class="upload-status"></div>
                        </div>
                    </div>

                    <form id="profileForm" action="../handlers/profile/update.php" method="POST">
                        <div class="form-group">
                            <label for="first_name">Имя </label>
                            <input type="text" id="first_name" name="first_name"
                                value="<?php echo htmlspecialchars($user['first_name'] ?? ''); ?>"
                                required>
                        </div>

                        <div class="form-group">
                            <label for="last_name">Фамилия </label>
                            <input type="text" id="last_name" name="last_name"
                                value="<?php echo htmlspecialchars($user['last_name'] ?? ''); ?>"
                                required>
                        </div>

                        <div class="form-group">
                            <label for="father_name">Отчество</label>
                            <input type="text" id="father_name" name="father_name"
                                value="<?php echo htmlspecialchars($user['father_name'] ?? ''); ?>">
                        </div>

                        <div class="form-group">
                            <label for="e_direction">Направление </label>
                            <select id="e_direction" name="e_direction" onchange="toggleOtherInput('direction')" required>
                                <option value="">Выберите направление</option>
                                <?php foreach ($directions as $direction): ?>
                                    <option value="<?php echo htmlspecialchars($direction['name']); ?>"
                                        <?php echo ($user['e_direction'] == $direction['name']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($direction['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                                <option value="other" <?php echo (!in_array($user['e_direction'], array_column($directions, 'name')) && !empty($user['e_direction'])) ? 'selected' : ''; ?>>Другое</option>
                            </select>
                            <div id="direction_other_container" style="display: none; margin-top: 10px;">
                                <input type="text" id="e_direction_other" name="e_direction_other"
                                    placeholder="Введите ваше направление"
                                    value="<?php echo (!in_array($user['e_direction'], array_column($directions, 'name')) && !empty($user['e_direction'])) ? htmlspecialchars($user['e_direction']) : ''; ?>">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="e_group">Группа </label>
                            <select id="e_group" name="e_group" onchange="toggleOtherInput('group')" required>
                                <option value="">Выберите группу</option>
                                <?php foreach ($groups as $group): ?>
                                    <option value="<?php echo htmlspecialchars($group['name']); ?>"
                                        <?php echo ($user['e_group'] == $group['name']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($group['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                                <option value="other" <?php echo (!in_array($user['e_group'], array_column($groups, 'name')) && !empty($user['e_group'])) ? 'selected' : ''; ?>>Другое</option>
                            </select>
                            <div id="group_other_container" style="display: none; margin-top: 10px;">
                                <input type="text" id="e_group_other" name="e_group_other"
                                    placeholder="Введите вашу группу"
                                    value="<?php echo (!in_array($user['e_group'], array_column($groups, 'name')) && !empty($user['e_group'])) ? htmlspecialchars($user['e_group']) : ''; ?>">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="e_elective">Электив </label>
                            <select id="e_elective" name="e_elective" onchange="toggleOtherInput('elective')" required>
                                <option value="">Выберите электив</option>
                                <?php foreach ($electives as $elective): ?>
                                    <option value="<?php echo htmlspecialchars($elective['name']); ?>"
                                        <?php echo ($user['e_elective'] == $elective['name']) ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($elective['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                                <option value="other" <?php echo (!in_array($user['e_elective'], array_column($electives, 'name')) && !empty($user['e_elective'])) ? 'selected' : ''; ?>>Другое</option>
                            </select>
                            <div id="elective_other_container" style="display: none; margin-top: 10px;">
                                <input type="text" id="e_elective_other" name="e_elective_other"
                                    placeholder="Введите ваш электив"
                                    value="<?php echo (!in_array($user['e_elective'], array_column($electives, 'name')) && !empty($user['e_elective'])) ? htmlspecialchars($user['e_elective']) : ''; ?>">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="submit-btn">Сохранить изменения</button>
                        </div>
                    </form>
                </div>

                <div class="user-activities">
                    <div class="activities-header">
                        <h2>Ваша активность</h2>
                        <div class="tabs">
                            <button class="tab-btn active" data-tab="events">Ваши мероприятия</button>
                            <button class="tab-btn" data-tab="jobs">Работа</button>
                        </div>
                    </div>

                    <div class="activities-content">
                        <div class="tab-content active" id="events-tab">
                            <?php if (empty($userEvents)): ?>
                                <div class="no-data">
                                    <p>Вы еще не зарегистрировались на мероприятия</p>
                                    <a href="../events/" class="browse-btn">Посмотреть мероприятия</a>
                                </div>
                            <?php else: ?>
                                <div class="activities-list">
                                    <?php foreach ($userEvents as $event): ?>
                                        <div class="activity-item event-item">
                                            <div class="activity-header">
                                                <h3><?php echo htmlspecialchars($event['name'] ?? 'Название не указано'); ?></h3>
                                                <span class="activity-date">
                                                    Зарегистрирован: <?php echo date('d.m.Y H:i', strtotime($event['registration_date'])); ?>
                                                </span>
                                            </div>
                                            <div class="activity-body">
                                                <p><?php echo htmlspecialchars($event['description'] ?? 'Описание отсутствует'); ?></p>
                                                <div class="activity-meta">
                                                    <?php if (!empty($event['event_data'])): ?>
                                                        <span class="meta-item">📅 <?php echo date($event['event_data']); ?></span>
                                                    <?php endif; ?>
                                                    <?php if (!empty($event['location'])): ?>
                                                        <span class="meta-item">📍 Место: <?php echo htmlspecialchars($event['location']); ?></span>
                                                    <?php endif; ?>
                                                    <?php if (!empty($job['event_data'])): ?>
                                                        <span class="meta-item">⏰ Начало: <?php echo htmlspecialchars($job['event_data']); ?></span>
                                                    <?php endif; ?>
                                                    <?php if (!empty($event['id'])): ?>
                                                        <a class="meta-item" href="../events/reg?event=<?php echo htmlspecialchars($event['id']); ?>">💈 Подробнее</a>
                                                    <?php endif; ?>
                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <div class="tab-content" id="jobs-tab">
                            <?php if (empty($userJobs)): ?>
                                <div class="no-data">
                                    <p>Вы еще не откликнулись на вакансии</p>
                                    <a href="../jobs/" class="browse-btn">Посмотреть вакансии</a>
                                </div>
                            <?php else: ?>
                                <div class="activities-list">
                                    <?php foreach ($userJobs as $job): ?>
                                        <div class="activity-item job-item">
                                            <div class="activity-header">
                                                <h3><?php echo htmlspecialchars($job['name'] ?? 'Название не указано'); ?></h3>
                                            </div>
                                            <div class="activity-body">
                                                <p><?php echo htmlspecialchars($job['description'] ?? 'Описание отсутствует'); ?></p>
                                                <div class="activity-meta">
                                                    <?php if (!empty($job['payment'])): ?>
                                                        <span class="meta-item">💹 <?php echo htmlspecialchars($job['payment']); ?> MAI коинов</span>
                                                    <?php endif; ?>
                                                    <?php if (!empty($job['payment'])): ?>
                                                        <span class="meta-item">💰 <?php echo htmlspecialchars($job['payment_rub']); ?> руб.</span>
                                                    <?php endif; ?>
                                                    <?php if (!empty($job['data_start'])): ?>
                                                        <span class="meta-item">⏰ <?php echo htmlspecialchars($job['data_start'] . " - " . $job['data_end']); ?></span>
                                                    <?php endif; ?>
                                                    <?php if (!empty($job['added_by'])): ?>
                                                        <span class="meta-item">🎃 Добавил: <?php echo htmlspecialchars($job['added_by']); ?></span>
                                                    <?php endif; ?>
                                                </div>
                                                <?php if (!empty($job['contact_email'])): ?>
                                                    <div class="activity-contact">
                                                        <strong>Контакты:</strong>
                                                        <a href="mailto:<?php echo htmlspecialchars($job['contact_email']); ?>">
                                                            <?php echo htmlspecialchars($job['contact_email']); ?>
                                                        </a>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const avatarForm = document.getElementById('avatarForm');
            const avatarInput = document.getElementById('avatarInput');
            const avatarPreview = document.getElementById('avatarPreview');
            const avatarSubmitBtn = document.getElementById('avatarSubmitBtn');
            const uploadStatus = document.getElementById('avatarUploadStatus');

            let selectedFile = null;

            avatarInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    selectedFile = file;
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        avatarPreview.src = e.target.result;
                    }
                    reader.readAsDataURL(file);

                    avatarSubmitBtn.style.display = 'inline-block';
                    uploadStatus.innerHTML = '';
                }
            });

            avatarForm.addEventListener('submit', function(e) {
                e.preventDefault();

                if (!selectedFile) {
                    showStatus('Выберите файл для загрузки', 'error');
                    return;
                }

                if (selectedFile.size > 5 * 1024 * 1024) {
                    showStatus('Файл слишком большой (макс. 5MB)', 'error');
                    return;
                }

                const formData = new FormData();
                formData.append('avatar', selectedFile);

                avatarSubmitBtn.disabled = true;
                avatarSubmitBtn.textContent = 'Загрузка...';

                fetch('../handlers/profile/image.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showStatus(data.message, 'success');
                            avatarPreview.src = data.avatar_url + '?t=' + new Date().getTime();
                            avatarSubmitBtn.style.display = 'none';
                            selectedFile = null;
                            avatarInput.value = '';
                        } else {
                            showStatus(data.message, 'error');
                        }
                    })
                    .catch(error => {
                        showStatus('Ошибка сети: ' + error.message, 'error');
                    })
                    .finally(() => {
                        avatarSubmitBtn.disabled = false;
                        avatarSubmitBtn.textContent = 'Сохранить фото';
                    });
            });

            function showStatus(message, type) {
                uploadStatus.innerHTML = message;
                uploadStatus.className = 'upload-status ' + type;

                setTimeout(() => {
                    uploadStatus.innerHTML = '';
                    uploadStatus.className = 'upload-status';
                }, 5000);
            }
        });

        document.addEventListener('DOMContentLoaded', function() {
            toggleOtherInput('direction');
            toggleOtherInput('group');
            toggleOtherInput('elective');

            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.getAttribute('data-tab');

                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));

                    btn.classList.add('active');
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });
        });

        function toggleOtherInput(type) {
            const select = document.getElementById('e_' + type);
            const container = document.getElementById(type + '_other_container');
            const otherInput = document.getElementById('e_' + type + '_other');

            if (select.value === 'other') {
                container.style.display = 'block';
                otherInput.required = true;
            } else {
                container.style.display = 'none';
                otherInput.required = false;
            }
        }

        function openMenu() {
            document.querySelector('.menu').style.display = 'block';
            document.querySelector('.body').style.opacity = '0.5';
        }

        function closeMenu() {
            document.querySelector('.menu').style.display = 'none';
            document.querySelector('.body').style.opacity = '1';
        }

        document.getElementById('profileForm').addEventListener('submit', function(e) {
            const directionSelect = document.getElementById('e_direction');
            const directionOther = document.getElementById('e_direction_other');

            const groupSelect = document.getElementById('e_group');
            const groupOther = document.getElementById('e_group_other');

            const electiveSelect = document.getElementById('e_elective');
            const electiveOther = document.getElementById('e_elective_other');

            if (directionSelect.value === 'other' && directionOther.value.trim()) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'e_direction';
                hiddenInput.value = directionOther.value.trim();
                this.appendChild(hiddenInput);

                directionSelect.disabled = true;
            }

            if (groupSelect.value === 'other' && groupOther.value.trim()) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'e_group';
                hiddenInput.value = groupOther.value.trim();
                this.appendChild(hiddenInput);
                groupSelect.disabled = true;
            }

            if (electiveSelect.value === 'other' && electiveOther.value.trim()) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'e_elective';
                hiddenInput.value = electiveOther.value.trim();
                this.appendChild(hiddenInput);
                electiveSelect.disabled = true;
            }
        });
    </script>
</body>

</html>