(function() {
    'use strict';

    // Проверяем, загружена ли страница контактов
    if (!document.querySelector('.contact-info-section, .map-section, .callback-section')) {
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

    // ========== DOM Elements ==========
    const contactCards = document.querySelectorAll('.contact-card');
    const callbackForm = document.getElementById('callbackForm');
    const mapFrame = document.querySelector('.map-wrapper iframe');
    const socialLinks = document.querySelectorAll('.social-link');
    
    // ========== Card Animations on Scroll ==========
    function initCardAnimations() {
        contactCards.forEach((card, index) => {
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
        contactCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.contact-card__icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1.1)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.contact-card__icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1)';
                }
            });
        });
    }
    
    // ========== Phone Number Click (копирование) ==========
    function initPhoneCopy() {
        const phoneNumbers = document.querySelectorAll('a[href^="tel:"]');
        
        phoneNumbers.forEach(phone => {
            phone.addEventListener('click', function(e) {
                // Не предотвращаем стандартное поведение, просто копируем дополнительно
                const phoneNumber = this.getAttribute('href').replace('tel:', '');
                
                navigator.clipboard.writeText(phoneNumber).then(() => {
                    if (window.showMessage) {
                        window.showMessage('Номер телефона скопирован', 'success');
                    }
                }).catch(() => {
                    // Fallback
                    const textArea = document.createElement('textarea');
                    textArea.value = phoneNumber;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    if (window.showMessage) {
                        window.showMessage('Номер телефона скопирован', 'success');
                    }
                });
            });
        });
    }
    
    // ========== Email Click (аналитика) ==========
    function initEmailTracking() {
        const emails = document.querySelectorAll('a[href^="mailto:"]');
        
        emails.forEach(email => {
            email.addEventListener('click', function() {
                // Отправка в аналитику
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'email_click', {
                        'event_category': 'contact',
                        'event_label': this.getAttribute('href')
                    });
                }
                if (typeof ym !== 'undefined') {
                    ym('reachGoal', 'email_click');
                }
            });
        });
    }
    
    // ========== Social Links Click (аналитика) ==========
    function initSocialTracking() {
        socialLinks.forEach(link => {
            link.addEventListener('click', function() {
                const socialName = this.querySelector('span')?.textContent || 'unknown';
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'social_click', {
                        'event_category': 'social',
                        'event_label': socialName
                    });
                }
                if (typeof ym !== 'undefined') {
                    ym('reachGoal', 'social_click', socialName);
                }
            });
        });
    }
    
    // ========== Form Handling ==========
    function initFormHandling() {
        if (!callbackForm) return;
        
        // Маска для телефона
        const phoneInput = callbackForm.querySelector('input[name="phone"]');
        if (phoneInput && typeof $.fn !== 'undefined' && $.fn.mask) {
            $(phoneInput).mask('+7 (999) 999-99-99');
        } else if (phoneInput) {
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
        
        // Валидация email
        const emailInput = callbackForm.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
                if (email && !emailRegex.test(email)) {
                    this.style.borderColor = '#dc3545';
                } else {
                    this.style.borderColor = '#e0e0e0';
                }
            });
        }
        
        // Отправка формы
        callbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Валидация
            const name = this.querySelector('input[name="name"]').value.trim();
            const phone = this.querySelector('input[name="phone"]').value.trim();
            const message = this.querySelector('textarea[name="message"]').value.trim();
            
            if (!name) {
                if (window.showMessage) window.showMessage('Введите ваше имя', 'error');
                return;
            }
            
            if (!phone || phone === '+7 (___) ___-__-__') {
                if (window.showMessage) window.showMessage('Введите номер телефона', 'error');
                return;
            }
            
            if (!message) {
                if (window.showMessage) window.showMessage('Введите сообщение', 'error');
                return;
            }
            
            // Валидация email если заполнен
            const email = this.querySelector('input[name="email"]').value.trim();
            if (email) {
                const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    if (window.showMessage) window.showMessage('Введите корректный email', 'error');
                    return;
                }
            }
            
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
                // Имитация отправки (замените на реальный endpoint)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (window.showMessage) {
                    window.showMessage('Спасибо! Мы свяжемся с вами в ближайшее время.', 'success');
                }
                this.reset();
                
                // Отправка в аналитику
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'contact',
                        'event_label': 'contacts_page'
                    });
                }
                if (typeof ym !== 'undefined') {
                    ym('reachGoal', 'contact_form');
                }
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
    
    // ========== Map Lazy Load ==========
    function initMapLazyLoad() {
        if (!mapFrame) return;
        
        // Загружаем карту только когда она видна
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    const src = iframe.getAttribute('data-src');
                    if (src) {
                        iframe.src = src;
                        iframe.removeAttribute('data-src');
                    }
                    observer.unobserve(iframe);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(mapFrame);
    }
    
    // ========== Smooth Scroll for Anchors ==========
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
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ========== Map Widget Refresh (для мобильных) ==========
    function initMapRefresh() {
        const mapWidget = document.querySelector('.map-wrapper iframe');
        if (!mapWidget) return;
        
        // На мобильных устройствах обновляем карту при повороте экрана
        let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            let mapSrc = mapWidget.src;
            
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    mapWidget.src = mapSrc;
                }, 100);
            });
        }
    }
    
    // ========== Copy Address Function ==========
    function initCopyAddress() {
        const addressElement = document.querySelector('.contact-card:first-child p');
        const addressButton = document.createElement('button');
        
        if (addressElement && addressElement.textContent) {
            addressButton.textContent = 'Скопировать адрес';
            addressButton.className = 'copy-address-btn';
            addressButton.style.cssText = `
                background: none;
                border: none;
                color: #ffd000;
                cursor: pointer;
                font-size: 0.8rem;
                margin-top: 5px;
                padding: 0;
                display: inline-block;
            `;
            
            addressButton.addEventListener('click', function() {
                const address = addressElement.textContent.trim();
                navigator.clipboard.writeText(address).then(() => {
                    if (window.showMessage) {
                        window.showMessage('Адрес скопирован', 'success');
                    }
                }).catch(() => {
                    if (window.showMessage) {
                        window.showMessage('Не удалось скопировать адрес', 'error');
                    }
                });
            });
            
            addressElement.parentNode.appendChild(addressButton);
        }
    }
    
    // ========== Scroll Reveal Animation ==========
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.page-header__content, .section__header, .social-content');
        
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
    
    // ========== Fix Missing Images ==========
    function fixMissingImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            img.addEventListener('error', function() {
                console.warn('Image not found:', this.src);
                // Не показываем ошибку пользователю
            });
        });
    }
    
    // ========== Initialize All ==========
    function init() {
        console.log('Инициализация страницы контактов...');
        
        // Инициализация анимаций
        initCardAnimations();
        initScrollReveal();
        
        // Инициализация эффектов
        initCardHoverEffects();
        
        // Инициализация кнопок и ссылок
        initPhoneCopy();
        initEmailTracking();
        initSocialTracking();
        initCopyAddress();
        
        // Инициализация формы
        initFormHandling();
        
        // Инициализация карты
        initMapLazyLoad();
        initMapRefresh();
        
        // Инициализация скролла
        initSmoothScroll();
        
        // Исправление изображений
        fixMissingImages();
        
        // Подсчет элементов
        const totalCards = contactCards.length;
        const totalSocial = socialLinks.length;
        
        console.log(`Загружено: ${totalCards} контактных карточек, ${totalSocial} социальных ссылок`);
    }
    
    // Запуск после загрузки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();