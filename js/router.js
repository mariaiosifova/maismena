class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '';
        
        // Обрабатываем изменение hash в URL
        window.addEventListener('hashchange', () => this.handleRouteChange());
        // Обрабатываем загрузку страницы
        window.addEventListener('load', () => this.handleRouteChange());
    }

    // Добавляем маршрут
    addRoute(path, templateId, callback) {
        this.routes[path] = {
            templateId: templateId,
            callback: callback
        };
    }

    // Обрабатываем изменение маршрута
    handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        this.navigate(hash);
    }

    // Переходим по маршруту
    navigate(path) {
        const route = this.routes[path];
        
        if (route) {
            this.currentRoute = path;
            
            // Загружаем шаблон
            this.loadTemplate(route.templateId).then(html => {
                document.getElementById('app').innerHTML = html;
                
                // Вызываем callback для инициализации страницы
                if (route.callback) {
                    route.callback();
                }
            });
        } else {
            // Страница не найдена
            this.navigate('/404');
        }
    }

    // Загружаем HTML шаблон
    async loadTemplate(templateId) {
        try {
            const response = await fetch(`pages/${templateId}.html`);
            return await response.text();
        } catch (error) {
            return '<h1>Ошибка загрузки страницы</h1>';
        }
    }
}