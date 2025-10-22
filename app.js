$(function() {
    const $header = $("#header");
    const $intro = $("#intro");
    const $nav = $("#nav");
    const $navToggle = $("#navToggle");

    // Функция проверки прокрутки для фиксированного хедера
    function checkScroll() {
        const scrollPos = $(window).scrollTop();
        const introHeight = $intro.innerHeight();

        if(scrollPos > introHeight) {
            $header.addClass("fixed");
        } else {
            $header.removeClass("fixed");
        }
    }

    checkScroll();

    // Отслеживание прокрутки и изменения размера окна
    $(window).on("scroll resize", checkScroll);

    // Плавный скролл по элементам с атрибутом data-scroll
    $("[data-scroll]").on("click", function(e) {
        e.preventDefault();
        const targetId = $(this).data("scroll");
        if(!targetId) return;

        const $target = $(targetId);
        if(!$target.length) return;

        const offsetTop = $target.offset().top - $header.outerHeight();

        $nav.removeClass("show");

        $("html, body").animate({scrollTop: offsetTop}, 700);
    });

    // Переключатель мобильного меню
    $navToggle.on("click", function(e) {
        e.preventDefault();
        $nav.toggleClass("show");
        $(this).toggleClass("active");
    });

    // Инициализация слайдера отзывов
    const $slider = $("#reviewsSlider");
    if($slider.length) {
        $slider.slick({
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            arrows: false,
            dots: true
        });
    }
});
