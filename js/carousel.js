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
        // ... остальной код без изменений
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
    new Carousel(document.querySelector('.carousel'));
});
