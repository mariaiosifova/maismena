// Обработка кнопок создания мероприятий и вакансий
class CreateButtonsManager {
    constructor() {
        this.init();
    }

    async init() {
        // Ждем инициализации roleManager
        await roleManager.checkUserRole();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчик кнопки создания мероприятия
        const createEventBtn = document.getElementById('create-event-btn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                this.handleCreateEvent();
            });
        }

        // Обработчик кнопки создания вакансии
        const createVacancyBtn = document.getElementById('create-vacancy-btn');
        if (createVacancyBtn) {
            createVacancyBtn.addEventListener('click', () => {
                this.handleCreateVacancy();
            });
        }
    }

    // Обработка создания мероприятия
    handleCreateEvent() {
        if (!roleManager.canCreateEvents()) {
            this.showAccessDeniedMessage('создавать мероприятия');
            return;
        }

        // Показываем форму создания мероприятия
        const eventFormContainer = document.getElementById('event-form-container');
        if (eventFormContainer) {
            eventFormContainer.style.display = 'block';
            // Прокручиваем к форме
            eventFormContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Обработка создания вакансии
    handleCreateVacancy() {
        if (!roleManager.canCreateVacancies()) {
            this.showAccessDeniedMessage('создавать вакансии');
            return;
        }

        // Показываем форму создания вакансии
        const vacancyFormContainer = document.getElementById('vacancy-form-container');
        if (vacancyFormContainer) {
            vacancyFormContainer.style.display = 'block';
            // Прокручиваем к форме
            vacancyFormContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Показать сообщение об отказе в доступе
    showAccessDeniedMessage(action) {
        const message = `У вас нет прав для выполнения этого действия. 
Только организаторы и администраторы могут ${action}.`;

        this.showNotification(message, 'error');
    }

    // Универсальная функция показа уведомлений
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `notification notification--${type}`;
        
        // Стили для уведомления
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
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new CreateButtonsManager();
});