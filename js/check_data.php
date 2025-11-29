<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Проверка данных</title>
</head>
<body>
    <h1>🔍 Проверка данных в системе</h1>

    <?php
    $dataDir = __DIR__ . '/data/';
    
    // Проверяем мероприятия
    $eventsFile = $dataDir . 'events.txt';
    echo "<h2>📅 Мероприятия</h2>";
    if (file_exists($eventsFile)) {
        $events = file($eventsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        echo "<p>Найдено мероприятий: " . count($events) . "</p>";
        foreach ($events as $event) {
            $eventData = json_decode($event, true);
            echo "<pre>" . htmlspecialchars($event) . "</pre>";
        }
    } else {
        echo "<p>Файл мероприятий не найден</p>";
    }

    // Проверяем вакансии
    $vacanciesFile = $dataDir . 'vacancies.txt';
    echo "<h2>💼 Вакансии</h2>";
    if (file_exists($vacanciesFile)) {
        $vacancies = file($vacanciesFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        echo "<p>Найдено вакансий: " . count($vacancies) . "</p>";
        foreach ($vacancies as $vacancy) {
            $vacancyData = json_decode($vacancy, true);
            echo "<pre>" . htmlspecialchars($vacancy) . "</pre>";
        }
    } else {
        echo "<p>Файл вакансий не найден</p>";
    }
    ?>
</body>
</html>