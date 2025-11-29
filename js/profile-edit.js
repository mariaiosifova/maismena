let isEditMode = false;
let originalValues = {};

// Включение/выключение режима редактирования
function toggleEditMode(forceEnable = false) {
    const viewElements = document.querySelectorAll('[id$="-view"]');
    const editElements = document.querySelectorAll('[id$="-edit"]');
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    // Если принудительно включаем или переключаем режим
    if (forceEnable || !isEditMode) {
        // Сохраняем оригинальные значения
        viewElements.forEach(viewElement => {
            const fieldName = viewElement.id.replace('-view', '');
            originalValues[fieldName] = viewElement.textContent;
            
            // Находим соответствующий input
            const editElement = document.getElementById(fieldName + '-edit');
            if (editElement) {
                editElement.value = viewElement.textContent;
            }
        });
        
        // Переключаем отображение
        viewElements.forEach(el => el.style.display = 'none');
        editElements.forEach(el => el.style.display = 'block');
        
        // Переключаем кнопки
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        
        isEditMode = true;
        
        console.log('Режим редактирования включен');
        
    } else {
        // Выключаем режим редактирования
        cancelEdit();
    }
}

// Сохранение профиля
function saveProfile() {
    const viewElements = document.querySelectorAll('[id$="-view"]');
    const editElements = document.querySelectorAll('[id$="-edit"]');
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    // Обновляем значения
    viewElements.forEach(viewElement => {
        const fieldName = viewElement.id.replace('-view', '');
        const editElement = document.getElementById(fieldName + '-edit');
        
        if (editElement) {
            const newValue = editElement.value.trim();
            viewElement.textContent = newValue || 'Не указано';
        }
    });
    
    // Переключаем отображение
    viewElements.forEach(el => el.style.display = 'inline-block');
    editElements.forEach(el => el.style.display = 'none');
    
    // Переключаем кнопки
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    isEditMode = false;
    
    // Сохраняем в localStorage (или отправляем на сервер)
    saveToStorage();
    
    // Показываем уведомление об успешном сохранении
    showSaveNotification();
    
    // Убираем параметры авто-редактирования из URL
    cleanURLParameters();
    
    console.log('Профиль сохранен');
}

// Отмена редактирования
function cancelEdit() {
    const viewElements = document.querySelectorAll('[id$="-view"]');
    const editElements = document.querySelectorAll('[id$="-edit"]');
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    // Восстанавливаем оригинальные значения
    Object.keys(originalValues).forEach(fieldName => {
        const viewElement = document.getElementById(fieldName + '-view');
        const editElement = document.getElementById(fieldName + '-edit');
        
        if (viewElement && editElement) {
            viewElement.textContent = originalValues[fieldName];
            editElement.value = originalValues[fieldName];
        }
    });
    
    // Переключаем отображение
    viewElements.forEach(el => el.style.display = 'inline-block');
    editElements.forEach(el => el.style.display = 'none');
    
    // Переключаем кнопки
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    isEditMode = false;
    
    // Убираем параметры авто-редактирования из URL
    cleanURLParameters();
    
    console.log('Редактирование отменено');
}

// Сохранение в localStorage
function saveToStorage() {
    const profileData = {};
    const viewElements = document.querySelectorAll('[id$="-view"]');
    
    viewElements.forEach(viewElement => {
        const fieldName = viewElement.id.replace('-view', '');
        profileData[fieldName] = viewElement.textContent;
    });
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    console.log('Профиль сохранен в localStorage:', profileData);
}

// Загрузка из localStorage
function loadFromStorage() {
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        const viewElements = document.querySelectorAll('[id$="-view"]');
        
        viewElements.forEach(viewElement => {
            const fieldName = viewElement.id.replace('-view', '');
            if (profileData[fieldName] && profileData[fieldName] !== 'Не указано') {
                viewElement.textContent = profileData[fieldName];
            }
        });
        
        console.log('Профиль загружен из localStorage');
    }
}

// Показать уведомление об успешном сохранении
function showSaveNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = 'Профиль успешно сохранен! ✅';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Очистка параметров URL
function cleanURLParameters() {
    const url = new URL(window.location);
    url.searchParams.delete('firstLogin');
    url.searchParams.delete('autoEdit');
    window.history.replaceState({}, '', url);
}

// Функция изменения фото (заглушка)
function changePhoto() {
    alert('Функция изменения фото будет реализована позже');
}

// Загружаем сохраненный профиль при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    console.log('Profile editor loaded');
});
