// Управление мероприятиями
class EventManager {
    constructor() {
        this.events = [];
    }

    // Создание нового мероприятия
    async createEvent(eventData) {
        if (!roleManager.canCreateEvents()) {
            throw new Error('Недостаточно прав для создания мероприятий');
        }

        const event = {
            id: Date.now().toString(),
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            image: eventData.image || './images/event-default.jpg',
            location: eventData.location,
            createdBy: roleManager.currentUsername,
            createdAt: new Date().toISOString(),
            participants: []
        };

        try {
            // Здесь будет сохранение в базу данных
            await this.saveEventToDB(event);
            this.events.push(event);
            return event;
        } catch (error) {
            console.error('Ошибка создания мероприятия:', error);
            throw error;
        }
    }

    // Сохранение мероприятия в базу (заглушка)
    async saveEventToDB(event) {
        // Временное сохранение в localStorage
        const savedEvents = JSON.parse(localStorage.getItem('mai_events') || '[]');
        savedEvents.push(event);
        localStorage.setItem('mai_events', JSON.stringify(savedEvents));
        
        return new Promise((resolve) => {
            setTimeout(resolve, 500); // Имитация задержки сети
        });
    }

    // Загрузка мероприятий
    async loadEvents() {
        // Временная загрузка из localStorage
        this.events = JSON.parse(localStorage.getItem('mai_events') || '[]');
        return this.events;
    }
}

// Управление вакансиями
class VacancyManager {
    constructor() {
        this.vacancies = [];
    }

    // Создание новой вакансии
    async createVacancy(vacancyData) {
        if (!roleManager.canCreateVacancies()) {
            throw new Error('Недостаточно прав для создания вакансий');
        }

        const vacancy = {
            id: Date.now().toString(),
            title: vacancyData.title,
            description: vacancyData.description,
            time: parseInt(vacancyData.time),
            payment: parseInt(vacancyData.payment),
            requirements: vacancyData.requirements,
            createdBy: roleManager.currentUsername,
            createdAt: new Date().toISOString(),
            applicants: []
        };

        try {
            await this.saveVacancyToDB(vacancy);
            this.vacancies.push(vacancy);
            return vacancy;
        } catch (error) {
            console.error('Ошибка создания вакансии:', error);
            throw error;
        }
    }

    // Сохранение вакансии в базу (заглушка)
    async saveVacancyToDB(vacancy) {
        const savedVacancies = JSON.parse(localStorage.getItem('mai_vacancies') || '[]');
        savedVacancies.push(vacancy);
        localStorage.setItem('mai_vacancies', JSON.stringify(savedVacancies));
        
        return new Promise((resolve) => {
            setTimeout(resolve, 500);
        });
    }

    // Загрузка вакансий
    async loadVacancies() {
        this.vacancies = JSON.parse(localStorage.getItem('mai_vacancies') || '[]');
        return this.vacancies;
    }
}

// Создаем глобальные экземпляры
const eventManager = new EventManager();
const vacancyManager = new VacancyManager();