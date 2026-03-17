(function () {
  const viewport = document.getElementById("fslViewport");
  const track = document.getElementById("fslTrack");
  const dotsWrap = document.getElementById("fslDots");
  const cards = Array.from(track.querySelectorAll(".fsl-card"));

  function visibleCount() {
    if (window.innerWidth < 576) return 1;
    if (window.innerWidth < 992) return 2;
    return 4;
  }

  let current = 0,
    dragging = false,
    startX = 0,
    dragOffset = 0,
    autoTimer;

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function stepWidth() {
    return cards[0].offsetWidth + 28;
  }

  function goTo(index, animate = true) {
    current = Math.max(0, Math.min(index, maxIndex()));
    track.style.transition = animate
      ? "transform .45s cubic-bezier(.4,0,.2,1)"
      : "none";
    track.style.transform = `translateX(-${current * stepWidth()}px)`;
    updateDots();
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= maxIndex(); i++) {
      const d = document.createElement("button");
      d.className = "fsl-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", `Slide ${i + 1}`);
      d.addEventListener("click", () => {
        goTo(i);
        resetAuto();
      });
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    dotsWrap
      .querySelectorAll(".fsl-dot")
      .forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function startAuto() {
    autoTimer = setInterval(
      () => goTo(current >= maxIndex() ? 0 : current + 1),
      3500,
    );
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  /* Drag rato */
  viewport.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX;
    dragOffset = 0;
    track.style.transition = "none";
    clearInterval(autoTimer);
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    dragOffset = e.clientX - startX;
    track.style.transform = `translateX(${-current * stepWidth() + dragOffset}px)`;
  });
  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    const thr = stepWidth() * 0.25;
    dragOffset < -thr
      ? goTo(current + 1)
      : dragOffset > thr
        ? goTo(current - 1)
        : goTo(current);
    resetAuto();
  });

  /* Touch */
  viewport.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      dragOffset = 0;
      track.style.transition = "none";
      clearInterval(autoTimer);
    },
    { passive: true },
  );
  viewport.addEventListener(
    "touchmove",
    (e) => {
      dragOffset = e.touches[0].clientX - startX;
      track.style.transform = `translateX(${-current * stepWidth() + dragOffset}px)`;
    },
    { passive: true },
  );
  viewport.addEventListener("touchend", () => {
    const thr = stepWidth() * 0.25;
    dragOffset < -thr
      ? goTo(current + 1)
      : dragOffset > thr
        ? goTo(current - 1)
        : goTo(current);
    resetAuto();
  });

  /* Pause no hover */
  viewport.addEventListener("mouseenter", () => clearInterval(autoTimer));
  viewport.addEventListener("mouseleave", () => {
    if (!dragging) startAuto();
  });

  cards.forEach((c) => c.classList.add("is-draggable"));

  window.addEventListener("resize", () => {
    buildDots();
    goTo(Math.min(current, maxIndex()), false);
  });

  buildDots();
  goTo(0, false);
  startAuto();
})();
