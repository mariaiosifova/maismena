let menuOpen = false;

function openMenu() {
    const bodyElement = document.querySelector('.body');
    const menuElement = document.querySelector('.menu');

    bodyElement.style.filter = "blur(5px) brightness(0.3)";
    menuElement.style.display = "block";
    menuOpen = true;
}

function closeMenu() {
    menuOpen = false;
    const bodyElement = document.querySelector('.body');
    const menuElement = document.querySelector('.menu');

    bodyElement.style.filter = "none";
    menuElement.style.display = "none";
}

document.addEventListener('click', function (event) {
    if (menuOpen &&
        !event.target.closest('.menu') &&
        !event.target.closest('.header--nb')) {
        closeMenu();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById(tabId + '-form').classList.add('active');
        });
    });

    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            const password = document.getElementById('reg_password').value;
            const confirmPassword = document.getElementById('reg_password_confirm').value;

            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Пароли не совпадают!');
                return false;
            }

            if (password.length < 6) {
                e.preventDefault();
                alert('Пароль должен содержать минимум 6 символов!');
                return false;
            }

            return true;
        });
    }
    const telegramBtn = document.getElementById('telegramLogin');
    if (telegramBtn) {
        telegramBtn.addEventListener('click', function () {
            alert('Telegram API будет подключено на бэкенде. Ожидайте обновлений!');
            
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            console.log('Отправка данных для входа...');
        });
    }
});