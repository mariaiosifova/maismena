// Упрощенный dashboard.js с интеграцией всех менеджеров
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загружаем Dashboard...');

    // Основные элементы
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar__link');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    let currentPage = '';
    let isMenuOpen = false;

    // Инициализация приложения
    async function initializeApp() {
        try {
            console.log('🔧 Инициализируем приложение...');
            
            // Инициализируем менеджеры
            await initializeManagers();
            
            // Настраиваем навигацию
            setupNavigation();
            
            console.log('✅ Приложение инициализировано');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
    }

    // Инициализация менеджеров
    async function initializeManagers() {
        console.log('🔧 Инициализируем менеджеры...');
        
        // RoleManager уже создан глобально в role-manager.js
        if (typeof roleManager !== 'undefined') {
            console.log('✅ RoleManager доступен');
            // Ждем проверку роли
            await roleManager.checkUserRole();
        } else {
            console.warn('⚠️ RoleManager не найден');
        }
        
        // EventManager и VacancyManager уже созданы глобально
        if (typeof eventManager !== 'undefined') {
            console.log('✅ EventManager доступен');
        }
        
        if (typeof vacancyManager !== 'undefined') {
            console.log('✅ VacancyManager доступен');
        }
        
        // CreateFormsManager будет создан автоматически в своем файле
        console.log('✅ CreateFormsManager будет инициализирован автоматически');
        
        // CreateButtonsManager будет создан автоматически в своем файле
        console.log('✅ CreateButtonsManager будет инициализирован автоматически');
    }

    // Настройка навигации
    function setupNavigation() {
        console.log('🔧 Настраиваем навигацию...');
        
        // Активируем страницу по хэшу или первую страницу
        const hashActivated = activatePageFromHash();
        if (!hashActivated && navLinks.length > 0) {
            const firstPageId = navLinks[0].getAttribute('href').substring(1);
            activatePage(firstPageId);
        }

        // Обработчики навигации
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.getAttribute('href').substring(1);
                activatePage(pageId);
                window.location.hash = pageId;
                
                if (isMenuOpen) {
                    closeMobileMenu();
                }
            });
        });

        // Мобильное меню
        if (menuToggle && navbarMenu) {
            menuToggle.addEventListener('click', function() {
                if (isMenuOpen) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            });
        }

        // Скрытие навбара при скролле
        window.addEventListener('scroll', handleScroll);
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', handleOutsideClick);

        // Отслеживание изменений хэша
        window.addEventListener('hashchange', activatePageFromHash);
        
        // Проверяем авто-редактирование профиля
        checkAutoEditMode();
    }

    // Обработка скролла
    function handleScroll() {
        const currentScrollY = window.scrollY;
        const lastScrollY = window.lastScrollY || 0;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.classList.add('navbar--hidden');
        } else {
            navbar.classList.remove('navbar--hidden');
        }
        
        window.lastScrollY = currentScrollY;
    }

    // Обработка клика вне меню
    function handleOutsideClick(e) {
        if (isMenuOpen && navbar && !navbar.contains(e.target)) {
            closeMobileMenu();
        }
    }

    // Активация страницы
    function activatePage(pageId) {
        console.log('🔄 Активируем страницу:', pageId);
        
        // Сбрасываем активные состояния
        navLinks.forEach(link => link.classList.remove('navbar__link--active'));
        pages.forEach(page => page.classList.remove('active'));
        
        // Активируем целевую страницу
        const targetLink = document.querySelector(`[href="#${pageId}"]`);
        const targetPage = document.getElementById(pageId);
        
        if (targetLink && targetPage) {
            targetLink.classList.add('navbar__link--active');
            targetPage.classList.add('active');
            currentPage = pageId;
            
            // Загружаем данные для активной страницы
            handlePageActivation(pageId);
            
            return true;
        }
        
        return false;
    }

    // Обработка активации страницы
    function handlePageActivation(pageId) {
        console.log('📄 Активирована страница:', pageId);
        
        switch (pageId) {
            case 'events':
                // Данные загружаются через CreateFormsManager
                break;
            case 'topc':
                // Данные загружаются через CreateFormsManager
                break;
            case 'profile':
                loadProfileData();
                break;
        }
    }

    // Загрузка данных профиля
    async function loadProfileData() {
        console.log('👤 Загружаем данные профиля...');
        // Проверяем авто-редактирование
        checkAutoEditMode();
    }

    // Активация страницы по хэшу
    function activatePageFromHash() {
        const hash = window.location.hash;
        
        if (hash) {
            const cleanHash = hash.split('?')[0].substring(1);
            return activatePage(cleanHash);
        }
        
        return false;
    }

    // Проверка авто-редактирования профиля
    function checkAutoEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const firstLogin = urlParams.get('firstLogin');
        const autoEdit = urlParams.get('autoEdit');
        
        console.log('🔍 Проверка авто-редактирования:', { firstLogin, autoEdit });
        
        if (firstLogin === 'true' || autoEdit === 'true') {
            console.log('🔄 Включаем авто-редактирование профиля');
            
            setTimeout(() => {
                if (typeof toggleEditMode === 'function') {
                    toggleEditMode(true);
                    showWelcomeMessage();
                }
            }, 500);
        }
    }

    // Показать приветственное сообщение
    function showWelcomeMessage() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;
        notification.innerHTML = `
            <h4 style="margin: 0 0 8px 0;">Добро пожаловать! 🎉</h4>
            <p style="margin: 0; font-size: 14px;">Заполните свой профиль для начала работы</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Функции мобильного меню
    function openMobileMenu() {
        if (navbarMenu) {
            navbarMenu.classList.add('navbar__menu--open');
            isMenuOpen = true;
        }
    }
    
    function closeMobileMenu() {
        if (navbarMenu) {
            navbarMenu.classList.remove('navbar__menu--open');
            isMenuOpen = false;
        }
    }

    // Глобальные вспомогательные функции
    window.formatDate = function(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    window.formatDateTime = function(dateTimeString) {
        if (!dateTimeString) return '';
        
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTimeString;
        }
    };

    // Инициализация приложения
    initializeApp();
    console.log('🎯 Dashboard загружен и готов к работе!');
});

// Глобальные функции для обратной совместимости
async function registerForEvent(eventId) {
    console.log('📝 Регистрация на мероприятие:', eventId);
    
    // Используем функциональность из CreateFormsManager
    const formsManager = getFormsManager();
    if (formsManager && typeof formsManager.handleEventRegister === 'function') {
        const button = document.querySelector(`[data-event-id="${eventId}"] .event-card__register`);
        if (button) {
            formsManager.handleEventRegister(eventId, button);
        } else {
            console.error('❌ Кнопка регистрации не найдена');
        }
    } else {
        console.error('❌ CreateFormsManager не доступен');
        showNotification('Функция регистрации временно недоступна', 'error');
    }
}

async function applyForVacancy(vacancyId) {
    console.log('📨 Отклик на вакансию:', vacancyId);
    
    // Используем функциональность из CreateFormsManager
    const formsManager = getFormsManager();
    if (formsManager && typeof formsManager.handleVacancyApply === 'function') {
        const button = document.querySelector(`[data-vacancy-id="${vacancyId}"] .vacancy-card__apply`);
        if (button) {
            formsManager.handleVacancyApply(vacancyId, button);
        } else {
            console.error('❌ Кнопка отклика не найдена');
        }
    } else {
        console.error('❌ CreateFormsManager не доступен');
        showNotification('Функция отклика временно недоступна', 'error');
    }
}

// Вспомогательная функция для получения менеджера форм
function getFormsManager() {
    return window.formsManager || (typeof CreateFormsManager !== 'undefined' ? new CreateFormsManager() : null);
}

// Универсальная функция показа уведомлений
function showNotification(message, type = 'info') {
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
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Резервная инициализация если DOM уже загружен
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }, 100);
}
