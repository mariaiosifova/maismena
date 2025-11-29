// Обработка форм создания мероприятий и вакансий
class CreateFormsManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 CreateFormsManager инициализирован');
        this.setupFormListeners();
        this.setupCancelButtons();
        this.setupImageUpload();
        this.loadExistingData();
    }

    setupFormListeners() {
        // Форма создания мероприятия
        const eventForm = document.getElementById('event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));
            console.log('✅ Обработчик формы мероприятия добавлен');
        }

        // Форма создания вакансии
        const vacancyForm = document.getElementById('vacancy-form');
        if (vacancyForm) {
            vacancyForm.addEventListener('submit', (e) => this.handleVacancySubmit(e));
            console.log('✅ Обработчик формы вакансии добавлен');
        }
    }

    setupCancelButtons() {
        // Кнопка отмены для мероприятия
        const cancelEventBtn = document.getElementById('cancel-event-btn');
        if (cancelEventBtn) {
            cancelEventBtn.addEventListener('click', () => {
                document.getElementById('event-form-container').style.display = 'none';
                this.resetEventForm();
            });
        }

        // Кнопка отмены для вакансии
        const cancelVacancyBtn = document.getElementById('cancel-vacancy-btn');
        if (cancelVacancyBtn) {
            cancelVacancyBtn.addEventListener('click', () => {
                document.getElementById('vacancy-form-container').style.display = 'none';
                this.resetVacancyForm();
            });
        }
    }

    // Настройка загрузки изображений
    setupImageUpload() {
        const imageUploadBtn = document.getElementById('event-image-upload-btn');
        const imageFileInput = document.getElementById('event-image-file');
        const imageFilename = document.getElementById('event-image-filename');
        const imagePreview = document.getElementById('event-image-preview');
        
        if (imageUploadBtn && imageFileInput && imagePreview) {
            const imagePreviewImg = imagePreview.querySelector('.image-preview-img');
            
            imageUploadBtn.addEventListener('click', () => {
                imageFileInput.click();
            });

            imageFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Показываем имя файла
                    imageFilename.textContent = file.name;
                    
                    // Показываем превью
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreviewImg.src = e.target.result;
                        imagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                    
                    // Загружаем файл на сервер
                    this.uploadImage(file);
                } else {
                    imageFilename.textContent = 'Файл не выбран';
                    imagePreview.style.display = 'none';
                }
            });
        }
    }

    // Загрузка изображения на сервер
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            this.showNotification('Загрузка изображения...', 'info');
            
            const response = await fetch('./php/upload_image.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                // Сохраняем URL изображения в скрытое поле
                document.getElementById('event-image-url').value = result.image_url;
                this.showNotification('Изображение успешно загружено!', 'success');
            } else {
                this.showNotification('Ошибка загрузки: ' + result.error, 'error');
                this.resetImageUpload();
            }
        } catch (error) {
            console.error('Ошибка загрузки изображения:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
            this.resetImageUpload();
        }
    }

    // Сброс загрузки изображения
    resetImageUpload() {
        const imageFileInput = document.getElementById('event-image-file');
        const imageFilename = document.getElementById('event-image-filename');
        const imagePreview = document.getElementById('event-image-preview');
        const imageUrl = document.getElementById('event-image-url');
        
        if (imageFileInput) imageFileInput.value = '';
        if (imageFilename) imageFilename.textContent = 'Файл не выбран';
        if (imagePreview) imagePreview.style.display = 'none';
        if (imageUrl) imageUrl.value = '';
    }

    // Сброс формы мероприятия
    resetEventForm() {
        this.resetImageUpload();
        const eventForm = document.getElementById('event-form');
        if (eventForm) eventForm.reset();
    }

    // Сброс формы вакансии
    resetVacancyForm() {
        const vacancyForm = document.getElementById('vacancy-form');
        if (vacancyForm) vacancyForm.reset();
    }

    // Загрузка существующих мероприятий и вакансий
    async loadExistingData() {
        console.log('📥 Загрузка данных...');
        await this.loadEvents();
        await this.loadVacancies();
        await this.loadApplicationStatuses();
    }

    // Загрузка мероприятий
    async loadEvents() {
        try {
            console.log('🔄 Загрузка мероприятий...');
            const response = await fetch('./php/get_events.php');
            const result = await response.json();
            
            console.log('✅ Мероприятия загружены:', result.events.length);
            
            if (result.success) {
                this.displayEvents(result.events);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки мероприятий:', error);
        }
    }

    // Загрузка вакансий
    async loadVacancies() {
        try {
            console.log('🔄 Загрузка вакансий...');
            const response = await fetch('./php/get_vacancies.php');
            const result = await response.json();
            
            console.log('✅ Вакансии загружены:', result.vacancies.length);
            
            if (result.success) {
                this.displayVacancies(result.vacancies);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки вакансий:', error);
        }
    }

    // Загрузка статусов откликов
    async loadApplicationStatuses() {
        await this.loadVacancyApplicationStatuses();
        await this.loadEventRegistrationStatuses();
    }

    // Проверка статусов откликов на вакансии
    async loadVacancyApplicationStatuses() {
        const vacanciesList = document.getElementById('vacancies-list');
        if (!vacanciesList) return;

        const vacancyCards = vacanciesList.querySelectorAll('.vacancy-card');
        
        for (const card of vacancyCards) {
            const vacancyId = card.dataset.vacancyId;
            
            try {
                const response = await fetch('./php/check_application_status.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ vacancy_id: vacancyId })
                });

                const result = await response.json();
                
                if (result.success && result.has_applied) {
                    this.markAsApplied(card, 'vacancy');
                }
            } catch (error) {
                console.error('Ошибка проверки статуса вакансии:', error);
            }
        }
    }

    // Проверка статусов регистраций на мероприятия
    async loadEventRegistrationStatuses() {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) return;

        const eventCards = eventsGrid.querySelectorAll('.event-card');
        
        for (const card of eventCards) {
            const eventId = card.dataset.eventId;
            
            try {
                const response = await fetch('./php/check_event_registration.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ event_id: eventId })
                });

                const result = await response.json();
                
                if (result.success && result.has_registered) {
                    this.markAsApplied(card, 'event');
                }
            } catch (error) {
                console.error('Ошибка проверки статуса мероприятия:', error);
            }
        }
    }

    // Отметка карточки как "откликнуто/зарегистрировано"
    markAsApplied(card, type) {
        // Убираем существующие индикаторы
        const existingIndicator = card.querySelector('.applied-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Создаем зеленую полоску
        const indicator = document.createElement('div');
        indicator.className = 'applied-indicator';
        indicator.innerHTML = `
            <div class="applied-indicator__content">
                <span class="applied-indicator__icon">✅</span>
                <span class="applied-indicator__text">
                    ${type === 'vacancy' ? 'Отклик отправлен!' : 'Вы зарегистрированы!'}
                </span>
            </div>
        `;
        
        card.appendChild(indicator);
        
        // Отключаем кнопку отклика
        const applyButton = card.querySelector('.vacancy-card__apply, .event-card__register');
        if (applyButton) {
            applyButton.disabled = true;
            applyButton.textContent = type === 'vacancy' ? 'Отклик отправлен' : 'Зарегистрирован';
            applyButton.classList.add('button--disabled');
        }
    }

    // Отображение мероприятий
    displayEvents(events) {
        const eventsGrid = document.getElementById('events-grid');
        if (!eventsGrid) {
            console.error('❌ Не найден events-grid');
            return;
        }

        console.log('🎨 Отображение мероприятий:', events.length);

        if (events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-data">Пока нет мероприятий. Будьте первым, кто создаст мероприятие!</p>';
            return;
        }

        eventsGrid.innerHTML = events.map(event => {
            let imageUrl = event.image;
            if (imageUrl && imageUrl.startsWith('./')) {
                imageUrl = imageUrl.substring(1);
            }
            
            return `
                <div class="event-card" data-event-id="${event.id}">
                    ${imageUrl ? `
                    <div class="event-card__image">
                        <img src="${imageUrl}" alt="${event.title}" 
                             onerror="this.style.display='none'; this.parentNode.style.display='none'">
                        <div class="event-card__title-mobile">${event.title}</div>
                    </div>
                    ` : '<div class="event-card__image event-card__image--placeholder">📷 Нет изображения</div>'}
                    <div class="event-card__content">
                        <h3 class="event-card__title">${event.title}</h3>
                        <p class="event-card__description">${event.description}</p>
                        <div class="event-card__meta">
                            ${event.date ? `<div class="event-meta"><strong>📅 Дата:</strong> ${this.formatDate(event.date)}</div>` : ''}
                            ${event.time_start && event.time_end ? `
                                <div class="event-meta">
                                    <strong>⏰ Время:</strong> ${this.formatTime(event.time_start)} - ${this.formatTime(event.time_end)}
                                </div>
                            ` : ''}
                            ${event.location ? `<div class="event-meta"><strong>📍 Место:</strong> ${event.location}</div>` : ''}
                            <div class="event-meta"><strong>👤 Создано:</strong> ${event.created_by} • ${this.formatDateTime(event.created_at)}</div>
                        </div>
                        <div class="event-card__actions">
                            <button class="button button--primary event-card__register" 
                                    data-event-id="${event.id}">
                                📝 Зарегистрироваться
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Добавляем обработчики для кнопок регистрации
        this.setupEventRegistrationButtons();
        console.log('✅ Мероприятия отображены');
    }

    // Отображение вакансий
    displayVacancies(vacancies) {
        const vacanciesList = document.getElementById('vacancies-list');
        if (!vacanciesList) {
            console.error('❌ Не найден vacancies-list');
            return;
        }

        console.log('🎨 Отображение вакансий:', vacancies.length);

        if (vacancies.length === 0) {
            vacanciesList.innerHTML = '<p class="no-data">Пока нет вакансий. Будьте первым, кто создаст вакансию!</p>';
            return;
        }

        vacanciesList.innerHTML = vacancies.map(vacancy => `
            <div class="vacancy-card" data-vacancy-id="${vacancy.id}">
                <div class="vacancy-card__main">
                    <h3 class="vacancy-card__title">${vacancy.title}</h3>
                    <p class="vacancy-card__description">${vacancy.description}</p>
                    <div class="vacancy-card__schedule">
                        ${vacancy.work_date ? `<div class="vacancy-meta"><strong>📅 Дата работы:</strong> ${this.formatDate(vacancy.work_date)}</div>` : ''}
                        ${vacancy.time_start && vacancy.time_end ? `
                            <div class="vacancy-meta">
                                <strong>⏰ Время работы:</strong> ${this.formatTime(vacancy.time_start)} - ${this.formatTime(vacancy.time_end)}
                            </div>
                        ` : ''}
                    </div>
                    ${vacancy.requirements ? `<p class="vacancy-card__requirements"><strong>📋 Требования:</strong> ${vacancy.requirements}</p>` : ''}
                    <div class="vacancy-card__author">
                        <strong>👤 Работодатель:</strong> ${vacancy.created_by} • ${this.formatDateTime(vacancy.created_at)}
                    </div>
                </div>
                <div class="vacancy-card__meta">
                    <div class="vacancy-card__payment">🪙 ${vacancy.payment} MAIcoins</div>
                    <button class="button button--primary vacancy-card__apply" 
                            data-vacancy-id="${vacancy.id}">
                        📨 Откликнуться
                    </button>
                </div>
            </div>
        `).join('');

        // Добавляем обработчики для кнопок отклика
        this.setupApplyButtons();
        console.log('✅ Вакансии отображены');
    }

    // Обработчики для кнопок регистрации на мероприятия
    setupEventRegistrationButtons() {
        document.querySelectorAll('.event-card__register').forEach(button => {
            button.addEventListener('click', () => {
                const eventId = button.dataset.eventId;
                this.handleEventRegister(eventId, button);
            });
        });
    }

    // Обработчики для кнопок отклика на вакансии
    setupApplyButtons() {
        document.querySelectorAll('.vacancy-card__apply').forEach(button => {
            button.addEventListener('click', () => {
                const vacancyId = button.dataset.vacancyId;
                this.handleVacancyApply(vacancyId, button);
            });
        });
    }

    // Обработка регистрации на мероприятие
    async handleEventRegister(eventId, button) {
        // Проверяем авторизацию через localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            this.showNotification('Для регистрации необходимо авторизоваться', 'error');
            return;
        }

        try {
            const response = await fetch('./php/apply_event.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ event_id: eventId })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                
                // Находим карточку мероприятия и отмечаем как зарегистрировано
                const eventCard = button.closest('.event-card');
                this.markAsApplied(eventCard, 'event');
                
            } else {
                this.showNotification(result.error || 'Ошибка при регистрации', 'error');
            }
        } catch (error) {
            console.error('Ошибка регистрации на мероприятие:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    // Обработка отклика на вакансию
    async handleVacancyApply(vacancyId, button) {
        // Проверяем авторизацию через localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            this.showNotification('Для отклика необходимо авторизоваться', 'error');
            return;
        }

        try {
            const response = await fetch('./php/apply_vacancy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vacancy_id: vacancyId })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                
                // Находим карточку вакансии и отмечаем как откликнуто
                const vacancyCard = button.closest('.vacancy-card');
                this.markAsApplied(vacancyCard, 'vacancy');
                
            } else {
                this.showNotification(result.error || 'Ошибка при отправке отклика', 'error');
            }
        } catch (error) {
            console.error('Ошибка отклика на вакансию:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    async handleEventSubmit(e) {
        e.preventDefault();
        
        // Проверяем права через localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userRole = currentUser.role;
        
        if (userRole !== 'organizer' && userRole !== 'admin') {
            this.showNotification('У вас нет прав для создания мероприятий', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const imageUrl = document.getElementById('event-image-url').value;
        
        const eventData = {
            title: (formData.get('title') || '').trim(),
            description: (formData.get('description') || '').trim(),
            date: formData.get('date') || '',
            time_start: formData.get('time_start') || '',
            time_end: formData.get('time_end') || '',
            image: imageUrl,
            location: (formData.get('location') || '').trim()
        };

        // Валидация обязательных полей
        if (!eventData.title || !eventData.description || !eventData.date || !eventData.time_start || !eventData.time_end) {
            this.showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        // Валидация времени
        if (eventData.time_start >= eventData.time_end) {
            this.showNotification('Время окончания должно быть позже времени начала', 'error');
            return;
        }

        try {
            const response = await fetch('./php/save_event.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                this.resetEventForm();
                document.getElementById('event-form-container').style.display = 'none';
                
                // Перезагружаем список мероприятий
                await this.loadEvents();
            } else {
                this.showNotification(result.error || 'Ошибка при создании мероприятия', 'error');
            }
        } catch (error) {
            console.error('Ошибка создания мероприятия:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }
    async handleVacancySubmit(e) {
    e.preventDefault();
    
    console.log('=== ОТПРАВКА ФОРМЫ ВАКАНСИИ ===');
    
    // 1. Получаем данные ИЗ ФОРМЫ
    const form = e.target;
    const formData = new FormData(form);
    
    console.log('📋 Данные из формы:');
    for (let [key, value] of formData.entries()) {
        console.log(`   ${key}: "${value}"`);
    }
    
    // 2. Собираем объект для отправки
    const vacancyData = {
        title: formData.get('title'),
        description: formData.get('description'),
        work_date: formData.get('work_date'),
        time_start: formData.get('time_start'),
        time_end: formData.get('time_end'),
        payment: parseInt(formData.get('payment')),
        requirements: formData.get('requirements') || ''
    };
    
    console.log('📦 Данные для отправки:', vacancyData);
    
    // 3. Проверяем что все поля есть
    const required = ['title', 'description', 'work_date', 'time_start', 'time_end', 'payment'];
    const missing = required.filter(field => !vacancyData[field]);
    
    if (missing.length > 0) {
        console.log('❌ Отсутствуют поля:', missing);
        this.showNotification(`Заполните поля: ${missing.join(', ')}`, 'error');
        return;
    }
    
    console.log('✅ Все поля есть, отправляем...');
    
    // 4. Отправляем на сервер
    try {
        const response = await fetch('./php/save_vacancy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vacancyData)
        });

        const result = await response.json();
        console.log('📨 Ответ сервера:', result);
        
        if (result.success) {
            this.showNotification(result.message, 'success');
            this.resetVacancyForm();
            document.getElementById('vacancy-form-container').style.display = 'none';
            await this.loadVacancies();
        } else {
            this.showNotification(result.error || 'Ошибка сервера', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        this.showNotification('Ошибка соединения', 'error');
    }
}

    // Форматирование даты
    formatDate(dateString) {
        try {
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    // Форматирование времени
    formatTime(timeString) {
        return timeString;
    }

    // Форматирование даты и времени
    formatDateTime(dateTimeString) {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTimeString;
        }
    }

    showNotification(message, type = 'info') {
        // Удаляем предыдущие уведомления
        document.querySelectorAll('.custom-notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'custom-notification';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007cba'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            font-family: 'Montserrat', sans-serif;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 DOM загружен, инициализируем CreateFormsManager');
    new CreateFormsManager();
});

// Резервная инициализация если DOM уже загружен
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🏠 DOM уже готов, инициализируем CreateFormsManager');
    setTimeout(() => new CreateFormsManager(), 100);
}