// Основная логика приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы модального окна
    const modal = document.getElementById('registration-modal');
    const regBtn = document.getElementById('reg-btn');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const registrationForm = document.getElementById('registration-form');

    // Если элементов нет - выходим
    if (!modal || !regBtn || !closeBtn || !registrationForm) {
        console.log('Некоторые элементы не найдены');
        return;
    }

    // Открытие модального окна
    regBtn.addEventListener('click', () => {
        console.log('Открытие окна регистрации');
        modal.style.display = 'block';
    });

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
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Валидация
        if (username.length < 3) {
            alert('Логин должен быть не менее 3 символов');
            return;
        }
        if (password.length < 6) {
            alert('Пароль должен быть не менее 6 символов');
            return;
        }

        try {
            // Показываем загрузку
            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Регистрация...';
            submitBtn.disabled = true;

            // Отправляем на PHP бэкенд - ЗАМЕНИ URL НА СВОЙ
            const response = await fetch('https://maismena.ru/php/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || 'Ошибка сервера');
            }

            // Успех
            alert('Регистрация прошла успешно!');
            modal.style.display = 'none';
            window.location.href = 'success.html';

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert('Ошибка регистрации: ' + error.message);
            
            // Восстанавливаем кнопку
            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Зарегистрироваться';
            submitBtn.disabled = false;
        }
    });
});

// Карусель и другие функции остаются как были
class Carousel {
    constructor(container) {
        if (!container) {
            console.log('Carousel container not found');
            return;
        }
        
        this.container = container;
        this.track = container.querySelector('.carousel__track');
        this.slides = Array.from(container.querySelectorAll('.carousel__slide'));
        this.prevBtn = container.querySelector('.carousel__button--prev');
        this.nextBtn = container.querySelector('.carousel__button--next');
        this.indicatorsContainer = container.querySelector('.carousel__indicators');

        // Если нет нужных элементов - не инициализируем карусель
        if (!this.track || !this.slides.length) {
            console.log('Carousel elements not found');
            return;
        }

        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 4000;

        this.init();
    }

    init() {
        this.createIndicators();
        this.setupEventListeners();
        this.startAutoPlay();
        this.updateDisplay();
    }

    createIndicators() {
        this.indicatorsContainer.innerHTML = '';

        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'carousel__indicator';
            if (i === 0) indicator.classList.add('carousel__indicator--active');
            indicator.dataset.slide = i;

            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });

            this.indicatorsContainer.appendChild(indicator);
        }

        this.indicators = Array.from(this.indicatorsContainer.querySelectorAll('.carousel__indicator'));
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        this.setupSwipe();
    }

    goToSlide(index) {
        if (this.isAnimating || index === this.currentSlide) return;

        this.isAnimating = true;
        this.currentSlide = index;
        this.updateDisplay();

        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    next() {
        const nextSlide = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextSlide);
    }

    prev() {
        const prevSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevSlide);
    }

    updateDisplay() {
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;

        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('carousel__indicator--active', index === this.currentSlide);
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    setupSwipe() {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
            this.stopAutoPlay();
        });

        this.container.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX;
        });

        this.container.addEventListener('touchend', () => {
            if (!isSwiping) return;

            const diff = startX - currentX;
            const swipeThreshold = 50;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }

            isSwiping = false;
            this.startAutoPlay();
        });
    }
}

// Инициализация карусели
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel');
    if (carouselContainer) {
        new Carousel(carouselContainer);
    }
});