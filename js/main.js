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

            // Здесь будет вызов функции сохранения
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
});

// Функции для работы с GitHub Gist
const GIST_ID = 'ТВОЙ_GIST_ID'; // ЗАМЕНИ на настоящий ID

async function getGitHubToken() {
    const token = prompt('Для регистрации введите GitHub Personal Access Token:\n(Получить можно тут: https://github.com/settings/tokens)');
    if (token && token.trim()) {
        return token.trim();
    }
    throw new Error('Токен не предоставлен');
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

async function saveUserToGist(username, password) {
    const GITHUB_TOKEN = await getGitHubToken();

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
        password: simpleHash(password),
        registrationDate: new Date().toISOString()
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
                    content: JSON.stringify(users, null, 2)
                }
            }
        })
    });

    if (!updateResponse.ok) {
        throw new Error('Ошибка сохранения данных в GitHub');
    }

    console.log('Пользователь успешно сохранен');
}