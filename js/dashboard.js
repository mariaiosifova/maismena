// Навигация между страницами и управление навбаром
document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar__link');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    let lastScrollY = window.scrollY;
    let isMenuOpen = false;

    // Функция активации страницы по ID
    function activatePage(pageId) {
        console.log('Активируем страницу:', pageId);
        
        // Убираем активные классы у всех
        navLinks.forEach(link => link.classList.remove('navbar__link--active'));
        pages.forEach(page => page.classList.remove('active'));
        
        // Активируем нужную страницу
        const targetLink = document.querySelector(`[href="#${pageId}"]`);
        const targetPage = document.getElementById(pageId);
        
        if (targetLink && targetPage) {
            targetLink.classList.add('navbar__link--active');
            targetPage.classList.add('active');
            
            // Если активируем профиль - проверяем нужно ли автоматическое редактирование
            if (pageId === 'profile') {
                checkAutoEditMode();
            }
            
            return true;
        }
        return false;
    }

    // Проверка автоматического режима редактирования
    function checkAutoEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const firstLogin = urlParams.get('firstLogin');
        const autoEdit = urlParams.get('autoEdit');
        
        console.log('Проверка авто-редактирования:', { firstLogin, autoEdit });
        
        // Если это первая авторизация или явно указан autoEdit
        if (firstLogin === 'true' || autoEdit === 'true') {
            console.log('Автоматически включаем режим редактирования');
            
            // Даем небольшую задержку для полной загрузки DOM
            setTimeout(() => {
                if (typeof toggleEditMode === 'function') {
                    toggleEditMode(true); // Принудительно включаем редактирование
                    
                    // Показываем сообщение для нового пользователя
                    showWelcomeMessage();
                }
            }, 500);
        }
    }

    // Показать приветственное сообщение для нового пользователя
    function showWelcomeMessage() {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.style.cssText = `
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
        welcomeMessage.innerHTML = `
            <h4 style="margin: 0 0 8px 0;">Добро пожаловать! 🎉</h4>
            <p style="margin: 0; font-size: 14px;">Заполните свой профиль для начала работы</p>
        `;
        
        document.body.appendChild(welcomeMessage);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            welcomeMessage.remove();
        }, 5000);
    }

    // Функция активации по хэшу
    function activatePageFromHash() {
        const hash = window.location.hash;
        console.log('Проверяем хэш:', hash);
        
        if (hash) {
            const pageId = hash.substring(1); // Убираем #
            return activatePage(pageId);
        }
        return false;
    }

    // СНАЧАЛА пробуем активировать по хэшу
    const hashActivated = activatePageFromHash();
    
    // ЕСЛИ хэш не активирован - тогда активируем первую страницу
    if (!hashActivated) {
        console.log('Хэш не найден, активируем первую страницу');
        if (navLinks.length > 0) {
            const firstPageId = navLinks[0].getAttribute('href').substring(1);
            activatePage(firstPageId);
        }
    }

    // Обработка кликов по навигации
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageId = this.getAttribute('href').substring(1);
            activatePage(pageId);
            
            // Обновляем URL
            window.location.hash = pageId;
            
            // Закрываем мобильное меню
            if (isMenuOpen) {
                closeMobileMenu();
            }
        });
    });
    
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
    
    // Управление мобильным меню
    if (menuToggle && navbarMenu) {
        menuToggle.addEventListener('click', function() {
            if (isMenuOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    // Обработка скролла для скрытия/показа навбара
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.classList.add('navbar--hidden');
        } else {
            navbar.classList.remove('navbar--hidden');
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Закрытие мобильного меню при клике вне его
    document.addEventListener('click', function(e) {
        if (isMenuOpen && navbar && !navbar.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Слушаем изменения хэша
    window.addEventListener('hashchange', activatePageFromHash);
    
    // Проверяем авто-редактирование при загрузке (на случай если сразу открыт профиль)
    setTimeout(() => {
        if (window.location.hash === '#profile') {
            checkAutoEditMode();
        }
    }, 1000);
    
    console.log('Dashboard загружен!');
});
