// Управление ролями и привилегиями
class RoleManager {
    constructor() {
        this.currentRole = 'user';
        this.currentUsername = '';
        this.currentUserId = '';
    }

    // Инициализация из localStorage
    initializeFromStorage() {
        try {
            const userData = localStorage.getItem('currentUser');
            console.log('📦 Данные из localStorage:', userData);
            
            if (userData) {
                const user = JSON.parse(userData);
                this.currentRole = user.role || 'user';
                this.currentUsername = user.username || '';
                this.currentUserId = user.id || '';
                
                console.log('✅ Пользователь из localStorage:');
                console.log('   👤 Имя:', this.currentUsername);
                console.log('   🎯 Роль:', this.currentRole);
                console.log('   🆔 ID:', this.currentUserId);
                
                return true;
            } else {
                console.log('❌ Пользователь не найден в localStorage');
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка чтения localStorage:', error);
            return false;
        }
    }

    // Проверка роли пользователя
    async checkUserRole() {
        const telegramUser = localStorage.getItem('telegramUser');
    if (telegramUser) {
        const user = JSON.parse(telegramUser);
        this.currentRole = 'user'; // По умолчанию для Telegram пользователей
        this.currentUsername = user.username || `tg_${user.id}`;
        this.currentUserId = user.id;
        
        console.log('✅ Пользователь из Telegram:', this.currentUsername);
        this.updateUI();
        return true;
    }
        console.log('🔍 Проверяем роль пользователя...');
        
        // Сначала пробуем из localStorage
        const fromStorage = this.initializeFromStorage();
        
        if (fromStorage) {
            console.log('✅ Роль получена из localStorage:', this.currentRole);
            this.updateUI();
            return true;
        }
        
        // Если в localStorage нет, пробуем через PHP
        console.log('🔄 Пробуем получить роль через PHP...');
        try {
            const response = await fetch('./php/check_role.php');
            const result = await response.json();
            
            if (result.success) {
                this.currentRole = result.role;
                this.currentUsername = result.username;
                this.currentUserId = result.user_id;
                
                // Сохраняем в localStorage на будущее
                localStorage.setItem('currentUser', JSON.stringify({
                    id: this.currentUserId,
                    username: this.currentUsername,
                    role: this.currentRole
                }));
                
                console.log('✅ Роль получена через PHP:', this.currentRole);
                this.updateUI();
                return true;
            }
        } catch (error) {
            console.error('❌ Ошибка получения роли через PHP:', error);
        }
        
        return false;
    }

    // Обновление интерфейса в зависимости от роли
    updateUI() {
        console.log('🎨 Обновляем интерфейс для роли:', this.currentRole);
        
        // Кнопки создания мероприятий
        const eventButtons = document.querySelectorAll('#create-event-btn');
        console.log('🔍 Найдено кнопок мероприятий:', eventButtons.length);
        
        // Кнопки создания вакансий
        const vacancyButtons = document.querySelectorAll('#create-vacancy-btn');
        console.log('🔍 Найдено кнопок вакансий:', vacancyButtons.length);
        
        // Показываем/скрываем кнопки в зависимости от роли
        if (this.canCreateEvents()) {
            eventButtons.forEach(btn => {
                btn.style.display = 'block';
                console.log('✅ Показана кнопка "Создать мероприятие"');
            });
        } else {
            eventButtons.forEach(btn => {
                btn.style.display = 'none';
                console.log('❌ Скрыта кнопка "Создать мероприятие"');
            });
        }
        
        if (this.canCreateVacancies()) {
            vacancyButtons.forEach(btn => {
                btn.style.display = 'block';
                console.log('✅ Показана кнопка "Создать вакансию"');
            });
        } else {
            vacancyButtons.forEach(btn => {
                btn.style.display = 'none';
                console.log('❌ Скрыта кнопка "Создать вакансию"');
            });
        }

        console.log('🎯 Итоговая роль:', this.currentRole);
    }

    // Проверка доступа к созданию мероприятий
    canCreateEvents() {
        return this.currentRole === 'organizer' || this.currentRole === 'admin';
    }

    // Проверка доступа к созданию вакансий
    canCreateVacancies() {
        return this.currentRole === 'employer' || this.currentRole === 'admin';
    }

    // Проверка является ли пользователь администратором
    isAdmin() {
        return this.currentRole === 'admin';
    }

    // Получить текущую роль
    getCurrentRole() {
        return this.currentRole;
    }

    // Получить имя пользователя
    getUsername() {
        return this.currentUsername;
    }
}

// Создаем глобальный экземпляр
const roleManager = new RoleManager();