// Основная логика приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы модального окна
    const modal = document.getElementById('registration-modal');
    const regBtn = document.getElementById('reg-btn');
    const closeBtn = modal.querySelector('.close');
    const registrationForm = document.getElementById('registration-form');

    // Открытие модального окна
    if (regBtn) {
        regBtn.addEventListener('click', () => {
            console.log('Открытие окна регистрации');
            modal.style.display = 'block';
        });
    }

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закрытие при клике вне окна
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Обработка формы регистрации
    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        console.log('Регистрация пользователя:', username);
        
        // Переход на новую страницу
        window.location.href = 'success.html';
    });
});