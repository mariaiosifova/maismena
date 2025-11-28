// Режим редактирования профиля
let isEditMode = false;
let originalData = {};

// Включение/выключение режима редактирования
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        // Сохраняем оригинальные данные
        saveOriginalData();
        // Включаем режим редактирования
        enableEditMode();
    } else {
        // Выключаем режим редактирования
        disableEditMode();
    }
}

// Сохранение оригинальных данных
function saveOriginalData() {
    originalData = {
        lastname: document.getElementById('profile-lastname-edit').value,
        firstname: document.getElementById('profile-firstname-edit').value,
        middlename: document.getElementById('profile-middlename-edit').value,
        group: document.getElementById('profile-group-edit').value,
        direction: document.getElementById('profile-direction-edit').value,
        faculty: document.getElementById('profile-faculty-edit').value
    };
}

// Включение режима редактирования
function enableEditMode() {
    // Показываем поля ввода, скрываем текст
    document.querySelectorAll('.profile__value').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.profile__input').forEach(el => el.style.display = 'block');
    
    // Показываем кнопки сохранения/отмены, скрываем редактирование
    document.getElementById('edit-profile-btn').style.display = 'none';
    document.getElementById('save-profile-btn').style.display = 'block';
    document.getElementById('cancel-edit-btn').style.display = 'block';
    
    console.log('Режим редактирования включен');
}

// Выключение режима редактирования
function disableEditMode() {
    // Показываем текст, скрываем поля ввода
    document.querySelectorAll('.profile__value').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.profile__input').forEach(el => el.style.display = 'none');
    
    // Показываем кнопку редактирования, скрываем сохранение/отмену
    document.getElementById('edit-profile-btn').style.display = 'block';
    document.getElementById('save-profile-btn').style.display = 'none';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    
    console.log('Режим редактирования выключен');
}

// Отмена редактирования
function cancelEdit() {
    // Восстанавливаем оригинальные данные
    document.getElementById('profile-lastname-edit').value = originalData.lastname;
    document.getElementById('profile-firstname-edit').value = originalData.firstname;
    document.getElementById('profile-middlename-edit').value = originalData.middlename;
    document.getElementById('profile-group-edit').value = originalData.group;
    document.getElementById('profile-direction-edit').value = originalData.direction;
    document.getElementById('profile-faculty-edit').value = originalData.faculty;
    
    // Обновляем отображаемые значения
    updateDisplayValues();
    
    // Выключаем режим редактирования
    isEditMode = false;
    disableEditMode();
}

// Обновление отображаемых значений
function updateDisplayValues() {
    document.getElementById('profile-lastname-view').textContent = document.getElementById('profile-lastname-edit').value;
    document.getElementById('profile-firstname-view').textContent = document.getElementById('profile-firstname-edit').value;
    document.getElementById('profile-middlename-view').textContent = document.getElementById('profile-middlename-edit').value;
    document.getElementById('profile-group-view').textContent = document.getElementById('profile-group-edit').value;
    document.getElementById('profile-direction-view').textContent = document.getElementById('profile-direction-edit').value;
    document.getElementById('profile-faculty-view').textContent = document.getElementById('profile-faculty-edit').value;
}

// Сохранение профиля
function saveProfile() {
    const profileData = {
        lastname: document.getElementById('profile-lastname-edit').value,
        firstname: document.getElementById('profile-firstname-edit').value,
        middlename: document.getElementById('profile-middlename-edit').value,
        group: document.getElementById('profile-group-edit').value,
        direction: document.getElementById('profile-direction-edit').value,
        faculty: document.getElementById('profile-faculty-edit').value
    };
    
    // Обновляем отображаемые значения
    updateDisplayValues();
    
    // Сохраняем в localStorage (временно)
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    // Показываем уведомление
    showNotification('Профиль успешно сохранен!', 'success');
    
    // Выключаем режим редактирования
    isEditMode = false;
    disableEditMode();
    
    console.log('Профиль сохранен:', profileData);
}

// Функция смены фото (заглушка)
function changePhoto() {
    alert('Функция смены фото будет реализована позже');
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#007cba'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Автоматическое включение редактирования при первом входе
function checkFirstLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const isFirstLogin = urlParams.get('firstLogin') === 'true';
    const hasProfile = localStorage.getItem('userProfile');
    
    if (isFirstLogin && !hasProfile) {
        // Автоматически включаем редактирование
        setTimeout(() => {
            toggleEditMode();
            showNotification('Заполните ваш профиль', 'info');
        }, 1000);
    }
}

// Загружаем сохраненный профиль
function loadProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        
        // Заполняем поля
        document.getElementById('profile-lastname-edit').value = profileData.lastname;
        document.getElementById('profile-firstname-edit').value = profileData.firstname;
        document.getElementById('profile-middlename-edit').value = profileData.middlename;
        document.getElementById('profile-group-edit').value = profileData.group;
        document.getElementById('profile-direction-edit').value = profileData.direction;
        document.getElementById('profile-faculty-edit').value = profileData.faculty;
        
        // Обновляем отображение
        updateDisplayValues();
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    checkFirstLogin();
});
