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
    let currentUser = null;

    // Инициализация приложения
    async function initializeApp() {
        try {
            // Проверяем авторизацию
            await checkAuth();
            
            // Загружаем данные
            await loadEvents();
            await loadVacancies();
            
            // Обновляем интерфейс в зависимости от роли
            await updateUIForRole();
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
        }
    }

    // Проверка авторизации
    async function checkAuth() {
        try {
            const response = await fetch('/php/check_current_user.php', {
                method: 'GET',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.server.user_id && result.server.user_id !== 'not_set') {
                currentUser = {
                    id: result.server.user_id,
                    username: result.server.username
                };
                console.log('Пользователь авторизован:', currentUser);
                return true;
            } else {
                console.log('Пользователь не авторизован');
                return false;
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            return false;
        }
    }

    // Проверка роли пользователя
    async function checkUserRole() {
        try {
            const response = await fetch('/php/check_role.php', {
                method: 'GET',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                return result.role;
            } else {
                return 'user';
            }
        } catch (error) {
            console.error('Ошибка проверки роли:', error);
            return 'user';
        }
    }

    // Обновление интерфейса в зависимости от роли
    async function updateUIForRole() {
        const role = await checkUserRole();
        console.log('Роль пользователя:', role);
        
        // Если пользователь организатор или админ, показываем кнопки создания
        if (role === 'organizer' || role === 'admin') {
            showCreateButtons();
        }
        
        // Обновляем отображение кнопок записи/отклика
        updateActionButtons();
    }

    // Показать кнопки создания для организаторов
    function showCreateButtons() {
        // Добавляем кнопку создания мероприятия
        const eventsHeader = document.querySelector('#events .page__header');
        if (eventsHeader && !document.getElementById('create-event-btn')) {
            const createEventBtn = document.createElement('button');
            createEventBtn.id = 'create-event-btn';
            createEventBtn.className = 'button button--primary';
            createEventBtn.textContent = '+ Создать мероприятие';
            createEventBtn.style.marginLeft = '20px';
            createEventBtn.onclick = showCreateEventModal;
            eventsHeader.appendChild(createEventBtn);
        }
        
        // Добавляем кнопку создания вакансии
        const vacanciesHeader = document.querySelector('#topc .page__header');
        if (vacanciesHeader && !document.getElementById('create-vacancy-btn')) {
            const createVacancyBtn = document.createElement('button');
            createVacancyBtn.id = 'create-vacancy-btn';
            createVacancyBtn.className = 'button button--primary';
            createVacancyBtn.textContent = '+ Создать вакансию';
            createVacancyBtn.style.marginLeft = '20px';
            createVacancyBtn.onclick = showCreateVacancyModal;
            vacanciesHeader.appendChild(createVacancyBtn);
        }
    }

    // Загрузка мероприятий
    async function loadEvents() {
        try {
            const response = await fetch('/php/get_events.php');
            const result = await response.json();
            
            if (result.success && result.events) {
                renderEvents(result.events);
            } else {
                console.error('Ошибка загрузки мероприятий:', result.error);
            }
        } catch (error) {
            console.error('Ошибка загрузки мероприятий:', error);
        }
    }

    // Отрисовка мероприятий
    function renderEvents(events) {
        const eventsGrid = document.querySelector('.events-grid');
        if (!eventsGrid) return;
        
        // Очищаем существующие карточки (кроме статических, если есть)
        const existingCards = eventsGrid.querySelectorAll('.event-card');
        existingCards.forEach(card => {
            if (!card.classList.contains('static-event')) {
                card.remove();
            }
        });
        
        // Добавляем мероприятия из базы
        events.forEach(event => {
            const eventCard = createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });
    }

    // Создание карточки мероприятия
    function createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.dataset.eventId = event.id;
        
        card.innerHTML = `
            <div class="event-card__image">
                <img src="${event.image || 'images/event-default.jpg'}" alt="${event.title}">
                <div class="event-card__title-mobile">${event.title}</div>
            </div>
            <div class="event-card__content">
                <h3 class="event-card__title">${event.title}</h3>
                <p class="event-card__description">${event.description}</p>
                <div class="event-card__meta">
                    ${event.date ? `<div class="event-card__date">📅 ${event.date}</div>` : ''}
                    ${event.time_start ? `<div class="event-card__time">⏰ ${event.time_start}${event.time_end ? ` - ${event.time_end}` : ''}</div>` : ''}
                    ${event.location ? `<div class="event-card__location">📍 ${event.location}</div>` : ''}
                    <div class="event-card__points">🪙 +50 MAIPoints</div>
                </div>
                <button class="event-card__button button button--primary" onclick="registerForEvent('${event.id}')">
                    Записаться
                </button>
            </div>
        `;
        
        return card;
    }

    // Загрузка вакансий
    async function loadVacancies() {
        try {
            const response = await fetch('/php/get_vacancies.php');
            const result = await response.json();
            
            if (result.success && result.vacancies) {
                renderVacancies(result.vacancies);
            } else {
                console.error('Ошибка загрузки вакансий:', result.error);
            }
        } catch (error) {
            console.error('Ошибка загрузки вакансий:', error);
        }
    }

    // Отрисовка вакансий
    function renderVacancies(vacancies) {
        const vacanciesList = document.querySelector('.vacancies-list');
        if (!vacanciesList) return;
        
        // Очищаем существующие карточки (кроме статических, если есть)
        const existingCards = vacanciesList.querySelectorAll('.vacancy-card');
        existingCards.forEach(card => {
            if (!card.classList.contains('static-vacancy')) {
                card.remove();
            }
        });
        
        // Добавляем вакансии из базы
        vacancies.forEach(vacancy => {
            const vacancyCard = createVacancyCard(vacancy);
            vacanciesList.appendChild(vacancyCard);
        });
    }

    // Создание карточки вакансии
    function createVacancyCard(vacancy) {
        const card = document.createElement('div');
        card.className = 'vacancy-card';
        card.dataset.vacancyId = vacancy.id;
        
        const hours = Math.floor(vacancy.payment / 12.5); // Пример расчета часов
        
        card.innerHTML = `
            <div class="vacancy-card__main">
                <h3 class="vacancy-card__title">${vacancy.title}</h3>
                <p class="vacancy-card__description">${vacancy.description}</p>
                ${vacancy.requirements ? `<p class="vacancy-card__requirements"><strong>Требования:</strong> ${vacancy.requirements}</p>` : ''}
            </div>
            <div class="vacancy-card__meta">
                ${vacancy.work_date ? `<div class="vacancy-card__date">📅 ${vacancy.work_date}</div>` : ''}
                ${vacancy.time_start ? `<div class="vacancy-card__time">⏰ ${vacancy.time_start}${vacancy.time_end ? ` - ${vacancy.time_end}` : ''}</div>` : ''}
                <div class="vacancy-card__payment">💵 ${vacancy.payment} MAIPoints</div>
            </div>
            <button class="vacancy-card__button button button--primary" onclick="applyForVacancy('${vacancy.id}')">
                Откликнуться
            </button>
        `;
        
        return card;
    }

    // Обновление состояния кнопок действий
    async function updateActionButtons() {
        // Обновляем кнопки мероприятий
        const eventButtons = document.querySelectorAll('.event-card__button');
        for (const button of eventButtons) {
            const eventId = button.closest('.event-card').dataset.eventId;
            const hasRegistered = await checkEventRegistration(eventId);
            
            if (hasRegistered) {
                button.textContent = 'Записан';
                button.disabled = true;
                button.classList.remove('button--primary');
                button.classList.add('button--secondary');
            }
        }
        
        // Обновляем кнопки вакансий
        const vacancyButtons = document.querySelectorAll('.vacancy-card__button');
        for (const button of vacancyButtons) {
            const vacancyId = button.closest('.vacancy-card').dataset.vacancyId;
            const hasApplied = await checkVacancyApplication(vacancyId);
            
            if (hasApplied) {
                button.textContent = 'Отклик отправлен';
                button.disabled = true;
                button.classList.remove('button--primary');
                button.classList.add('button--secondary');
            }
        }
    }

    // Проверка регистрации на мероприятие
    async function checkEventRegistration(eventId) {
        try {
            const response = await fetch('/php/check_event_registration.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ event_id: eventId })
            });
            
            const result = await response.json();
            return result.success && result.has_registered;
        } catch (error) {
            console.error('Ошибка проверки регистрации:', error);
            return false;
        }
    }

    // Проверка отклика на вакансию
    async function checkVacancyApplication(vacancyId) {
        try {
            const response = await fetch('/php/check_application_status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ vacancy_id: vacancyId })
            });
            
            const result = await response.json();
            return result.success && result.has_applied;
        } catch (error) {
            console.error('Ошибка проверки отклика:', error);
            return false;
        }
    }

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
                loadUserProfile();
            }
            
            return true;
        }
        return false;
    }

    // Загрузка профиля пользователя
    async function loadUserProfile() {
        if (!currentUser) return;
        
        try {
            const response = await fetch('/php/get_profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: currentUser.username })
            });
            
            const result = await response.json();
            
            if (result.success && result.profile_data) {
                updateProfileDisplay(result.profile_data);
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        }
    }

    // Обновление отображения профиля
    function updateProfileDisplay(profileData) {
        const fields = ['lastname', 'firstname', 'middlename', 'group', 'direction', 'faculty'];
        
        fields.forEach(field => {
            const viewElement = document.getElementById(`profile-${field}-view`);
            const editElement = document.getElementById(`profile-${field}-edit`);
            
            if (viewElement && editElement && profileData[field]) {
                viewElement.textContent = profileData[field];
                editElement.value = profileData[field];
            }
        });
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
            // Убираем # и ВСЕ параметры после ? в хэше (если есть)
            const cleanHash = hash.split('?')[0].substring(1);
            console.log('Очищенный хэш:', cleanHash);
            return activatePage(cleanHash);
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
            
            // Обновляем URL (ТОЛЬКО хэш, без параметров)
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
    
    // Управление мобильного меню
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
    
    // Проверяем авто-редактирование при загрузке
    setTimeout(() => {
        checkAutoEditMode();
    }, 1000);
    
    // Инициализируем приложение
    initializeApp();
    
    console.log('Dashboard загружен!');
});

// Глобальные функции для кнопок
async function registerForEvent(eventId) {
    if (!await checkAuth()) {
        alert('Пожалуйста, войдите в систему для записи на мероприятия');
        return;
    }
    
    try {
        const response = await fetch('/php/apply_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ event_id: eventId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Вы успешно записались на мероприятие!');
            // Обновляем кнопку
            const button = document.querySelector(`[onclick="registerForEvent('${eventId}')"]`);
            if (button) {
                button.textContent = 'Записан';
                button.disabled = true;
                button.classList.remove('button--primary');
                button.classList.add('button--secondary');
            }
        } else {
            alert('Ошибка: ' + (result.error || 'Не удалось записаться'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при записи на мероприятие');
    }
}

async function applyForVacancy(vacancyId) {
    if (!await checkAuth()) {
        alert('Пожалуйста, войдите в систему для отклика на вакансии');
        return;
    }
    
    try {
        const response = await fetch('/php/apply_vacancy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ vacancy_id: vacancyId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Вы успешно откликнулись на вакансию!');
            // Обновляем кнопку
            const button = document.querySelector(`[onclick="applyForVacancy('${vacancyId}')"]`);
            if (button) {
                button.textContent = 'Отклик отправлен';
                button.disabled = true;
                button.classList.remove('button--primary');
                button.classList.add('button--secondary');
            }
        } else {
            alert('Ошибка: ' + (result.error || 'Не удалось откликнуться'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при отклике на вакансию');
    }
}

// Вспомогательная функция проверки авторизации
async function checkAuth() {
    try {
        const response = await fetch('/php/check_current_user.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        return result.server.user_id && result.server.user_id !== 'not_set';
    } catch (error) {
        return false;
    }
}

// Функции для модальных окон создания (заглушки)
function showCreateEventModal() {
    alert('Функция создания мероприятия будет реализована позже');
}

function showCreateVacancyModal() {
    alert('Функция создания вакансии будет реализована позже');
}
