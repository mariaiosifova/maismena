// Основная логика приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы модального окна
    const modal = document.getElementById('registration-modal');
    const regBtn = document.getElementById('reg-btn');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const registrationForm = document.getElementById('registration-form');

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
    registrationForm.addEventListener('submit', (event) => {
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

        // Сохраняем пользователя в localStorage
        saveUserToLocalStorage(username, password);
        
        // Успех
        alert('Регистрация прошла успешно!');
        modal.style.display = 'none';
        window.location.href = 'success.html';
    });
});

// Функция для хэширования пароля
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// Сохранение пользователя в localStorage
function saveUserToLocalStorage(username, password) {
    // Получаем текущих пользователей
    const existingUsers = JSON.parse(localStorage.getItem('maiUsers') || '[]');
    
    // Проверяем, не занят ли логин
    const userExists = existingUsers.find(user => user.username === username);
    if (userExists) {
        alert('Пользователь с таким логином уже существует');
        return false;
    }

    // Создаем нового пользователя
    const newUser = {
        id: Date.now().toString(),
        username: username,
        password: simpleHash(password), // Сохраняем хэш пароля
        registrationDate: new Date().toISOString()
    };

    // Добавляем в массив пользователей
    existingUsers.push(newUser);
    
    // Сохраняем обратно в localStorage
    localStorage.setItem('maiUsers', JSON.stringify(existingUsers));
    
    console.log('Пользователь сохранен в localStorage:', username);
    return true;
}

// Функция для проверки входа (может пригодиться позже)
function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('maiUsers') || '[]');
    const passwordHash = simpleHash(password);
    return users.find(user => user.username === username && user.password === passwordHash);
}

// Функция для получения всех пользователей (для админа)
function getAllUsers() {
    return JSON.parse(localStorage.getItem('maiUsers') || '[]');
}