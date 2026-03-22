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
    
    function showMessage(text, type = 'info') {
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = `message-toast message-toast--${type}`;
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
        
        message.addEventListener('click', () => {
            message.classList.remove('show');
            setTimeout(() => {
                message.remove();
            }, 300);
        });
    }
    
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
    
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight - 100 && rect.bottom >= 100;
    }
    
    function formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
        if (match) {
            return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
        }
        return phone;
    }
    
    function validateForm(form) {
        const name = form.querySelector('input[name="name"]');
        const phone = form.querySelector('input[name="phone"]');
        
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
            
            if (isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                $nav.classList.remove('show');
                $navToggle.classList.remove('active');
                $navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
        
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
                    
                    history.pushState(null, null, hash);
                    
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
        const animatedElements = document.querySelectorAll('.works__item, .features__item, .team__item, .service-card, .advantage-card, .team-card');
        
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
    // ========== Mobile Touch Handling for Works Cards ==========
function initMobileTouchWorks() {
    const worksCards = document.querySelectorAll('.works__item');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) return; // Только для мобильных
    
    let touchTimer = null;
    let currentCard = null;
    
    worksCards.forEach(card => {
        // Первое касание — показывает информацию
        card.addEventListener('touchstart', function(e) {
            e.preventDefault();
            
            // Убираем выделение со всех карточек
            worksCards.forEach(c => c.classList.remove('touched'));
            
            // Добавляем выделение текущей
            this.classList.add('touched');
            currentCard = this;
            
            // Устанавливаем таймер для перехода
            touchTimer = setTimeout(() => {
                if (currentCard && currentCard.classList.contains('touched')) {
                    const href = currentCard.getAttribute('href');
                    if (href && href !== '#') {
                        window.location.href = href;
                    }
                }
                touchTimer = null;
            }, 500);
        });
        
        // Отмена таймера при touchend (если не было повторного касания)
        card.addEventListener('touchend', function(e) {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });
        
        // Отмена при движении пальца
        card.addEventListener('touchmove', function(e) {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });
    });
    
    // Клик вне карточки — убираем выделение
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.works__item')) {
            worksCards.forEach(card => card.classList.remove('touched'));
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        }
    });
}
    // ========== Form Handling ==========
    function initFormHandling() {
        const callbackForm = document.getElementById('callbackForm');
        if (!callbackForm) return;
        
        // Маска для телефона (чистый JS)
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
                
                if (window.showMessage) {
                    window.showMessage('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
                }
                this.reset();
            } catch (error) {
                console.error('Form submission error:', error);
                if (window.showMessage) {
                    window.showMessage('Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
                }
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
                const fallbackSrc = 'img/placeholder.jpg';
                if (this.src !== fallbackSrc && !this.src.includes(fallbackSrc)) {
                    console.warn(`Image failed to load: ${this.src}`);
                    this.src = fallbackSrc;
                }
            });
        });
    }
    
    // ========== Keyboard Navigation ==========
    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && $nav && $nav.classList.contains('show')) {
                $nav.classList.remove('show');
                $navToggle.classList.remove('active');
                $navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
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
    
    // ========== Performance Optimization ==========
    function optimizePerformance() {
        window.addEventListener('scroll', handleFixedHeader, { passive: true });
        window.addEventListener('resize', debounce(handleFixedHeader, 150));
        
        const body = document.body;
        if (body.classList.contains('no-js')) {
            body.classList.remove('no-js');
        }
    }
    
   
    // ========== Initialize All ==========
    function init() {
        handleFixedHeader();
        initBurgerMenu();
        initSmoothScroll();
        initScrollTop();
        initScrollAnimation();
        initFormHandling();
        initActiveNavLink();
        initMobileTouchWorks();
        
        initLazyLoading();
        checkWebPSupport();
        initImageErrorHandling();
        initKeyboardNavigation();
        optimizePerformance();
        
        
        if (window.location.hostname === 'localhost') {
            window.debug = {
                showMessage,
                validateForm,
                formatPhoneNumber
            };
        }
        
        console.log('Сайт успешно загружен');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

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