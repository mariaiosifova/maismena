// Упрощенный dashboard.js с интеграцией новых менеджеров
document.addEventListener('DOMContentLoaded', function() {
    // Основные элементы
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar__link');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    let lastScrollY = window.scrollY;
    let isMenuOpen = false;

    // Инициализация приложения
    async function initializeApp() {
        console.log('🚀 Инициализация приложения...');
        
        try {
            // Инициализируем менеджеры
            await initializeManagers();
            
            // Настраиваем навигацию
            setupNavigation();
            
            // Загружаем начальные данные
            await loadInitialData();
            
            console.log('✅ Приложение инициализировано');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
    }

    // Инициализация менеджеров
    async function initializeManagers() {
        // RoleManager уже создан глобально в role-manager.js
        if (typeof roleManager !== 'undefined') {
            await roleManager.checkUserRole();
            console.log('✅ RoleManager инициализирован');
        }
        
        // EventManager и VacancyManager уже созданы глобально в event-manager.js
        if (typeof eventManager !== 'undefined') {
            console.log('✅ EventManager доступен');
        }
        
        if (typeof vacancyManager !== 'undefined') {
            console.log('✅ VacancyManager доступен');
        }
        
        // Инициализируем CreateFormsManager если он существует
        if (typeof CreateFormsManager !== 'undefined') {
            new CreateFormsManager();
            console.log('✅ CreateFormsManager инициализирован');
        }
        
        // Инициализируем CreateButtonsManager если он существует
        if (typeof CreateButtonsManager !== 'undefined') {
            new CreateButtonsManager();
            console.log('✅ CreateButtonsManager инициализирован');
        }
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
        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.classList.add('navbar--hidden');
            } else {
                navbar.classList.remove('navbar--hidden');
            }
            
            lastScrollY = currentScrollY;
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (isMenuOpen && navbar && !navbar.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Отслеживание изменений хэша
        window.addEventListener('hashchange', activatePageFromHash);
    }

    // Загрузка начальных данных
    async function loadInitialData() {
        console.log('📥 Загружаем начальные данные...');
        
        // Загружаем мероприятия и вакансии при активации соответствующих страниц
        const currentPage = getCurrentPage();
        
        if (currentPage === 'events' || currentPage === 'topc') {
            await loadEventsAndVacancies();
        }
        
        // Проверяем авто-редактирование профиля
        checkAutoEditMode();
    }

    // Загрузка мероприятий и вакансий
    async function loadEventsAndVacancies() {
        try {
            // Используем существующие методы из CreateFormsManager
            const formsManager = getFormsManager();
            if (formsManager) {
                await formsManager.loadExistingData();
            } else {
                // Альтернативная загрузка если CreateFormsManager не доступен
                await loadEventsAndVacanciesFallback();
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    // Альтернативная загрузка данных
    async function loadEventsAndVacanciesFallback() {
        if (typeof eventManager !== 'undefined') {
            await eventManager.loadEvents();
        }
        
        if (typeof vacancyManager !== 'undefined') {
            await vacancyManager.loadVacancies();
        }
    }

    // Получение экземпляра CreateFormsManager
    function getFormsManager() {
        // Ищем существующий экземпляр или создаем новый
        if (window.formsManager) {
            return window.formsManager;
        }
        
        if (typeof CreateFormsManager !== 'undefined') {
            window.formsManager = new CreateFormsManager();
            return window.formsManager;
        }
        
        return null;
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
            
            // Загружаем данные для активной страницы
            handlePageActivation(pageId);
            
            return true;
        }
        
        return false;
    }

    // Обработка активации страницы
    function handlePageActivation(pageId) {
        switch (pageId) {
            case 'events':
                loadEventsData();
                break;
            case 'topc':
                loadVacanciesData();
                break;
            case 'profile':
                loadProfileData();
                break;
        }
    }

    // Загрузка данных мероприятий
    async function loadEventsData() {
        console.log('📅 Загружаем данные мероприятий...');
        // Данные уже загружаются через CreateFormsManager
    }

    // Загрузка данных вакансий
    async function loadVacanciesData() {
        console.log('💼 Загружаем данные вакансий...');
        // Данные уже загружаются через CreateFormsManager
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

    // Получение текущей страницы
    function getCurrentPage() {
        const activePage = document.querySelector('.page.active');
        return activePage ? activePage.id : '';
    }

    // Проверка авто-редактирования профиля
    function checkAutoEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const firstLogin = urlParams.get('firstLogin');
        const autoEdit = urlParams.get('autoEdit');
        
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

// Упрощенные глобальные функции для обратной совместимости
async function registerForEvent(eventId) {
    console.log('📝 Регистрация на мероприятие:', eventId);
    
    // Используем функциональность из CreateFormsManager
    const formsManager = getFormsManager();
    if (formsManager && typeof formsManager.handleEventRegister === 'function') {
        const button = document.querySelector(`[data-event-id="${eventId}"] .event-card__register`);
        formsManager.handleEventRegister(eventId, button);
    } else {
        alert('Функция регистрации временно недоступна');
    }
}

async function applyForVacancy(vacancyId) {
    console.log('📨 Отклик на вакансию:', vacancyId);
    
    // Используем функциональность из CreateFormsManager
    const formsManager = getFormsManager();
    if (formsManager && typeof formsManager.handleVacancyApply === 'function') {
        const button = document.querySelector(`[data-vacancy-id="${vacancyId}"] .vacancy-card__apply`);
        formsManager.handleVacancyApply(vacancyId, button);
    } else {
        alert('Функция отклика временно недоступна');
    }
}

// Вспомогательная функция для получения менеджера форм
function getFormsManager() {
    return window.formsManager || (typeof CreateFormsManager !== 'undefined' ? new CreateFormsManager() : null);
}

// Резервная инициализация если DOM уже загружен
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }, 100);
}
