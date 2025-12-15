<?php
require "../handlers/loginer/index.php";

if ($sessionStatus == false) {
    header("Location: ../login/");
}

if ($sessionStatus && !$userStatus) {
    header('Location: ../profile/');
    exit;
}

require "../config/database.php";

$stmt = $main_pdo->prepare("SELECT * FROM jobs ORDER BY data DESC");
$stmt->execute();
$jobs = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вакансии | МАИ СМЕНА</title>
    <link rel="stylesheet" href="../css/jobs/index.css">
    <link rel="stylesheet" href="../css/header.css">
</head>

<body>
    <div class="menu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../events/">Мероприятия</a>
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
                        <li><a href="../events/">Мероприятия</a></li>
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
                        <p>Вакансии МАИ</p>
                    <?php elseif($userData['user_rank'] == "admin"): ?>
                        <p><a href="../admin/jobs/index.php">Добавить вакансии</a></p>
                    <?php endif; ?>
                </div>

                <?php if (empty($jobs)): ?>
                    <div class="no-jobs-message">
                        <p>На данный момент нет доступных вакансий</p>
                    </div>
                <?php else: ?>
                    <div class="jobs-container <?php echo count($jobs) == 1 ? 'single-card' : ''; ?>">
                        <?php foreach ($jobs as $job): ?>
                            <?php
                            $stmt = $main_pdo->prepare("SELECT * FROM users_jobs WHERE job_id = ?");
                            $stmt->execute([$job['id']]);
                            $clicks = $stmt->fetchAll();
                            $currentParticipants = count($clicks);
                            $maxParticipants = (int)$job['all_limit'];
                            $isFull = ($currentParticipants >= $maxParticipants);
                            ?>
                            <div class="job-card">
                                <div class="job-card--header">
                                    <h3 class="job-title"><?php echo htmlspecialchars($job['name']); ?></h3>
                                    <div class="job-payment">
                                        <span class="payment-amount"><?php echo htmlspecialchars($job['payment']); ?></span>
                                        <span class="payment-currency">MAI коинов</span>
                                    </div>

                                    <div class="job-payment">
                                        <span class="payment-amount"><?php echo htmlspecialchars($job['payment_rub']); ?></span>
                                        <span class="payment-currency"> руб.</span>
                                    </div>
                                </div>

                                <div class="job-card--content">
                                    <p class="job-description"><?php echo nl2br(htmlspecialchars($job['description'])); ?></p>

                                    <div class="job-details">
                                        <div class="detail-item">
                                            <span class="detail-label">Время:</span>
                                            <span class="detail-value"><?php echo htmlspecialchars($job['data_start'] . " - " . $job['data_end']); ?></span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Способ оплаты:</span>
                                            <span class="detail-value"><?php echo htmlspecialchars($job['payment_type']); ?></span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Участвуют людей:</span>
                                            <span class="detail-value"><?php echo htmlspecialchars($currentParticipants . "/" . $job['all_limit']); ?></span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Добавил:</span>
                                            <span class="detail-value"><?php echo htmlspecialchars($job['added_by']); ?></span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Добавлено:</span>
                                            <span class="detail-value">
                                                <?php
                                                $date = new DateTime($job['data']);
                                                echo $date->format('d.m.Y H:i');
                                                ?>
                                            </span>
                                        </div>
                                    </div>

                                    <?php
                                    $stmt = $main_pdo->prepare("SELECT * FROM users_jobs WHERE job_id = ? AND user_id = ?");
                                    $stmt->execute([$job['id'], $userData['id']]);
                                    $clickStatus = $stmt->fetch();
                                    ?>

                                    <?php if (!empty($clickStatus)): ?>
                                        <button class="apply-btn opacity" disabled>
                                            Откликнулся
                                        </button>
                                    <?php elseif ($isFull): ?>

                                    <?php else: ?>
                                        <button class="apply-btn" onclick="applyForJob(<?php echo $job['id']; ?>, this)">
                                            Откликнуться
                                        </button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        function openMenu() {
            document.querySelector('.menu').style.display = 'block';
            document.querySelector('.body').style.opacity = '0.5';
        }

        function closeMenu() {
            document.querySelector('.menu').style.display = 'none';
            document.querySelector('.body').style.opacity = '1';
        }

        async function applyForJob(jobId, buttonElement) {
            const originalText = buttonElement.textContent;

            try {
                buttonElement.textContent = 'Отправка...';
                buttonElement.disabled = true;

                const response = await fetch('../handlers/jobs/apply.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        job_id: jobId
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    buttonElement.textContent = 'Откликнулся';
                    buttonElement.style.opacity = '0.7';
                    buttonElement.style.cursor = 'not-allowed';
                } else {
                    alert('Ошибка: ' + result.message);
                    buttonElement.textContent = originalText;
                    buttonElement.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке отклика.');
                buttonElement.textContent = originalText;
                buttonElement.disabled = false;
            }
        }
    </script>
</body>

</html>