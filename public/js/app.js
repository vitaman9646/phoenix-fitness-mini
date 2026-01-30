// Плавный скролл по data-scroll-target
document.querySelectorAll("[data-scroll-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-scroll-target");
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Карусель кейсов
(function () {
  const track = document.getElementById("casesTrack");
  const slides = Array.from(track.querySelectorAll(".case-slide"));
  const dotsContainer = document.getElementById("casesDots");
  const thumbsContainer = document.getElementById("casesThumbs");
  const prevBtn = document.getElementById("casesPrev");
  const nextBtn = document.getElementById("casesNext");
  const progress = document.getElementById("casesProgress");
  const filters = Array.from(document.querySelectorAll(".filter-btn"));

  let currentIndex = 0;
  let autoTimer = null;
  const autoDelay = 6000;

  if (!slides.length) return;

  // Создание точек
  function renderDots() {
    dotsContainer.innerHTML = "";
    slides.forEach((_, idx) => {
      const dot = document.createElement("div");
      dot.className = "cases-dot" + (idx === currentIndex ? " active" : "");
      dot.dataset.index = idx;
      dotsContainer.appendChild(dot);
    });
  }

  // Создание миниатюр
  function renderThumbs() {
    thumbsContainer.innerHTML = "";
    slides.forEach((slide, idx) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "cases-thumb" + (idx === currentIndex ? " active" : "");
      thumb.dataset.index = idx;

      const img = slide.querySelector(".case-photo img");
      if (img) {
        const thumbImg = document.createElement("img");
        thumbImg.src = img.src;
        thumbImg.alt = img.alt || "Кейс";
        thumb.appendChild(thumbImg);
      }

      thumbsContainer.appendChild(thumb);
    });
  }

  function updateActiveSlide() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentIndex);
    });

    dotsContainer.querySelectorAll(".cases-dot").forEach(dot => {
      dot.classList.toggle("active", Number(dot.dataset.index) === currentIndex);
    });

    thumbsContainer.querySelectorAll(".cases-thumb").forEach(thumb => {
      thumb.classList.toggle("active", Number(thumb.dataset.index) === currentIndex);
    });

    progress.style.width = "0%";
  }

  function goTo(index) {
    const visibleSlides = slides.filter(slide => slide.style.display !== "none");
    if (!visibleSlides.length) return;

    const realIndex = visibleSlides.indexOf(slides[index]);
    if (realIndex === -1) {
      currentIndex = slides.indexOf(visibleSlides[0]);
    } else {
      currentIndex = index;
    }

    updateActiveSlide();
    resetAuto();
  }

  function next() {
    const visibleSlides = slides.filter(slide => slide.style.display !== "none");
    if (!visibleSlides.length) return;
    const currentVisibleIndex = visibleSlides.indexOf(slides[currentIndex]);
    const nextVisibleIndex = (currentVisibleIndex + 1) % visibleSlides.length;
    currentIndex = slides.indexOf(visibleSlides[nextVisibleIndex]);
    updateActiveSlide();
    resetAuto();
  }

  function prev() {
    const visibleSlides = slides.filter(slide => slide.style.display !== "none");
    if (!visibleSlides.length) return;
    const currentVisibleIndex = visibleSlides.indexOf(slides[currentIndex]);
    const prevVisibleIndex =
      (currentVisibleIndex - 1 + visibleSlides.length) % visibleSlides.length;
    currentIndex = slides.indexOf(visibleSlides[prevVisibleIndex]);
    updateActiveSlide();
    resetAuto();
  }

  // Автопрокрутка + прогресс
  function startAuto() {
    let startTime = performance.now();
    function frame(now) {
      const elapsed = now - startTime;
      const progressValue = Math.min(elapsed / autoDelay, 1);
      progress.style.width = (progressValue * 100).toFixed(2) + "%";
      if (elapsed >= autoDelay) {
        next();
        startTime = performance.now();
      }
      autoTimer = requestAnimationFrame(frame);
    }
    autoTimer = requestAnimationFrame(frame);
  }

  function resetAuto() {
    if (autoTimer) cancelAnimationFrame(autoTimer);
    progress.style.width = "0%";
    startAuto();
  }

  // Свайп
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  });

  track.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        next();
      } else {
        prev();
      }
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
  });

  // Клики по стрелкам
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // Клики по точкам
  dotsContainer.addEventListener("click", (e) => {
    const dot = e.target.closest(".cases-dot");
    if (!dot) return;
    const idx = Number(dot.dataset.index);
    if (!Number.isNaN(idx)) {
      goTo(idx);
    }
  });

  // Клики по миниатюрам
  thumbsContainer.addEventListener("click", (e) => {
    const thumb = e.target.closest(".cases-thumb");
    if (!thumb) return;
    const idx = Number(thumb.dataset.index);
    if (!Number.isNaN(idx)) {
      goTo(idx);
    }
  });

  // Фильтры
  function applyFilter(tag) {
    slides.forEach((slide, idx) => {
      if (tag === "all") {
        slide.style.display = "";
      } else {
        const tags = (slide.dataset.tags || "").split(" ");
        slide.style.display = tags.includes(tag) ? "" : "none";
      }
    });

    const visibleSlides = slides.filter(slide => slide.style.display !== "none");
    if (!visibleSlides.length) return;

    currentIndex = slides.indexOf(visibleSlides[0]);
    renderDots();
    renderThumbs();
    updateActiveSlide();
    resetAuto();
  }

  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tag = btn.dataset.filter;
      applyFilter(tag);
    });
  });

  // Инициализация
  renderDots();
  renderThumbs();
  updateActiveSlide();
  startAuto();
})();

// Квиз
(function () {
  const root = document.getElementById("quizRoot");
  if (!root) return;

  const steps = Array.from(root.querySelectorAll(".quiz-step"));
  const progress = document.getElementById("quizProgress");
  const totalSteps = steps.filter(s => s.dataset.step !== "result").length;
  let currentStepIndex = 0;

  function showStep(index) {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === index);
    });
    const stepNumber = Math.min(index + 1, totalSteps);
    const percent = (stepNumber / totalSteps) * 100;
    progress.style.width = percent.toFixed(2) + "%";
  }

  steps.forEach((step, idx) => {
    if (step.dataset.step === "result") return;
    step.addEventListener("click", (e) => {
      const option = e.target.closest(".quiz-option");
      if (!option) return;
      if (idx < totalSteps - 1) {
        currentStepIndex = idx + 1;
        showStep(currentStepIndex);
      } else {
        const resultStep = steps.find(s => s.dataset.step === "result");
        if (!resultStep) return;
        steps.forEach(s => s.classList.remove("active"));
        resultStep.classList.add("active");
        progress.style.width = "100%";
      }
    });
  });

  showStep(currentStepIndex);
})();

// FAQ
(function () {
  const items = document.querySelectorAll(".faq-item");
  items.forEach(item => {
    const btn = item.querySelector(".faq-question");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      items.forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
})();
