(function() {
    'use strict';

    // ========== DOM Elements ==========
    const $header = document.getElementById('header');
    const $intro = document.getElementById('intro');
    const $nav = document.getElementById('nav');
    const $navToggle = document.getElementById('navToggle');
    const $scrollTop = document.getElementById('scrollTop');
    const $callbackForm = document.getElementById('callbackForm');
    
    // ========== Helper Functions ==========
    
    /**
     * Показывает всплывающее сообщение
     * @param {string} text - Текст сообщения
     * @param {string} type - Тип сообщения (success/error/info)
     */
    function showMessage(text, type = 'info') {
        // Удаляем существующее сообщение
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Создаем новое сообщение
        const message = document.createElement('div');
        message.className = `message-toast message-toast--${type}`;
        message.textContent = text;
        document.body.appendChild(message);
        
        // Анимация появления
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
        
        // Закрытие по клику
        message.addEventListener('click', () => {
            message.classList.remove('show');
            setTimeout(() => {
                message.remove();
            }, 300);
        });
    }
    
    /**
     * Дебаунс функция для оптимизации событий
     * @param {Function} func - Функция для вызова
     * @param {number} wait - Задержка в мс
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Проверка видимости элемента
     * @param {Element} element - Элемент для проверки
     * @returns {boolean}
     */
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight - 100 && rect.bottom >= 100;
    }
    
    /**
     * Форматирование номера телефона
     * @param {string} phone - Номер телефона
     * @returns {string}
     */
    function formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
        if (match) {
            return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
        }
        return phone;
    }
    
    /**
     * Валидация формы
     * @param {HTMLFormElement} form - Форма для валидации
     * @returns {boolean}
     */
    function validateForm(form) {
        const name = form.querySelector('input[name="name"]');
        const phone = form.querySelector('input[name="phone"]');
        const service = form.querySelector('select[name="service"]');
        
        if (name && !name.value.trim()) {
            showMessage('Пожалуйста, введите ваше имя', 'error');
            name.focus();
            return false;
        }
        
        if (phone) {
            const phoneValue = phone.value.trim();
            const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
            if (!phoneValue || !phoneRegex.test(phoneValue)) {
                showMessage('Пожалуйста, введите корректный номер телефона', 'error');
                phone.focus();
                return false;
            }
        }
        
        return true;
    }
    
    // ========== Fixed Header ==========
    function handleFixedHeader() {
        if (!$header) return;
        
        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        const introHeight = $intro ? $intro.offsetHeight : 100;
        
        if (scrollPos > introHeight) {
            $header.classList.add('fixed');
        } else {
            $header.classList.remove('fixed');
        }
    }
    
    // ========== Burger Menu ==========
    function initBurgerMenu() {
        if (!$navToggle || !$nav) return;
        
        $navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            $nav.classList.toggle('show');
            this.classList.toggle('active');
            
            const isExpanded = $nav.classList.contains('show');
            this.setAttribute('aria-expanded', isExpanded);
            this.setAttribute('aria-label', isExpanded ? 'Закрыть меню' : 'Открыть меню');
            
            // Блокируем прокрутку при открытом меню
            if (isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Закрываем меню при клике на ссылку
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                $nav.classList.remove('show');
                $navToggle.classList.remove('active');
                $navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
        // Закрываем меню при клике вне его
        document.addEventListener('click', function(e) {
            if ($nav.classList.contains('show') && 
                !$nav.contains(e.target) && 
                !$navToggle.contains(e.target)) {
                $nav.classList.remove('show');
                $navToggle.classList.remove('active');
                $navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ========== Smooth Scroll ==========
    function initSmoothScroll() {
        const links = document.querySelectorAll('[data-scroll], a[href^="#"]:not([href="#"])');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const hash = this.getAttribute('href') || this.getAttribute('data-scroll');
                if (!hash || hash === '#') return;
                
                const targetId = hash.replace('#', '');
                const target = document.getElementById(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = $header && $header.classList.contains('fixed') ? 
                        $header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerHeight - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Обновляем URL без скролла
                    history.pushState(null, null, hash);
                    
                    // Закрываем меню
                    if ($nav && $nav.classList.contains('show')) {
                        $nav.classList.remove('show');
                        $navToggle.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            });
        });
    }
    
    // ========== Scroll Top Button ==========
    function initScrollTop() {
        if (!$scrollTop) return;
        
        function checkScrollTop() {
            const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollPos > 300) {
                $scrollTop.classList.add('show');
            } else {
                $scrollTop.classList.remove('show');
            }
        }
        
        window.addEventListener('scroll', debounce(checkScrollTop, 100));
        checkScrollTop();
        
        $scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ========== Animation on Scroll ==========
    function initScrollAnimation() {
        const animatedElements = document.querySelectorAll('.works__item, .features__item, .team__item');
        
        function checkAnimation() {
            animatedElements.forEach(element => {
                if (!element.classList.contains('animated') && isElementInViewport(element)) {
                    element.classList.add('animated');
                }
            });
        }
        
        window.addEventListener('scroll', debounce(checkAnimation, 100));
        window.addEventListener('resize', debounce(checkAnimation, 100));
        checkAnimation();
    }
    
    // ========== Form Handling ==========
    function initFormHandling() {
        if (!$callbackForm) return;
        
        // Маска для телефона (если есть jQuery Masked Input)
        const phoneInput = $callbackForm.querySelector('input[name="phone"]');
        if (phoneInput && typeof $.fn !== 'undefined' && $.fn.mask) {
            $(phoneInput).mask('+7 (999) 999-99-99');
        } else if (phoneInput) {
            // Fallback: простая маска на чистом JS
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
        $callbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm(this)) return;
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
            
            // Собираем данные
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            data.page = window.location.href;
            data.timestamp = new Date().toISOString();
            
            try {
                // Отправка на сервер (замените на ваш endpoint)
                const response = await fetch('/api/send-form.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    showMessage('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
                    this.reset();
                    
                    // Отправка в Google Analytics / Yandex Metrica
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit', {
                            'event_category': 'callback',
                            'event_label': 'main_page'
                        });
                    }
                    if (typeof ym !== 'undefined') {
                        ym('reachGoal', 'callback_form');
                    }
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showMessage('Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    // ========== Lazy Loading Images ==========
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback для старых браузеров
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    }
    
    // ========== Active Navigation Link ==========
    function initActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav__link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('nav__link--active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
    
    // ========== WebP Support Detection ==========
    function checkWebPSupport() {
        const webp = new Image();
        webp.onload = webp.onerror = function() {
            const isSupported = (webp.height === 2);
            document.documentElement.classList.add(isSupported ? 'webp' : 'no-webp');
        };
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }
    
    // ========== Image Error Handling ==========
    function initImageErrorHandling() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('error', function() {
                const fallbackSrc = '/img/placeholder.jpg';
                if (this.src !== fallbackSrc) {
                    console.warn(`Image failed to load: ${this.src}`);
                    this.src = fallbackSrc;
                }
            });
        });
    }
    
    // ========== Keyboard Navigation ==========
    function initKeyboardNavigation() {
        // Закрытие меню по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && $nav && $nav.classList.contains('show')) {
                $nav.classList.remove('show');
                $navToggle.classList.remove('active');
                $navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
        // Переключение фокуса в меню
        if ($nav) {
            const focusableElements = $nav.querySelectorAll('a, button');
            if (focusableElements.length) {
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];
                
                $nav.addEventListener('keydown', function(e) {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstFocusable) {
                                e.preventDefault();
                                lastFocusable.focus();
                            }
                        } else {
                            if (document.activeElement === lastFocusable) {
                                e.preventDefault();
                                firstFocusable.focus();
                            }
                        }
                    }
                });
            }
        }
    }
    
    // ========== Slick Slider Initialization ==========
    function initSlickSlider() {
        const $reviewsSlider = document.getElementById('reviewsSlider');
        if ($reviewsSlider && typeof $ !== 'undefined' && $.fn.slick) {
            $('#reviewsSlider').slick({
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                arrows: false,
                dots: true,
                autoplay: true,
                autoplaySpeed: 5000,
                pauseOnHover: true,
                speed: 800
            });
        }
    }
    
    // ========== Performance Optimization ==========
    function optimizePerformance() {
        // Пассивные слушатели для улучшения скролла
        window.addEventListener('scroll', handleFixedHeader, { passive: true });
        window.addEventListener('resize', debounce(handleFixedHeader, 150));
        
        // Удаляем неиспользуемые классы
        const body = document.body;
        if (body.classList.contains('no-js')) {
            body.classList.remove('no-js');
        }
    }
    
    // ========== Console Warnings (Development) ==========
    function initDevWarnings() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('%cАльтаир Недвижимость', 'color: #ffd000; font-size: 16px; font-weight: bold;');
            console.log('%cСайт работает в режиме разработки', 'color: #6c7279;');
            console.log('Проверьте все ссылки и формы перед публикацией.');
        }
    }
    
    // ========== Initialize All ==========
    function init() {
        // Базовая инициализация
        handleFixedHeader();
        initBurgerMenu();
        initSmoothScroll();
        initScrollTop();
        initScrollAnimation();
        initFormHandling();
        initActiveNavLink();
        
        // Оптимизации
        initLazyLoading();
        checkWebPSupport();
        initImageErrorHandling();
        initKeyboardNavigation();
        initSlickSlider();
        optimizePerformance();
        
        // Dev режим
        initDevWarnings();
        
        // Экспорт для отладки
        if (window.location.hostname === 'localhost') {
            window.debug = {
                showMessage,
                validateForm,
                formatPhoneNumber
            };
        }
        
        console.log('Сайт успешно загружен');
    }
    
    // Запуск после полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// ========== Additional jQuery Compatibility ==========
if (typeof jQuery !== 'undefined') {
    $(document).ready(function() {
        // Дополнительная инициализация для jQuery плагинов
        if (typeof $.fn.mask !== 'undefined') {
            $('input[name="phone"]').mask('+7 (999) 999-99-99');
        }
        
        // Анимация для элементов с data-aos
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100
            });
        }
    });
}

// ========== Service Worker Registration (Optional) ==========
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// ========== Export for Modules (if needed) ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showMessage,
        validateForm,
        formatPhoneNumber
    };
}