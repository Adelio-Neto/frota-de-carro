document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll(".testimonials-carousel.swiper")
    .forEach(function (swiperContainer) {
      new Swiper(swiperContainer, {
        loop: true,
        speed: 700,
        slidesPerView: 1,
        spaceBetween: 24,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        pagination: {
          el: swiperContainer.querySelector(".swiper-pagination"),
          clickable: true,
        },
        breakpoints: {
          768: { slidesPerView: 2 },
        },
      });
    });
});
