(function () {
  const viewport = document.getElementById("fslViewport");
  const track = document.getElementById("fslTrack");
  const dotsWrap = document.getElementById("fslDots");

  let cards = Array.from(track.querySelectorAll(".fsl-card"));

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

  function stepWidth() {
    const gap = window.innerWidth < 576 ? 16 : 28;
    return cards[0].offsetWidth + gap;
  }

  // 🔥 CLONAR PARA LOOP INFINITO
  function setupInfinite() {
    const clonesBefore = cards
      .slice(-visibleCount())
      .map((el) => el.cloneNode(true));
    const clonesAfter = cards
      .slice(0, visibleCount())
      .map((el) => el.cloneNode(true));

    clonesBefore.forEach((clone) =>
      track.insertBefore(clone, track.firstChild),
    );
    clonesAfter.forEach((clone) => track.appendChild(clone));

    cards = Array.from(track.querySelectorAll(".fsl-card"));
    current = visibleCount();

    track.style.transform = `translateX(-${current * stepWidth()}px)`;
  }

  function goTo(index, animate = true) {
    current = index;
    track.style.transition = animate
      ? "transform .45s cubic-bezier(.4,0,.2,1)"
      : "none";

    track.style.transform = `translateX(-${current * stepWidth()}px)`;
    updateDots();
  }

  function maxIndex() {
    return cards.length - visibleCount();
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    const total =
      track.querySelectorAll(".fsl-card").length - visibleCount() * 2;

    for (let i = 0; i < total; i++) {
      const d = document.createElement("button");
      d.className = "fsl-dot" + (i === 0 ? " active" : "");
      d.addEventListener("click", () => {
        goTo(i + visibleCount());
        resetAuto();
      });
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    const total = dotsWrap.children.length;
    let realIndex = (current - visibleCount()) % total;
    if (realIndex < 0) realIndex += total;

    dotsWrap
      .querySelectorAll(".fsl-dot")
      .forEach((d, i) => d.classList.toggle("active", i === realIndex));
  }

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current + 1);
    }, 3500);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // 🔥 LOOP SUAVE (sem salto)
  track.addEventListener("transitionend", () => {
    const total = track.querySelectorAll(".fsl-card").length;

    if (current >= total - visibleCount()) {
      track.style.transition = "none";
      current = visibleCount();
      track.style.transform = `translateX(-${current * stepWidth()}px)`;
    }

    if (current < visibleCount()) {
      track.style.transition = "none";
      current = total - visibleCount() * 2;
      track.style.transform = `translateX(-${current * stepWidth()}px)`;
    }
  });

  /* DRAG (igual ao teu, mantido) */
  viewport.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX;
    dragOffset = 0;
    track.style.transition = "none";
    clearInterval(autoTimer);
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    dragOffset = e.clientX - startX;
    track.style.transform = `translateX(${-current * stepWidth() + dragOffset}px)`;
  });

  window.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;

    const thr = stepWidth() * 0.2;

    if (dragOffset < -thr) current++;
    else if (dragOffset > thr) current--;

    goTo(current);
    resetAuto();
  });

  /* TOUCH */
  viewport.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragOffset = 0;
    track.style.transition = "none";
    clearInterval(autoTimer);
  });

  viewport.addEventListener("touchmove", (e) => {
    dragOffset = e.touches[0].clientX - startX;
    track.style.transform = `translateX(${-current * stepWidth() + dragOffset}px)`;
  });

  viewport.addEventListener("touchend", () => {
    const thr = stepWidth() * 0.2;

    if (dragOffset < -thr) current++;
    else if (dragOffset > thr) current--;

    goTo(current);
    resetAuto();
  });

  window.addEventListener("resize", () => {
    track.style.transition = "none";
    track.style.transform = `translateX(-${current * stepWidth()}px)`;
  });

  // INIT
  setupInfinite();
  buildDots();
  startAuto();
})();
