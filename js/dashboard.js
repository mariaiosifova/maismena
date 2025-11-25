// Навигация между страницами и управление навбаром
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar__link');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    let lastScrollY = window.scrollY;
    let isMenuOpen = false;

    // Функции для мобильного меню
    function openMobileMenu() {
        navbarMenu.classList.add('navbar__menu--open');
        isMenuOpen = true;
    }
    
    function closeMobileMenu() {
        navbarMenu.classList.remove('navbar__menu--open');
        isMenuOpen = false;
    }
    
    // Обработка кликов по навигации
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок и страниц
            navLinks.forEach(l => l.classList.remove('navbar__link--active'));
            pages.forEach(page => page.classList.remove('active'));
            
            // Добавляем активный класс к текущей ссылке
            this.classList.add('navbar__link--active');
            
            // Показываем соответствующую страницу
            const targetId = this.getAttribute('href').substring(1);
            const targetPage = document.getElementById(targetId);
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            // Закрываем мобильное меню если открыто
            if (isMenuOpen) {
                closeMobileMenu();
            }
        });
    });
    
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
            // Скролл вниз - скрываем навбар
            navbar.classList.add('navbar--hidden');
        } else {
            // Скролл вверх - показываем навбар
            navbar.classList.remove('navbar--hidden');
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Закрытие мобильного меню при клике вне его
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !e.target.closest('.navbar')) {
            closeMobileMenu();
        }
    });
    
    // Автоматическое открытие нужной страницы по хэшу
    function activatePageFromHash() {
        const hash = window.location.hash;
        if (hash) {
            const targetId = hash.substring(1); // Убираем #
            const targetLink = document.querySelector(`[href="#${targetId}"]`);
            const targetPage = document.getElementById(targetId);
            
            if (targetLink && targetPage) {
                // Убираем активные классы
                navLinks.forEach(l => l.classList.remove('navbar__link--active'));
                pages.forEach(page => page.classList.remove('active'));
                
                // Активируем нужную страницу
                targetLink.classList.add('navbar__link--active');
                targetPage.classList.add('active');
            }
        }
    }
    
    // По умолчанию показываем ленту мероприятий, если нет хэша
    if (!window.location.hash) {
        const activeLink = document.querySelector('.navbar__link--active');
        if (activeLink) {
            activeLink.click();
        }
    } else {
        // Если есть хэш - активируем соответствующую страницу
        activatePageFromHash();
    }
    
    // Слушаем изменения хэша
    window.addEventListener('hashchange', activatePageFromHash);
});