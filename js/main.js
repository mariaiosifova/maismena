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

        // Сохраняем в GitHub Gist
        await saveUserToGist(username, password);
        
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

// Функция для хэширования пароля (простая демо-версия)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// Основная функция сохранения в Gist
async function saveUserToGist(username, password) {
    // Проверяем что конфиг загружен
    if (!window.CONFIG || !window.CONFIG.GIST_ID || !window.CONFIG.GITHUB_TOKEN) {
        throw new Error('Конфигурация не загружена');
    }

    const { GIST_ID, GITHUB_TOKEN } = window.CONFIG;

    // 1. Получаем текущий gist
    const getResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!getResponse.ok) {
        throw new Error('Не удалось получить данные gist');
    }

    const gist = await getResponse.json();
    const usersFile = gist.files['users.json'];

    // 2. Парсим текущих пользователей
    const currentContent = usersFile.content || '[]';
    const users = JSON.parse(currentContent);

    // 3. Проверяем, не занят ли логин
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        throw new Error('Пользователь с таким логином уже существует');
    }

    // 4. Добавляем нового пользователя
    const newUser = {
        id: Date.now().toString(),
        username: username,
        password: simpleHash(password), // Храним хэш, а не пароль
        registrationDate: new Date().toISOString(),
        ip: await getClientIP() // Опционально: получаем IP
    };

    users.push(newUser);

    // 5. Обновляем gist
    const updateResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            description: `База пользователей МАИ Смена - ${users.length} пользователей`,
            files: {
                'users.json': {
                    content: JSON.stringify(users, null, 2) // Красивое форматирование
                }
            }
        })
    });

    if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Ошибка сохранения данных');
    }

    console.log('Пользователь успешно сохранен в GitHub Gist');
}

// Функция для получения IP пользователя (опционально)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}