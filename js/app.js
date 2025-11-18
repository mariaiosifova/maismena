// Создаем экземпляр роутера
const router = new Router();

// Регистрируем маршруты
router.addRoute('/', 'home', initHomePage);
router.addRoute('/about', 'about', initAboutPage);
router.addRoute('/contacts', 'contacts', initContactsPage);
router.addRoute('/404', '404', init404Page);

// Функции инициализации для каждой страницы
function initHomePage() {
    console.log('Инициализация главной страницы');
    // Здесь можем добавить специфичную логику для главной
    // Например, слайдер, анимации и т.д.
}

function initAboutPage() {
    console.log('Инициализация страницы "О нас"');
    // Логика для страницы "О нас"
}

function initContactsPage() {
    console.log('Инициализация страницы контактов');
    // Логика для страницы контактов
}

function init404Page() {
    console.log('Страница не найдена');
}