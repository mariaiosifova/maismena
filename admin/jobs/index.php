<?php
require "../../handlers/loginer/index.php";

if (!$sessionStatus) {
    header("Location: ../../login/");
    exit;
}

if ($userRank != "admin") {
    header("Location: ../../login/error?error=403");
}
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Создание вакансии | МАИ СМЕНА</title>
    <link rel="stylesheet" href="../../css/admin/jobs/index.css">
    <link rel="stylesheet" href="../../css/header.css">
</head>

<body>
    <div class="menu">
        <div class="menu--body">
            <p>Меню</p>
            <a href="../../events/">Мероприятия</a>
            <a href="../../topdesk/">Лидерборд</a>
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
                        <li><a href="../../topdesk/">Лидерборд</a></li>
                    </ul>
                </div>
            </header>
        </div>

        <div class="body--content">
            <div class="content">
                <div class="content--header">
                    <p>Создание новой вакансии</p>
                </div>

                <div class="create-form">
                    <form id="vacancy-form" class="create-form__content">
                        <div class="form-group">
                            <label for="vacancy-title">Название вакансии</label>
                            <input type="text" id="vacancy-title" name="title" required class="form-input" placeholder="Введите название вакансии">
                        </div>

                        <div class="form-group">
                            <label for="vacancy-description">Описание работы</label>
                            <textarea id="vacancy-description" name="description" required class="form-textarea" rows="4" placeholder="Опишите обязанности, требования и условия работы"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="vacancy-description">Вид оплаты</label>
                            <textarea id="vacancy-payment-type" name="payment_type" required class="form-textarea" rows="4" placeholder="На руки или как то иначе?"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="vacancy-work-date">Дата работы</label>
                            <input type="date" id="vacancy-work-date" name="work_date" required class="form-input">
                        </div>

                        <div class="form-group">
                            <label for="vacancy-time-start">Время начала</label>
                            <input type="time" id="vacancy-time-start" name="time_start" required class="form-input">
                        </div>

                        <div class="form-group">
                            <label for="vacancy-time-end">Время окончания</label>
                            <input type="time" id="vacancy-time-end" name="time_end" required class="form-input">
                        </div>

                        <div class="form-group">
                            <label for="vacancy-payment-mai">Оплата (MAIcoins)</label>
                            <input type="number" id="vacancy-payment-mai" name="paymentMai" required class="form-input" min="1" placeholder="Введите сумму оплаты труда">
                        </div>

                        <div class="form-group">
                            <label for="vacancy-payment-rub">Оплата (Рубли)</label>
                            <input type="number" id="vacancy-payment-rub" name="paymentRub" required class="form-input" min="1" placeholder="Введите сумму оплаты труда">
                        </div>

                        <div class="form-group">
                            <label for="vacancy-all-limit">Всего может участвовать</label>
                            <input type="number" id="vacancy-all-limit" name="all_limit" required class="form-input" min="1" placeholder="10 человек">
                        </div>

                        <div class="form-actions">
                            <button type="submit">Создать вакансию</button>
                        </div>
                    </form>
                </div>
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

        document.addEventListener('DOMContentLoaded', function() {
            const dateInput = document.getElementById('vacancy-work-date');
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;

            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0');

            const dateInputValue = new Date(dateInput.value);
            const todayDate = new Date(today);

            if (dateInputValue.toDateString() === todayDate.toDateString()) {
                document.getElementById('vacancy-time-start').min = currentTime;
            }

            dateInput.addEventListener('change', function() {
                const selectedDate = new Date(this.value);
                const today = new Date().toDateString();

                if (selectedDate.toDateString() === today) {
                    document.getElementById('vacancy-time-start').min = currentTime;
                } else {
                    document.getElementById('vacancy-time-start').min = '00:00';
                }
            });
        });

        document.getElementById('vacancy-form').addEventListener('submit', function(e) {
            e.preventDefault();

            const timeStart = document.getElementById('vacancy-time-start').value;
            const timeEnd = document.getElementById('vacancy-time-end').value;

            if (timeStart && timeEnd && timeStart >= timeEnd) {
                alert('Время окончания должно быть позже времени начала');
                return false;
            }

            const paymentMai = document.getElementById('vacancy-payment-mai').value;
            const paymentRub = document.getElementById('vacancy-payment-rub').value;
            const allLimit = document.getElementById('vacancy-all-limit').value;

            if (paymentMai < 1) {
                alert('Оплата MAIcoins должна быть положительным числом');
                return false;
            }

            if (paymentRub < 1) {
                alert('Оплата в рублях должна быть положительным числом');
                return false;
            }

            if (allLimit < 1) {
                alert('Количество участников должно быть положительным числом');
                return false;
            }

            const formData = new FormData(this);

            const workDate = document.getElementById('vacancy-work-date').value;
            const today = new Date().toISOString().split('T')[0];
            if (workDate < today) {
                alert('Дата работы не может быть в прошлом');
                return false;
            }

            fetch('../../handlers/jobs/create.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        alert(data.message || 'Вакансия успешно создана!');

                        document.getElementById('vacancy-form').reset();

                        window.location.href = '../../jobs/';
                    } else {
                        alert(data.error || 'Произошла ошибка при создании вакансии');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Произошла ошибка при отправке формы. Попробуйте еще раз.');
                });

            return false;
        });
    </script>
</body>

</html>