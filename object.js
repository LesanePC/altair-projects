(function() {
    'use strict';

    // Проверяем, загружена ли страница объектов
    if (!document.querySelector('.properties-grid, .property-card')) {
        return; // Если это не страница объектов, выходим
    }

    // ========== DOM Elements ==========
    const categoryBtns = document.querySelectorAll('.category-btn');
    const propertyCards = document.querySelectorAll('.property-card');
    const noResults = document.getElementById('noResults');
    const showAllBtn = document.getElementById('showAllBtn');
    const contactBtns = document.querySelectorAll('.contact-btn');
    const favoriteBtns = document.querySelectorAll('.btn-favorite');

    // ========== Filter Functions ==========
    function filterProperties(target) {
        let visibleCount = 0;
        
        propertyCards.forEach(card => {
            if (target === 'all' || card.dataset.type === target) {
                card.style.display = 'block';
                visibleCount++;
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем/скрываем сообщение "Ничего не найдено"
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
        
        // Обновляем URL параметр (опционально)
        updateURLParameter('category', target);
    }
    
    // Обновление URL без перезагрузки страницы
    function updateURLParameter(param, value) {
        const url = new URL(window.location);
        if (value === 'all') {
            url.searchParams.delete(param);
        } else {
            url.searchParams.set(param, value);
        }
        window.history.replaceState({}, '', url);
    }
    
    // Получение параметра из URL
    function getURLParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // ========== Gallery Functions ==========
    function initGallery(card) {
        const slides = card.querySelectorAll('.gallery-slide');
        const thumbs = card.querySelectorAll('.gallery-thumb');
        const prevBtn = card.querySelector('.gallery-prev');
        const nextBtn = card.querySelector('.gallery-next');
        
        if (!slides.length) return;
        
        let currentIndex = 0;
        
        function updateGallery(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            thumbs.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }
        
        // Инициализация миниатюр
        if (thumbs.length) {
            thumbs.forEach((thumb, idx) => {
                thumb.addEventListener('click', () => updateGallery(idx));
            });
        }
        
        // Навигация "Назад"
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = slides.length - 1;
                updateGallery(newIndex);
            });
        }
        
        // Навигация "Вперед"
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= slides.length) newIndex = 0;
                updateGallery(newIndex);
            });
        }
        
        // Активируем первый слайд
        updateGallery(0);
    }

    // ========== Favorite Functions (с localStorage) ==========
    function initFavorites() {
        // Загружаем сохраненные избранные объекты
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        favoriteBtns.forEach((btn, index) => {
            const card = btn.closest('.property-card');
            const propertyId = card?.dataset.id || `property_${index}`;
            
            // Восстанавливаем состояние из localStorage
            if (savedFavorites.includes(propertyId)) {
                btn.classList.add('active');
                const icon = btn.querySelector('svg');
                if (icon) icon.style.fill = '#ffd000';
            }
            
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
                
                const icon = this.querySelector('svg');
                if (this.classList.contains('active')) {
                    if (icon) icon.style.fill = '#ffd000';
                    addToFavorites(propertyId);
                    if (window.showMessage) {
                        window.showMessage('Добавлено в избранное', 'success');
                    }
                } else {
                    if (icon) icon.style.fill = 'none';
                    removeFromFavorites(propertyId);
                    if (window.showMessage) {
                        window.showMessage('Удалено из избранного', 'info');
                    }
                }
            });
        });
    }
    
    function addToFavorites(id) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (!favorites.includes(id)) {
            favorites.push(id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    }
    
    function removeFromFavorites(id) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites = favorites.filter(favId => favId !== id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // ========== Contact Buttons ==========
    function initContactButtons() {
        contactBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyName = this.dataset.property || 
                                   this.closest('.property-card')?.querySelector('.property-card__title')?.textContent || 
                                   'объект';
                
                // Прокручиваем к форме обратной связи
                const callbackSection = document.querySelector('.callback-section');
                if (callbackSection) {
                    callbackSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Опционально: заполняем скрытое поле с сообщением
                    const messageField = document.getElementById('message');
                    if (messageField) {
                        messageField.value = `Здравствуйте! Меня интересует ${propertyName}`;
                    }
                }
            });
        });
    }

    // ========== Search Function (опционально) ==========
    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            let visibleCount = 0;
            
            propertyCards.forEach(card => {
                const title = card.querySelector('.property-card__title')?.textContent.toLowerCase() || '';
                const address = card.querySelector('.property-card__address')?.textContent.toLowerCase() || '';
                const description = card.querySelector('.property-card__description')?.textContent.toLowerCase() || '';
                
                const matches = title.includes(searchTerm) || 
                               address.includes(searchTerm) || 
                               description.includes(searchTerm);
                
                card.style.display = matches ? 'block' : 'none';
                if (matches) visibleCount++;
            });
            
            // Показываем сообщение если ничего не найдено
            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }

    // ========== Initialize from URL ==========
    function initFromURL() {
        const categoryParam = getURLParameter('category');
        if (categoryParam && categoryParam !== 'all') {
            const targetBtn = Array.from(categoryBtns).find(btn => btn.dataset.target === categoryParam);
            if (targetBtn) {
                categoryBtns.forEach(btn => btn.classList.remove('active'));
                targetBtn.classList.add('active');
                filterProperties(categoryParam);
            }
        }
    }

    // ========== Reset Filters ==========
    function initResetFilters() {
        const resetBtn = document.getElementById('resetFilters');
        if (!resetBtn) return;
        
        resetBtn.addEventListener('click', () => {
            // Сброс категорий
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            const allBtn = document.querySelector('.category-btn[data-target="all"]');
            if (allBtn) allBtn.classList.add('active');
            filterProperties('all');
            
            // Сброс поиска
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            
            // Сброс цены (если есть)
            const priceFrom = document.getElementById('priceFrom');
            const priceTo = document.getElementById('priceTo');
            if (priceFrom) priceFrom.value = '';
            if (priceTo) priceTo.value = '';
            
            // Показываем все карточки
            propertyCards.forEach(card => card.style.display = 'block');
            if (noResults) noResults.style.display = 'none';
            
            if (window.showMessage) {
                window.showMessage('Фильтры сброшены', 'info');
            }
        });
    }

    // ========== Event Listeners ==========
    function initEventListeners() {
        // Фильтрация по категориям
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const target = this.dataset.target;
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterProperties(target);
            });
        });
        
        // Кнопка "Показать все"
        if (showAllBtn) {
            showAllBtn.addEventListener('click', function() {
                categoryBtns.forEach(btn => btn.classList.remove('active'));
                const allBtn = document.querySelector('.category-btn[data-target="all"]');
                if (allBtn) allBtn.classList.add('active');
                filterProperties('all');
            });
        }
    }

    // ========== Initialize All ==========
    function init() {
        console.log('Инициализация страницы объектов...');
        
        // Инициализация событий
        initEventListeners();
        
        // Инициализация галерей
        propertyCards.forEach(card => initGallery(card));
        
        // Инициализация дополнительных функций
        initFavorites();
        initContactButtons();
        initSearch();
        initResetFilters();
        initFromURL();
        
        console.log(`Загружено ${propertyCards.length} объектов`);
    }
    
    // Запуск после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();