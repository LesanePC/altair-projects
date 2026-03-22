(function() {
    'use strict';

    // Проверяем, загружена ли страница услуг
    if (!document.querySelector('.services-grid, .services-grid-section, .service-card')) {
        return; // Если это не страница услуг, выходим
    }

    // ========== DOM Elements ==========
    const serviceCards = document.querySelectorAll('.service-card');
    const legalCards = document.querySelectorAll('.legal-card');
    const contactBtns = document.querySelectorAll('.contact-service-btn');
    const achievementItems = document.querySelectorAll('.achievement-number');
    const callbackForm = document.getElementById('callbackForm');
    
    // ========== Counter Animation (для достижений) ==========
    function initCounters() {
        if (!achievementItems.length) return;
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const isPercentage = counter.textContent.includes('%');
                    let current = 0;
                    
                    const updateCounter = () => {
                        const increment = target / 50;
                        if (current < target) {
                            current += increment;
                            if (isPercentage) {
                                counter.textContent = Math.ceil(current) + '%';
                            } else {
                                counter.textContent = Math.ceil(current);
                            }
                            setTimeout(updateCounter, 30);
                        } else {
                            if (isPercentage) {
                                counter.textContent = target + '%';
                            } else {
                                counter.textContent = target + '+';
                            }
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        achievementItems.forEach(counter => observer.observe(counter));
    }
    
    // ========== Service Card Animations ==========
    function initServiceCardsAnimation() {
        const allCards = [...serviceCards, ...legalCards];
        
        allCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.5s ease ${index * 0.05}s`;
            
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
        const allCards = [...serviceCards, ...legalCards];
        
        allCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const btn = this.querySelector('.btn');
                if (btn) {
                    btn.style.transform = 'translateX(5px)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const btn = this.querySelector('.btn');
                if (btn) {
                    btn.style.transform = 'translateX(0)';
                }
            });
        });
    }
    
    // ========== Contact Buttons ==========
    function initContactButtons() {
        if (!contactBtns.length) return;
        
        contactBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Получаем название услуги
                let serviceName = '';
                const card = this.closest('.service-card, .legal-card');
                
                if (card) {
                    const titleElement = card.querySelector('.service-card__title, .legal-card__title');
                    serviceName = titleElement ? titleElement.textContent.trim() : 'услугу';
                } else if (this.dataset.service) {
                    serviceName = this.dataset.service;
                }
                
                // Прокручиваем к форме обратной связи
                const callbackSection = document.querySelector('.callback-section');
                if (callbackSection) {
                    callbackSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Заполняем поле с услугой в форме
                    const serviceSelect = document.querySelector('select[name="service"]');
                    if (serviceSelect) {
                        // Находим соответствующий option
                        const optionMap = {
                            'Продажа': 'sale',
                            'Купить': 'buy',
                            'Покупка': 'buy',
                            'Снять': 'rent',
                            'Сдать': 'rent',
                            'Аренда': 'rent',
                            'Ипотека': 'mortgage',
                            'Новостройки': 'newbuilding',
                            'Перепланировка': 'redevelopment',
                            'Юридическая': 'legal',
                            'Регистрация': 'legal',
                            'Оформление': 'legal'
                        };
                        
                        let optionValue = '';
                        for (const [key, value] of Object.entries(optionMap)) {
                            if (serviceName.includes(key)) {
                                optionValue = value;
                                break;
                            }
                        }
                        
                        if (optionValue) {
                            serviceSelect.value = optionValue;
                        }
                    }
                    
                    // Показываем сообщение
                    if (window.showMessage) {
                        window.showMessage(`Вы выбрали услугу "${serviceName}". Заполните форму ниже`, 'info');
                    }
                } else {
                    // Если нет формы, показываем телефон
                    if (window.showMessage) {
                        window.showMessage(`Свяжитесь с нами по телефону: +7 (916) 817-47-88`, 'info');
                    }
                }
            });
        });
    }
    
    // ========== Phone Number Click (копирование) ==========
    function initPhoneCopy() {
        const phoneNumbers = document.querySelectorAll('.footer__address a[href^="tel:"], .services-intro__contacts .btn-outline');
        
        phoneNumbers.forEach(phone => {
            phone.addEventListener('click', function(e) {
                e.preventDefault();
                
                const phoneNumber = this.getAttribute('href')?.replace('tel:', '') || '+7 (916) 817-47-88';
                const cleanNumber = phoneNumber.replace(/\D/g, '');
                
                navigator.clipboard.writeText(phoneNumber).then(() => {
                    if (window.showMessage) {
                        window.showMessage('Номер телефона скопирован в буфер обмена', 'success');
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
    
    // ========== Read More / Read Less ==========
    function initReadMore() {
        const descriptions = document.querySelectorAll('.service-card__description, .legal-card__description');
        
        descriptions.forEach(desc => {
            const text = desc.textContent.trim();
            const maxLength = 120;
            
            if (text.length > maxLength) {
                const originalText = text;
                const truncatedText = text.substring(0, maxLength) + '...';
                
                desc.textContent = truncatedText;
                
                const readMoreBtn = document.createElement('button');
                readMoreBtn.textContent = 'Читать далее';
                readMoreBtn.className = 'read-more-btn';
                readMoreBtn.setAttribute('aria-label', 'Развернуть описание');
                
                let isExpanded = false;
                
                readMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isExpanded) {
                        desc.textContent = truncatedText;
                        readMoreBtn.textContent = 'Читать далее';
                    } else {
                        desc.textContent = originalText;
                        readMoreBtn.textContent = 'Свернуть';
                    }
                    isExpanded = !isExpanded;
                });
                
                desc.parentNode.insertBefore(readMoreBtn, desc.nextSibling);
            }
        });
    }
    
    // ========== Service Filter (если нужно) ==========
    function initServiceFilter() {
        const filterBtns = document.querySelectorAll('.service-filter-btn');
        if (!filterBtns.length) return;
        
        const allCards = [...serviceCards, ...legalCards];
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                
                // Обновляем активный класс
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Фильтруем карточки
                let visibleCount = 0;
                allCards.forEach(card => {
                    const cardType = card.dataset.service || 
                                    (card.classList.contains('service-card') ? 'main' : 'legal');
                    
                    if (category === 'all' || cardType === category) {
                        card.style.display = 'block';
                        visibleCount++;
                        card.style.animation = 'fadeInUp 0.5s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Показываем сообщение, если нет результатов
                const noResults = document.getElementById('noResults');
                if (noResults) {
                    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
                }
            });
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
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Обновляем URL
                    history.pushState(null, null, hash);
                }
            });
        });
    }
    
    // ========== Modal for Service Details (опционально) ==========
    function initServiceModal() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        if (!modalTriggers.length) return;
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', function() {
                const modalId = this.dataset.modal;
                const modal = document.getElementById(modalId);
                
                if (modal) {
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                    
                    // Закрытие по клику на фон
                    modal.addEventListener('click', function(e) {
                        if (e.target === modal) {
                            closeModal(modal);
                        }
                    });
                    
                    // Закрытие по ESC
                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Escape') {
                            closeModal(modal);
                        }
                    });
                }
            });
        });
        
        function closeModal(modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
        
        // Кнопки закрытия
        const closeBtns = document.querySelectorAll('.modal-close');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) closeModal(modal);
            });
        });
    }
    
    // ========== Add Callback Form if not exists ==========
    function ensureCallbackForm() {
        const callbackSection = document.querySelector('.callback-section');
        if (!callbackSection) {
            // Если нет формы обратной связи, создаем её
            const main = document.querySelector('main') || document.body;
            const callbackHTML = `
                <section class="callback-section" id="callback">
                    <div class="container">
                        <div class="callback__inner">
                            <h2 class="callback__title">Нужна консультация?</h2>
                            <p class="callback__description">Оставьте заявку и мы перезвоним в течение 15 минут</p>
                            
                            <form class="callback__form" id="callbackForm">
                                <div class="form-group">
                                    <input type="text" class="form-control" name="name" placeholder="Ваше имя" required>
                                </div>
                                <div class="form-group">
                                    <input type="tel" class="form-control" name="phone" placeholder="+7 (___) ___-__-__" required>
                                </div>
                                <div class="form-group">
                                    <select class="form-control" name="service">
                                        <option value="">Выберите услугу</option>
                                        <option value="sale">Продажа недвижимости</option>
                                        <option value="buy">Покупка недвижимости</option>
                                        <option value="rent">Аренда</option>
                                        <option value="legal">Юридические услуги</option>
                                        <option value="mortgage">Ипотека</option>
                                        <option value="newbuilding">Новостройки</option>
                                        <option value="redevelopment">Перепланировка</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">Отправить заявку</button>
                                <p class="callback__agree">
                                    Нажимая кнопку, вы соглашаетесь с 
                                    <a href="privacy.html">политикой обработки персональных данных</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </section>
            `;
            
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.insertAdjacentHTML('beforebegin', callbackHTML);
            } else {
                main.insertAdjacentHTML('beforeend', callbackHTML);
            }
        }
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
    
    // ========== Animate on Scroll ==========
    function initAOS() {
        const animatedElements = document.querySelectorAll('.service-card, .legal-card, .advantage-item, .achievement-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(el => observer.observe(el));
    }
    
    // ========== Initialize All ==========
    function init() {
        console.log('Инициализация страницы услуг...');
        
        // Убеждаемся, что форма обратной связи есть
        ensureCallbackForm();
        
        // Инициализация анимаций
        initServiceCardsAnimation();
        initCounters();
        initAOS();
        
        // Инициализация эффектов
        initCardHoverEffects();
        
        // Инициализация кнопок
        initContactButtons();
        initPhoneCopy();
        
        // Инициализация дополнительных функций
        initReadMore();
        initServiceFilter();
        initServiceModal();
        initSmoothScroll();
        initFormHandling();
        
        console.log(`Загружено ${serviceCards.length} основных услуг и ${legalCards.length} юридических услуг`);
    }
    
    // Запуск после полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();