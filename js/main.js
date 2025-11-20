// Основная логика приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - checking elements');
    
    // Элементы модального окна
    const modal = document.getElementById('registration-modal');
    const regBtn = document.getElementById('reg-btn');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const registrationForm = document.getElementById('registration-form');

    console.log('Found elements:', { modal, regBtn, closeBtn, registrationForm });

    // Если элементов нет - выходим
    if (!modal || !regBtn || !closeBtn || !registrationForm) {
        console.log('Некоторые элементы не найдены');
        return;
    }

    // Открытие модального окна
    regBtn.addEventListener('click', () => {
        console.log('Открытие окна регистрации');
        modal.style.display = 'block';
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закрытие при клике вне окна
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

// Обработка формы регистрации
registrationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Валидация
    if (username.length < 3) {
        alert('Логин должен быть не менее 3 символов');
        return;
    }
    if (password.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }

    try {
        // Показываем загрузку
        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;

        // Отправляем запрос
        const response = await fetch('https://maismena.ru/php/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);

        if (!response.ok) {
            throw new Error(result.error || 'Ошибка сервера');
        }

        // Успех
        alert('Регистрация прошла успешно!');
        modal.style.display = 'none';
        window.location.href = 'success.html';

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Ошибка регистрации: ' + error.message);
        
        // Восстанавливаем кнопку
        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Зарегистрироваться';
        submitBtn.disabled = false;
    }
});
});