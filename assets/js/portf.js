(function () {
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
        slide.style.transform = `translate(-50%, calc(-50% + ${ty}px)) translateX(${tx}px) rotateY(${ry}deg) scale(${sc})`;
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

    slides.forEach((s, i) =>
      s.addEventListener("click", () => {
        if (Math.abs(liveOffset) < 6) goTo(i);
      }),
    );

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
