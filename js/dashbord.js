// Навигация между страницами
document.addEventListener('DOMContentLoaded', () => {
    // Обработка кликов по навигации
    const navLinks = document.querySelectorAll('.navbar__link');
    const pages = document.querySelectorAll('.page');
    
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
        });
    });
    
    // По умолчанию показываем ленту мероприятий
    document.querySelector('.navbar__link--active').click();
});