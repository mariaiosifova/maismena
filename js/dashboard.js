// Навигация между страницами и управление навбаром
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar__link');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.querySelector('.navbar__toggle');
    const navbarMenu = document.querySelector('.navbar__menu');
    
    let lastScrollY = window.scrollY;
    let isMenuOpen = false;

    // Обработка кликов по навигации
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок и страниц
            navLinks.forEach(l => l.classList.remove('navbar__link--active'));
            pages.forEach(page => page.classList.remove('active'));
            
            // Добавляем активный класс к текущей ссылке
            link.classList.add('navbar__link--active');
            
            // Показываем соответствующую страницу
            const targetId = link.getAttribute('href').substring(1);
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
        menuToggle.addEventListener('click', () => {
            if (isMenuOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    function openMobileMenu() {
        navbarMenu.classList.add('navbar__menu--open');
        isMenuOpen = true;
    }
    
    function closeMobileMenu() {
        navbarMenu.classList.remove('navbar__menu--open');
        isMenuOpen = false;
    }
    
    // Обработка скролла для скрытия/показа навбара
    window.addEventListener('scroll', () => {
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
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navbar.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // По умолчанию показываем ленту мероприятий
    document.querySelector('.navbar__link--active').click();
});