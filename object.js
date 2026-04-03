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

    // ========== Helper Functions ==========
    function showMessage(text, type = 'info') {
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
    }

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
        
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
        
        updateURLParameter('category', target);
    }
    
    function updateURLParameter(param, value) {
        const url = new URL(window.location);
        if (value === 'all') {
            url.searchParams.delete(param);
        } else {
            url.searchParams.set(param, value);
        }
        window.history.replaceState({}, '', url);
    }
    
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
        
        if (thumbs.length) {
            thumbs.forEach((thumb, idx) => {
                thumb.addEventListener('click', () => updateGallery(idx));
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = slides.length - 1;
                updateGallery(newIndex);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= slides.length) newIndex = 0;
                updateGallery(newIndex);
            });
        }
        
        updateGallery(0);
    }

    // ========== Favorite Functions (localStorage) ==========
    function initFavorites() {
        const savedFavorites = JSON.parse(localStorage.getItem('altair_favorites') || '[]');
        
        favoriteBtns.forEach((btn, index) => {
            const card = btn.closest('.property-card');
            const propertyId = card?.dataset.id || `property_${index}`;
            
            if (savedFavorites.includes(propertyId)) {
                btn.classList.add('active');
                const icon = btn.querySelector('svg');
                if (icon) icon.style.fill = '#ffd000';
            }
            
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                this.classList.toggle('active');
                
                const icon = this.querySelector('svg');
                let favorites = JSON.parse(localStorage.getItem('altair_favorites') || '[]');
                
                if (this.classList.contains('active')) {
                    if (icon) icon.style.fill = '#ffd000';
                    if (!favorites.includes(propertyId)) {
                        favorites.push(propertyId);
                        localStorage.setItem('altair_favorites', JSON.stringify(favorites));
                    }
                    showMessage('Добавлено в избранное', 'success');
                } else {
                    if (icon) icon.style.fill = 'none';
                    favorites = favorites.filter(id => id !== propertyId);
                    localStorage.setItem('altair_favorites', JSON.stringify(favorites));
                    showMessage('Удалено из избранного', 'info');
                }
            });
        });
    }

    // ========== Contact Buttons ==========
    function initContactButtons() {
        contactBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyName = this.dataset.property || 
                                   this.closest('.property-card')?.querySelector('.property-card__title')?.textContent || 
                                   'объект';
                
                const callbackSection = document.querySelector('.callback-section');
                if (callbackSection) {
                    callbackSection.scrollIntoView({ behavior: 'smooth' });
                    const messageField = document.getElementById('message');
                    if (messageField) {
                        messageField.value = `Здравствуйте! Меня интересует ${propertyName}`;
                    }
                }
            });
        });
    }

    // ========== Search Function ==========
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
            
            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }

    // ========== Price Filter (опционально) ==========
    function initPriceFilter() {
        const priceFrom = document.getElementById('priceFrom');
        const priceTo = document.getElementById('priceTo');
        if (!priceFrom && !priceTo) return;
        
        function filterByPrice() {
            const from = parseInt(priceFrom?.value) || 0;
            const to = parseInt(priceTo?.value) || Infinity;
            let visibleCount = 0;
            
            propertyCards.forEach(card => {
                const priceElement = card.querySelector('.property-card__price');
                if (!priceElement) return;
                
                const price = parseInt(priceElement.textContent.replace(/[^0-9]/g, ''));
                const matches = price >= from && price <= to;
                
                card.style.display = matches ? 'block' : 'none';
                if (matches) visibleCount++;
            });
            
            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        }
        
        if (priceFrom) priceFrom.addEventListener('input', filterByPrice);
        if (priceTo) priceTo.addEventListener('input', filterByPrice);
    }

    // ========== Reset Filters ==========
    function initResetFilters() {
        const resetBtn = document.getElementById('resetFilters');
        if (!resetBtn) return;
        
        resetBtn.addEventListener('click', () => {
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            const allBtn = document.querySelector('.category-btn[data-target="all"]');
            if (allBtn) allBtn.classList.add('active');
            filterProperties('all');
            
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            
            const priceFrom = document.getElementById('priceFrom');
            const priceTo = document.getElementById('priceTo');
            if (priceFrom) priceFrom.value = '';
            if (priceTo) priceTo.value = '';
            
            propertyCards.forEach(card => card.style.display = 'block');
            if (noResults) noResults.style.display = 'none';
            
            showMessage('Фильтры сброшены', 'info');
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

    // ========== Event Listeners ==========
    function initEventListeners() {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const target = this.dataset.target;
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterProperties(target);
            });
        });
        
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
        
        initEventListeners();
        propertyCards.forEach(card => initGallery(card));
        initFavorites();
        initContactButtons();
        initSearch();
        initPriceFilter();
        initResetFilters();
        initFromURL();
        
        console.log(`Загружено ${propertyCards.length} объектов`);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();