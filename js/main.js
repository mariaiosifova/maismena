// Основная логика приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - checking elements');
    
    // Элементы модального окна регистрации
    const modal = document.getElementById('registration-modal');
    const regBtn = document.getElementById('reg-btn');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const registrationForm = document.getElementById('registration-form');

    console.log('Found elements:', { modal, regBtn, closeBtn, registrationForm });

    // Если элементы регистрации есть - настраиваем их
    if (modal && regBtn && closeBtn && registrationForm) {
        // Открытие модального окна регистрации
        regBtn.addEventListener('click', () => {
            console.log('Открытие окна регистрации');
            modal.style.display = 'block';
        });

        // Закрытие модального окна регистрации
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
        console.log('Form submitted');
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        console.log('Form data:', { username, password });

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

            console.log('Sending registration request...');

            // Отправляем запрос регистрации
            const response = await fetch('/php/register.php', {
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

            // УСПЕШНАЯ РЕГИСТРАЦИЯ - БЕЗ ALERT, СРАЗУ РЕДИРЕКТ
            modal.style.display = 'none';
            // Успех - БЕЗ ALERT, СРАЗУ РЕДИРЕКТ
            console.log('Регистрация успешна, делаю редирект...');
            console.log('Response OK:', response.ok);
            console.log('Result:', result);

            modal.style.display = 'none';
            window.location.href = 'dashboard.html#profile'; // ← Редирект сразу в личный кабинет

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert('Ошибка регистрации: ' + error.message);
            
            // Восстанавливаем кнопку
            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Зарегистрироваться';
            submitBtn.disabled = false;
        }
    });
    }

    // Обработка кнопки "Войти" в шапке
    const loginBtn = document.querySelector('.button--header-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            showLoginModal();
        });
    }

    // Обработка кнопки "Войти" на главной странице
    const mainLoginBtns = document.querySelectorAll('.button--secondary');
    mainLoginBtns.forEach(btn => {
        if (btn.textContent.includes('Войти')) {
            btn.addEventListener('click', () => {
                showLoginModal();
            });
        }
    });
});

// Функция показа модального окна входа
function showLoginModal() {
    // Создаем модальное окно входа
    const loginModal = document.createElement('div');
    loginModal.className = 'modal';
    loginModal.style.display = 'block';
    loginModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Вход в систему</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="login-username">Логин:</label>
                    <input type="text" id="login-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Пароль:</label>
                    <input type="password" id="login-password" name="password" required>
                </div>
                <button type="submit" class="button button--primary">Войти</button>
            </form>
        </div>
    `;

    document.body.appendChild(loginModal);

    // Закрытие модального окна
    const closeBtn = loginModal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        loginModal.remove();
    });

    // Закрытие при клике вне окна
    loginModal.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.remove();
        }
    });

    // Обработка формы входа
    const loginForm = loginModal.querySelector('#login-form');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

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
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Вход...';
            submitBtn.disabled = true;

            const response = await fetch('/php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка входа');
            }

            // Успешный вход
alert('Вход выполнен успешно!');
loginModal.remove();
window.location.href = '/dashboard.html#profile?firstLogin=true';
            

        } catch (error) {
            console.error('Ошибка входа:', error);
            alert('Ошибка входа: ' + error.message);
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Войти';
            submitBtn.disabled = false;
        }
    });
}
