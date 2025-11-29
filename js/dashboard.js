// Упрощенный dashboard.js - только навигация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard загружается...');

    // Основные элементы
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar__link');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    let isMenuOpen = false;

    // Инициализация
    function initialize() {
        console.log('🔧 Инициализируем навигацию...');
        setupNavigation();
        console.log('✅ Dashboard готов!');
    }

    // Настройка навигации
    function setupNavigation() {
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
            const lastScrollY = window.lastScrollY || 0;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.classList.add('navbar--hidden');
            } else {
                navbar.classList.remove('navbar--hidden');
            }
            
            window.lastScrollY = currentScrollY;
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (isMenuOpen && navbar && !navbar.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Отслеживание изменений хэша
        window.addEventListener('hashchange', activatePageFromHash);
        
        // Проверяем авто-редактирование профиля
        checkAutoEditMode();
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
            return true;
        }
        
        return false;
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

    // Инициализация
    initialize();
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
        }
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
        }
    }
}

// Вспомогательная функция для получения менеджера форм
function getFormsManager() {
    return window.formsManager || (typeof CreateFormsManager !== 'undefined' ? new CreateFormsManager() : null);
}
