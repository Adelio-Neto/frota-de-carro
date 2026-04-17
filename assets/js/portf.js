(function () {
  /* ── Tabs ── */
  const tabs = document.querySelectorAll("#rsTabs .rs-tab");
  const panels = document.querySelectorAll(".rs-content .rs-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("filter-active"));
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("filter-active");

      const panel = document.querySelector(
        `.rs-content .rs-panel[data-panel="${target}"]`,
      );
      if (!panel) return;
      panel.classList.add("active");

      const cf = panel.querySelector("[data-coverflow]");
      if (!cf) return;
      requestAnimationFrame(() => {
        cf._cfGoTo ? cf._cfGoTo(0) : initCoverflow(cf);
      });
    });
  });

  /* ── Lightbox ── */
  let lb = null;
  let lbSlides = [];
  let lbIndex = 0;

  function createLightbox() {
    if (lb) return;

    lb = document.createElement("div");
    lb.className = "cf-lightbox";
    lb.innerHTML = `
      <div class="cf-lightbox-inner">
        <button class="cf-lightbox-close" aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button class="cf-lightbox-prev" aria-label="Anterior">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <img src="" alt="Imagem ampliada">
        <button class="cf-lightbox-next" aria-label="Seguinte">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <span class="cf-lightbox-counter"></span>
      </div>`;

    document.body.appendChild(lb);

    lb.querySelector(".cf-lightbox-close").addEventListener(
      "click",
      closeLightbox,
    );
    lb.querySelector(".cf-lightbox-prev").addEventListener("click", () =>
      lbGoTo(lbIndex - 1),
    );
    lb.querySelector(".cf-lightbox-next").addEventListener("click", () =>
      lbGoTo(lbIndex + 1),
    );

    // Fechar ao clicar no fundo
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLightbox();
    });

    // Teclado
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lbGoTo(lbIndex - 1);
      if (e.key === "ArrowRight") lbGoTo(lbIndex + 1);
    });
  }

  function openLightbox(slides, index) {
    createLightbox();
    lbSlides = slides;
    lbGoTo(index);
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function lbGoTo(i) {
    const total = lbSlides.length;
    lbIndex = ((i % total) + total) % total;
    const img = lb.querySelector("img");
    img.style.opacity = "0";
    img.style.transform = "scale(0.92)";
    setTimeout(() => {
      img.src = lbSlides[lbIndex];
      img.style.opacity = "1";
      img.style.transform = "scale(1)";
    }, 120);
    lb.querySelector(".cf-lightbox-counter").textContent =
      `${lbIndex + 1} / ${total}`;

    // Esconde botões se só 1 slide
    const showNav = total > 1;
    lb.querySelector(".cf-lightbox-prev").style.display = showNav ? "" : "none";
    lb.querySelector(".cf-lightbox-next").style.display = showNav ? "" : "none";
  }

  /* ── Coverflow ── */
  function initCoverflow(wrapper) {
    const slides = Array.from(wrapper.querySelectorAll(".rs-cf-slide"));
    const controls = wrapper.nextElementSibling;
    const dotsWrap = controls.querySelector(".rs-cf-dots");
    const prevBtn = controls.querySelector(".cf-prev");
    const nextBtn = controls.querySelector(".cf-next");
    const total = slides.length;
    let current = 0,
      dragging = false,
      startX = 0,
      liveOffset = 0;

    // Recolhe os src de todas as imagens para o lightbox
    const imgSrcs = slides.map((s) => s.querySelector("img")?.src || "");

    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "rs-cf-dot" + (i === 0 ? " active" : "");
      d.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(d);
    });

    function render(dragOff) {
      const gap = wrapper.offsetWidth * 0.48;
      slides.forEach((slide, i) => {
        const rel = i - current;
        const tx = rel * gap + (dragOff || 0);
        const ry = rel === 0 ? 0 : rel > 0 ? -40 : 40;
        const sc = rel === 0 ? 1 : 0.8;
        const op = Math.abs(rel) > 1 ? 0 : rel === 0 ? 1 : 0.5;
        const ty = rel === 0 ? 0 : 14;

        slide.style.transition = dragging
          ? "none"
          : "transform .42s cubic-bezier(.4,0,.2,1), opacity .42s ease";
        slide.style.transform = `translate(-50%, -50%) translateX(${tx}px) rotateY(${ry}deg) scale(${sc})`;
        slide.style.top = "50%";
        slide.style.left = "50%";
        slide.style.marginTop = rel === 0 ? "0" : `${ty}px`;
        slide.style.opacity = op;
        slide.style.zIndex = rel === 0 ? 20 : Math.abs(rel) === 1 ? 10 : 1;
        slide.classList.toggle("is-active", rel === 0);
      });
    }

    function goTo(index) {
      current = ((index % total) + total) % total;
      liveOffset = 0;
      render(0);
      dotsWrap
        .querySelectorAll(".rs-cf-dot")
        .forEach((d, i) => d.classList.toggle("active", i === current));
    }

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));

    // Clique no slide ativo → abre lightbox
    slides.forEach((s, i) =>
      s.addEventListener("click", () => {
        if (Math.abs(liveOffset) < 6) {
          if (i === current) {
            // slide ativo → lightbox
            openLightbox(imgSrcs, i);
          } else {
            // slide lateral → navegar
            goTo(i);
          }
        }
      }),
    );

    /* Drag — rato */
    wrapper.addEventListener("mousedown", (e) => {
      dragging = true;
      startX = e.clientX;
      liveOffset = 0;
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      liveOffset = e.clientX - startX;
      render(liveOffset);
    });
    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      const thr = wrapper.offsetWidth * 0.1;
      liveOffset < -thr
        ? goTo(current + 1)
        : liveOffset > thr
          ? goTo(current - 1)
          : goTo(current);
    });

    /* Drag — touch */
    wrapper.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
        liveOffset = 0;
      },
      { passive: true },
    );
    wrapper.addEventListener(
      "touchmove",
      (e) => {
        dragging = true;
        liveOffset = e.touches[0].clientX - startX;
        render(liveOffset);
      },
      { passive: true },
    );
    wrapper.addEventListener("touchend", () => {
      dragging = false;
      const thr = wrapper.offsetWidth * 0.1;
      liveOffset < -thr
        ? goTo(current + 1)
        : liveOffset > thr
          ? goTo(current - 1)
          : goTo(current);
    });

    goTo(0);
    wrapper._cfGoTo = goTo;
  }

  document
    .querySelectorAll(".rs-panel.active [data-coverflow]")
    .forEach(initCoverflow);
})();
