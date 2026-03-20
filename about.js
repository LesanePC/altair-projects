/**
 * about.js - Специфичная логика для страницы "О нас"
 */

(function() {
    'use strict';

    // Проверяем, загружена ли страница "О нас"
    if (!document.querySelector('.history-section, .team-section, .reviews-section')) {
        return;
    }

    // ========== Функция для показа сообщений ==========
    if (typeof window.showMessage !== 'function') {
        window.showMessage = function(text, type) {
            const existingMessage = document.querySelector('.message-toast');
            if (existingMessage) existingMessage.remove();
            
            const message = document.createElement('div');
            message.className = `message-toast message-toast--${type}`;
            message.textContent = text;
            document.body.appendChild(message);
            
            setTimeout(() => message.classList.add('show'), 10);
            setTimeout(() => {
                message.classList.remove('show');
                setTimeout(() => message.remove(), 300);
            }, 3000);
            
            message.addEventListener('click', () => message.remove());
        };
    }

    // ========== SIMPLE REVIEWS SLIDER ==========
    function initReviewsSlider() {
        const slider = document.querySelector('.reviews-slider__container');
        const slides = document.querySelectorAll('.review-card');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        const dotsContainer = document.querySelector('.slider-dots');
        
        if (!slider || !slides.length) return;
        
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoplayInterval;
        
        // Создаем точки навигации
        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
            updateDots();
        }
        
        // Обновляем активную точку
        function updateDots() {
            const dots = document.querySelectorAll('.slider-dots button');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
        
        // Переход к слайду
        function goToSlide(index) {
            currentIndex = index;
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        }
        
        // Следующий слайд
        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            goToSlide(currentIndex);
        }
        
        // Предыдущий слайд
        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            goToSlide(currentIndex);
        }
        
        // Запуск автопрокрутки
        function startAutoplay() {
            if (autoplayInterval) clearInterval(autoplayInterval);
            autoplayInterval = setInterval(nextSlide, 5000);
        }
        
        // Остановка автопрокрутки
        function stopAutoplay() {
            if (autoplayInterval) clearInterval(autoplayInterval);
        }
        
        // Инициализация
        createDots();
        goToSlide(0);
        startAutoplay();
        
        // События для кнопок
        if (prevBtn) prevBtn.addEventListener('click', () => {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        });
        
        if (nextBtn) nextBtn.addEventListener('click', () => {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        });
        
        // Пауза при наведении
        const sliderContainer = document.querySelector('.reviews-slider');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopAutoplay);
            sliderContainer.addEventListener('mouseleave', startAutoplay);
        }
        
        console.log('Слайдер отзывов инициализирован');
    }
    
    // ========== Counter Animation ==========
    function initCounters() {
        const statNumbers = document.querySelectorAll('.achievement-number, .stat-number');
        if (!statNumbers.length) return;
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const targetText = counter.textContent;
                    let target = parseInt(targetText);
                    
                    if (isNaN(target)) {
                        const match = targetText.match(/\d+/);
                        target = match ? parseInt(match[0]) : 100;
                    }
                    
                    let current = 0;
                    
                    const updateCounter = () => {
                        const increment = target / 50;
                        if (current < target) {
                            current += increment;
                            counter.textContent = Math.floor(current);
                            setTimeout(updateCounter, 30);
                        } else {
                            counter.textContent = target + (targetText.includes('+') ? '+' : '');
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        statNumbers.forEach(counter => observer.observe(counter));
    }
    
    // ========== Card Animations on Scroll ==========
    function initCardAnimations() {
        const animatedElements = document.querySelectorAll('.advantage-card, .team-card, .mission-card');
        
        animatedElements.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.5s ease ${index * 0.1}s`;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(card);
        });
    }
    
    // ========== Card Hover Effects ==========
    function initCardHoverEffects() {
        const cards = document.querySelectorAll('.advantage-card, .team-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.advantage-card__icon svg, .mission-card__icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1.1)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.advantage-card__icon svg, .mission-card__icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1)';
                }
            });
        });
    }
    
    // ========== Team Contacts Click ==========
    function initTeamContacts() {
        const teamPhones = document.querySelectorAll('.team-card__phone');
        
        teamPhones.forEach(phone => {
            phone.addEventListener('click', function(e) {
                e.preventDefault();
                const phoneNumber = this.getAttribute('href').replace('tel:', '');
                
                navigator.clipboard.writeText(phoneNumber).then(() => {
                    if (window.showMessage) window.showMessage('Номер телефона скопирован', 'success');
                }).catch(() => {
                    if (window.showMessage) window.showMessage('Не удалось скопировать номер', 'error');
                });
            });
        });
    }
    
    // ========== Form Handling ==========
    function initFormHandling() {
        const callbackForm = document.getElementById('callbackForm');
        if (!callbackForm) return;
        
        // Маска для телефона
        const phoneInput = callbackForm.querySelector('input[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                if (value.length === 0) {
                    this.value = '';
                } else if (value.length <= 1) {
                    this.value = `+${value}`;
                } else if (value.length <= 4) {
                    this.value = `+${value.slice(0,1)} (${value.slice(1)}`;
                } else if (value.length <= 7) {
                    this.value = `+${value.slice(0,1)} (${value.slice(1,4)}) ${value.slice(4)}`;
                } else if (value.length <= 9) {
                    this.value = `+${value.slice(0,1)} (${value.slice(1,4)}) ${value.slice(4,7)}-${value.slice(7)}`;
                } else {
                    this.value = `+${value.slice(0,1)} (${value.slice(1,4)}) ${value.slice(4,7)}-${value.slice(7,9)}-${value.slice(9,11)}`;
                }
            });
        }
        
        // Отправка формы
        callbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[name="name"]').value.trim();
            const phone = this.querySelector('input[name="phone"]').value.trim();
            
            if (!name) {
                if (window.showMessage) window.showMessage('Введите ваше имя', 'error');
                return;
            }
            
            if (!phone || phone === '+7 (___) ___-__-__') {
                if (window.showMessage) window.showMessage('Введите номер телефона', 'error');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (window.showMessage) window.showMessage('Спасибо! Мы свяжемся с вами.', 'success');
                this.reset();
            } catch (error) {
                if (window.showMessage) window.showMessage('Ошибка. Попробуйте позже.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // ========== Smooth Scroll ==========
    function initSmoothScroll() {
        const scrollLinks = document.querySelectorAll('[data-scroll], a[href^="#"]:not([href="#"])');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const hash = this.getAttribute('href') || this.getAttribute('data-scroll');
                if (!hash || hash === '#') return;
                
                const targetId = hash.replace('#', '');
                const target = document.getElementById(targetId);
                
                if (target) {
                    e.preventDefault();
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerHeight - 20;
                    
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            });
        });
    }
    
    // ========== Timeline Animation ==========
    function initTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = `all 0.5s ease ${index * 0.2}s`;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(item);
        });
    }
    
    // ========== Scroll Reveal ==========
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.history__content, .history__timeline, .section__header, .join-content');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
    
    // ========== Initialize All ==========
    function init() {
        console.log('Инициализация страницы "О нас"...');
        
        initReviewsSlider();
        initCounters();
        initCardAnimations();
        initTimelineAnimation();
        initScrollReveal();
        initCardHoverEffects();
        initTeamContacts();
        initFormHandling();
        initSmoothScroll();
        
        console.log('Страница "О нас" загружена');
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();