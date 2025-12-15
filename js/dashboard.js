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
            // Инициализируем менеджер ролей ПЕРВЫМ делом
            await initializeRoleManager();
            
            // Проверяем авторизацию
            await checkAuth();
            
            // Загружаем данные
            await loadAllData();
            
            // Обновляем интерфейс в зависимости от роли
            updateUIForRole();
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
        }
    }

    // Инициализация менеджера ролей
    async function initializeRoleManager() {
        // Используем существующий RoleManager из role-manager.js
        if (typeof RoleManager !== 'undefined' && window.roleManager) {
            console.log('✅ RoleManager уже инициализирован');
            
            // Проверяем роль пользователя через менеджер
            const roleChecked = await window.roleManager.checkUserRole();
            if (roleChecked) {
                console.log('✅ Роль проверена через RoleManager:', window.roleManager.getCurrentRole());
            }
        } else {
            console.warn('❌ RoleManager не доступен, создаем fallback');
            // Fallback если RoleManager не загружен
            await checkUserRoleFallback();
        }
    }

    // Fallback проверка роли если RoleManager не доступен
    async function checkUserRoleFallback() {
        try {
            const response = await fetch('/php/check_role.php', {
                method: 'GET',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Создаем минимальный объект roleManager
                window.roleManager = {
                    currentRole: result.role,
                    currentUsername: result.username,
                    currentUserId: result.user_id,
                    getCurrentRole: () => window.roleManager.currentRole,
                    getUsername: () => window.roleManager.currentUsername,
                    canCreateEvents: () => window.roleManager.currentRole === 'organizer' || window.roleManager.currentRole === 'admin',
                    canCreateVacancies: () => window.roleManager.currentRole === 'employer' || window.roleManager.currentRole === 'admin',
                    isAdmin: () => window.roleManager.currentRole === 'admin'
                };
                
                console.log('✅ Роль получена через fallback:', window.roleManager.currentRole);
            } else {
                throw new Error('Не удалось получить роль');
            }
        } catch (error) {
            console.error('❌ Ошибка fallback проверки роли:', error);
            // Создаем менеджер с ролью по умолчанию
            window.roleManager = {
                currentRole: 'user',
                currentUsername: '',
                currentUserId: '',
                getCurrentRole: () => 'user',
                getUsername: () => '',
                canCreateEvents: () => false,
                canCreateVacancies: () => false,
                isAdmin: () => false
            };
        }
    }

    // Инициализация менеджеров
    async function initializeManagers() {
        // EventManager и VacancyManager инициализируем если нужно
        if (typeof EventManager !== 'undefined' && !window.eventManager) {
            window.eventManager = new EventManager();
        }
        if (typeof VacancyManager !== 'undefined' && !window.vacancyManager) {
            window.vacancyManager = new VacancyManager();
        }
    }

    // Загрузка всех данных
    async function loadAllData() {
        await Promise.all([
            loadEvents(),
            loadVacancies()
        ]);
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
                console.log('✅ Пользователь авторизован:', currentUser);
                return true;
            } else {
                console.log('❌ Пользователь не авторизован');
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка проверки авторизации:', error);
            return false;
        }
    }

    // Обновление интерфейса в зависимости от роли
    function updateUIForRole() {
        if (!window.roleManager) {
            console.warn('❌ RoleManager не доступен для обновления UI');
            return;
        }
        
        const currentRole = window.roleManager.getCurrentRole();
        console.log('🎨 Обновляем интерфейс для роли:', currentRole);
        
        // Используем методы RoleManager для проверки прав
        if (window.roleManager.canCreateEvents()) {
            showCreateEventButton();
        } else {
            hideCreateEventButton();
        }
        
        if (window.roleManager.canCreateVacancies()) {
            showCreateVacancyButton();
        } else {
            hideCreateVacancyButton();
        }
        
        // Обновляем отображение кнопок записи/отклика
        updateActionButtons();
        
        // Показываем информацию о роли в интерфейсе (опционально)
        showRoleIndicator();
    }

    // Показать кнопку создания мероприятия
    function showCreateEventButton() {
        const currentRole = window.roleManager.getCurrentRole();
        console.log('✅ Показываем кнопку создания мероприятия для роли:', currentRole);
        
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
            console.log('✅ Кнопка создания мероприятия добавлена');
        }
    }

    // Скрыть кнопку создания мероприятия
    function hideCreateEventButton() {
        console.log('❌ Скрываем кнопку создания мероприятия');
        
        const createEventBtn = document.getElementById('create-event-btn');
        if (createEventBtn) {
            createEventBtn.remove();
            console.log('✅ Кнопка создания мероприятия удалена');
        }
    }

    // Показать кнопку создания вакансии
    function showCreateVacancyButton() {
        const currentRole = window.roleManager.getCurrentRole();
        console.log('✅ Показываем кнопку создания вакансии для роли:', currentRole);
        
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
            console.log('✅ Кнопка создания вакансии добавлена');
        }
    }

    // Скрыть кнопку создания вакансии
    function hideCreateVacancyButton() {
        console.log('❌ Скрываем кнопку создания вакансии');
        
        const createVacancyBtn = document.getElementById('create-vacancy-btn');
        if (createVacancyBtn) {
            createVacancyBtn.remove();
            console.log('✅ Кнопка создания вакансии удалена');
        }
    }

    // Показать индикатор роли (опционально, для отладки)
    function showRoleIndicator() {
        if (!window.roleManager) return;
        
        const currentRole = window.roleManager.getCurrentRole();
        const username = window.roleManager.getUsername();
        
        // Удаляем старый индикатор если есть
        const oldIndicator = document.getElementById('role-indicator');
        if (oldIndicator) {
            oldIndicator.remove();
        }
        
        // Создаем новый индикатор
        const roleIndicator = document.createElement('div');
        roleIndicator.id = 'role-indicator';
        roleIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: ${getRoleColor(currentRole)};
            color: white;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            cursor: help;
            max-width: 200px;
        `;
        roleIndicator.innerHTML = `
            <div><strong>Роль:</strong> ${currentRole}</div>
            ${username ? `<div><strong>Пользователь:</strong> ${username}</div>` : ''}
        `;
        roleIndicator.title = `Текущая роль: ${currentRole}${username ? `, пользователь: ${username}` : ''}`;
        
        document.body.appendChild(roleIndicator);
        
        // Автоматически скрываем через 8 секунд
        setTimeout(() => {
            if (roleIndicator.parentNode) {
                roleIndicator.style.opacity = '0.3';
                roleIndicator.style.transition = 'opacity 1s';
                
                // При наведении снова показываем
                roleIndicator.addEventListener('mouseenter', () => {
                    roleIndicator.style.opacity = '1';
                });
                
                roleIndicator.addEventListener('mouseleave', () => {
                    roleIndicator.style.opacity = '0.3';
                });
            }
        }, 8000);
    }

    // Получить цвет для роли
    function getRoleColor(role) {
        const colors = {
            'admin': '#ff6b6b',
            'organizer': '#4ecdc4', 
            'employer': '#ffd93d',
            'user': '#95e1d3'
        };
        return colors[role] || '#95e1d3';
    }

    // Загрузка мероприятий
    async function loadEvents() {
        try {
            let events = [];
            
            // Пробуем загрузить из базы данных
            const response = await fetch('/php/get_events.php');
            const result = await response.json();
            
            if (result.success && result.events) {
                events = result.events;
            }
            
            // Дополняем данными из локального менеджера если он существует
            if (window.eventManager) {
                try {
                    const localEvents = await window.eventManager.loadEvents();
                    events = [...events, ...localEvents];
                } catch (error) {
                    console.warn('Не удалось загрузить локальные мероприятия:', error);
                }
            }
            
            renderEvents(events);
            
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
        
        // Сортируем мероприятия по дате создания (новые сначала)
        events.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
        
        // Добавляем мероприятия
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
        
        const eventDate = event.date || event.createdAt?.split('T')[0];
        const eventTime = event.time_start || '';
        const eventLocation = event.location || '';
        const eventImage = event.image || 'images/event-default.jpg';
        const createdBy = event.createdBy || event.created_by || '';
        
        card.innerHTML = `
            <div class="event-card__image">
                <img src="${eventImage}" alt="${event.title}" onerror="this.src='images/event-default.jpg'">
                <div class="event-card__title-mobile">${event.title}</div>
            </div>
            <div class="event-card__content">
                <h3 class="event-card__title">${event.title}</h3>
                <p class="event-card__description">${event.description}</p>
                <div class="event-card__meta">
                    ${eventDate ? `<div class="event-card__date">📅 ${formatDate(eventDate)}</div>` : ''}
                    ${eventTime ? `<div class="event-card__time">⏰ ${eventTime}</div>` : ''}
                    ${eventLocation ? `<div class="event-card__location">📍 ${eventLocation}</div>` : ''}
                    ${createdBy ? `<div class="event-card__author">👤 ${createdBy}</div>` : ''}
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
            let vacancies = [];
            
            // Пробуем загрузить из базы данных
            const response = await fetch('/php/get_vacancies.php');
            const result = await response.json();
            
            if (result.success && result.vacancies) {
                vacancies = result.vacancies;
            }
            
            // Дополняем данными из локального менеджера если он существует
            if (window.vacancyManager) {
                try {
                    const localVacancies = await window.vacancyManager.loadVacancies();
                    vacancies = [...vacancies, ...localVacancies];
                } catch (error) {
                    console.warn('Не удалось загрузить локальные вакансии:', error);
                }
            }
            
            renderVacancies(vacancies);
            
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
        
        // Сортируем вакансии по дате создания (новые сначала)
        vacancies.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
        
        // Добавляем вакансии
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
        
        const workDate = vacancy.work_date || vacancy.createdAt?.split('T')[0];
        const timeStart = vacancy.time_start || '';
        const timeEnd = vacancy.time_end || '';
        const payment = vacancy.payment || 0;
        const requirements = vacancy.requirements || '';
        const createdBy = vacancy.createdBy || vacancy.created_by || '';
        const timeRequired = vacancy.time || 0;
        
        card.innerHTML = `
            <div class="vacancy-card__main">
                <h3 class="vacancy-card__title">${vacancy.title}</h3>
                <p class="vacancy-card__description">${vacancy.description}</p>
                ${requirements ? `<p class="vacancy-card__requirements"><strong>Требования:</strong> ${requirements}</p>` : ''}
                ${createdBy ? `<p class="vacancy-card__author"><small>Создано: ${createdBy}</small></p>` : ''}
            </div>
            <div class="vacancy-card__meta">
                ${workDate ? `<div class="vacancy-card__date">📅 ${formatDate(workDate)}</div>` : ''}
                ${timeStart ? `<div class="vacancy-card__time">⏰ ${timeStart}${timeEnd ? ` - ${timeEnd}` : ''}</div>` : ''}
                ${timeRequired ? `<div class="vacancy-card__duration">⏱️ ${timeRequired} ч</div>` : ''}
                <div class="vacancy-card__payment">💵 ${payment} MAIPoints</div>
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
            const eventCard = button.closest('.event-card');
            if (!eventCard) continue;
            
            const eventId = eventCard.dataset.eventId;
            const hasRegistered = await checkEventRegistration(eventId);
            
            if (hasRegistered) {
                updateButtonToRegistered(button);
            }
        }
        
        // Обновляем кнопки вакансий
        const vacancyButtons = document.querySelectorAll('.vacancy-card__button');
        for (const button of vacancyButtons) {
            const vacancyCard = button.closest('.vacancy-card');
            if (!vacancyCard) continue;
            
            const vacancyId = vacancyCard.dataset.vacancyId;
            const hasApplied = await checkVacancyApplication(vacancyId);
            
            if (hasApplied) {
                updateButtonToApplied(button);
            }
        }
    }

    // Обновление кнопки мероприятия на "Записан"
    function updateButtonToRegistered(button) {
        button.textContent = 'Записан';
        button.disabled = true;
        button.classList.remove('button--primary');
        button.classList.add('button--secondary');
    }

    // Обновление кнопки вакансии на "Отклик отправлен"
    function updateButtonToApplied(button) {
        button.textContent = 'Отклик отправлен';
        button.disabled = true;
        button.classList.remove('button--primary');
        button.classList.add('button--secondary');
    }

    // Проверка регистрации на мероприятие
    async function checkEventRegistration(eventId) {
        try {
            // Сначала проверяем в базе данных
            const response = await fetch('/php/check_event_registration.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ event_id: eventId })
            });
            
            const result = await response.json();
            if (result.success && result.has_registered) {
                return true;
            }
            
            // Затем проверяем в локальном хранилище
            if (window.eventManager && window.eventManager.events) {
                const event = window.eventManager.events.find(e => e.id === eventId);
                if (event && event.participants && currentUser) {
                    return event.participants.includes(currentUser.username);
                }
            }
            
            return false;
        } catch (error) {
            console.error('Ошибка проверки регистрации:', error);
            return false;
        }
    }

    // Проверка отклика на вакансию
    async function checkVacancyApplication(vacancyId) {
        try {
            // Сначала проверяем в базе данных
            const response = await fetch('/php/check_application_status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ vacancy_id: vacancyId })
            });
            
            const result = await response.json();
            if (result.success && result.has_applied) {
                return true;
            }
            
            // Затем проверяем в локальном хранилище
            if (window.vacancyManager && window.vacancyManager.vacancies) {
                const vacancy = window.vacancyManager.vacancies.find(v => v.id === vacancyId);
                if (vacancy && vacancy.applicants && currentUser) {
                    return vacancy.applicants.includes(currentUser.username);
                }
            }
            
            return false;
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


// ===== ПРОСТОЙ КОД ДЛЯ МОБИЛЬНОГО МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, ищем элементы меню...');
    
    // Получаем элементы
    const menuToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    console.log('Кнопка меню:', menuToggle);
    console.log('Меню:', navbarMenu);
    
    let isMenuOpen = false;

    // Функции мобильного меню
    function openMobileMenu() {
        console.log('Открываем меню');
        if (navbarMenu) {
            navbarMenu.classList.add('navbar__menu--open');
            menuToggle.classList.add('navbar__toggle--active');
            isMenuOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        console.log('Закрываем меню');
        if (navbarMenu) {
            navbarMenu.classList.remove('navbar__menu--open');
            menuToggle.classList.remove('navbar__toggle--active');
            isMenuOpen = false;
            document.body.style.overflow = '';
        }
    }

    // Управление мобильного меню
    if (menuToggle && navbarMenu) {
        console.log('Элементы найдены, добавляем обработчики');
        
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Клик по кнопке меню, текущее состояние:', isMenuOpen);
            
            if (isMenuOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Закрытие меню при клике на ссылку
        const navLinks = document.querySelectorAll('.navbar__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Клик по ссылке меню');
                if (isMenuOpen) {
                    closeMobileMenu();
                }
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !navbarMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                console.log('Клик вне меню');
                closeMobileMenu();
            }
        });

        // Закрытие меню при нажатии ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                console.log('Нажата ESC');
                closeMobileMenu();
            }
        });

    } else {
        console.error('❌ Не найдены элементы меню!');
        console.error('navbarToggle:', menuToggle);
        console.error('navbarMenu:', navbarMenu);
    }
});
    
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
        // Сначала пробуем записаться через базу данных
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
            handleSuccessfulEventRegistration(eventId);
        } else {
            // Если не удалось через базу, пробуем через локальный менеджер
            await registerForEventLocally(eventId);
        }
    } catch (error) {
        console.error('Ошибка записи на мероприятие:', error);
        // Пробуем локальную регистрацию как запасной вариант
        await registerForEventLocally(eventId);
    }
}

// Локальная регистрация на мероприятие
async function registerForEventLocally(eventId) {
    if (!window.eventManager) {
        alert('Ошибка: менеджер мероприятий не доступен');
        return;
    }
    
    try {
        const event = window.eventManager.events.find(e => e.id === eventId);
        if (!event) {
            alert('Мероприятие не найдено');
            return;
        }
        
        if (!event.participants) {
            event.participants = [];
        }
        
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            alert('Пользователь не авторизован');
            return;
        }
        
        if (event.participants.includes(currentUser.username)) {
            alert('Вы уже записаны на это мероприятие');
            return;
        }
        
        event.participants.push(currentUser.username);
        
        // Сохраняем обновленные данные
        await window.eventManager.saveEventToDB(event);
        
        handleSuccessfulEventRegistration(eventId);
        
    } catch (error) {
        console.error('Ошибка локальной регистрации:', error);
        alert('Ошибка при записи на мероприятие');
    }
}

// Обработка успешной регистрации на мероприятие
function handleSuccessfulEventRegistration(eventId) {
    alert('Вы успешно записались на мероприятие!');
    
    // Обновляем кнопку
    const button = document.querySelector(`[onclick="registerForEvent('${eventId}')"]`);
    if (button) {
        button.textContent = 'Записан';
        button.disabled = true;
        button.classList.remove('button--primary');
        button.classList.add('button--secondary');
    }
}

async function applyForVacancy(vacancyId) {
    if (!await checkAuth()) {
        alert('Пожалуйста, войдите в систему для отклика на вакансии');
        return;
    }
    
    try {
        // Сначала пробуем откликнуться через базу данных
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
            handleSuccessfulVacancyApplication(vacancyId);
        } else {
            // Если не удалось через базу, пробуем через локальный менеджер
            await applyForVacancyLocally(vacancyId);
        }
    } catch (error) {
        console.error('Ошибка отклика на вакансию:', error);
        // Пробуем локальный отклик как запасной вариант
        await applyForVacancyLocally(vacancyId);
    }
}

// Локальный отклик на вакансию
async function applyForVacancyLocally(vacancyId) {
    if (!window.vacancyManager) {
        alert('Ошибка: менеджер вакансий не доступен');
        return;
    }
    
    try {
        const vacancy = window.vacancyManager.vacancies.find(v => v.id === vacancyId);
        if (!vacancy) {
            alert('Вакансия не найдена');
            return;
        }
        
        if (!vacancy.applicants) {
            vacancy.applicants = [];
        }
        
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            alert('Пользователь не авторизован');
            return;
        }
        
        if (vacancy.applicants.includes(currentUser.username)) {
            alert('Вы уже откликались на эту вакансию');
            return;
        }
        
        vacancy.applicants.push(currentUser.username);
        
        // Сохраняем обновленные данные
        await window.vacancyManager.saveVacancyToDB(vacancy);
        
        handleSuccessfulVacancyApplication(vacancyId);
        
    } catch (error) {
        console.error('Ошибка локального отклика:', error);
        alert('Ошибка при отклике на вакансию');
    }
}

// Обработка успешного отклика на вакансию
function handleSuccessfulVacancyApplication(vacancyId) {
    alert('Вы успешно откликнулись на вакансию!');
    
    // Обновляем кнопку
    const button = document.querySelector(`[onclick="applyForVacancy('${vacancyId}')"]`);
    if (button) {
        button.textContent = 'Отклик отправлен';
        button.disabled = true;
        button.classList.remove('button--primary');
        button.classList.add('button--secondary');
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

// Получение текущего пользователя
async function getCurrentUser() {
    try {
        const response = await fetch('/php/check_current_user.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        if (result.server.user_id && result.server.user_id !== 'not_set') {
            return {
                id: result.server.user_id,
                username: result.server.username
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDate
