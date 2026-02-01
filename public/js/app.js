// ===============================
// ПЛАВНЫЙ СКРОЛЛ
// ===============================
document.querySelectorAll("[data-scroll-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.querySelector(btn.dataset.scrollTarget);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: "smooth"
      });
    }
  });
});


// ===============================
// REVEAL-АНИМАЦИИ
// ===============================
const revealElements = document.querySelectorAll(".reveal");

function handleReveal() {
  const trigger = window.innerHeight * 0.88;

  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect().top;
    if (rect < trigger) {
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", handleReveal);
handleReveal();


// ===============================
// ФИЛЬТРЫ КЕЙСОВ
// ===============================
const filterButtons = document.querySelectorAll(".filter-btn");
const caseSlides = document.querySelectorAll(".case-slide");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    caseSlides.forEach(slide => {
      const tags = slide.dataset.tags.split(" ");

      if (filter === "all" || tags.includes(filter)) {
        slide.style.display = "block";
      } else {
        slide.style.display = "none";
      }
    });
  });
});


// ===============================
// КАРУСЕЛЬ КЕЙСОВ
// ===============================
const track = document.getElementById("casesTrack");
const slides = Array.from(document.querySelectorAll(".case-slide"));
const prevBtn = document.getElementById("casesPrev");
const nextBtn = document.getElementById("casesNext");
const dotsContainer = document.getElementById("casesDots");
const thumbsContainer = document.getElementById("casesThumbs");
const progressBar = document.getElementById("casesProgress");

let index = 0;

// Создание точек
slides.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.className = "cases-dot";
  if (i === 0) dot.classList.add("active");
  dotsContainer.appendChild(dot);

  dot.addEventListener("click", () => goToSlide(i));
});

// Создание миниатюр
slides.forEach((slide, i) => {
  const thumb = document.createElement("div");
  thumb.className = "cases-thumb";
  thumb.innerHTML = slide.querySelector("img").outerHTML;
  if (i === 0) thumb.classList.add("active");
  thumbsContainer.appendChild(thumb);

  thumb.addEventListener("click", () => goToSlide(i));
});

function updateCarousel() {
  track.style.transform = `translateX(-${index * 100}%)`;

  // Обновление точек
  dotsContainer.querySelectorAll(".cases-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  // Обновление миниатюр
  thumbsContainer.querySelectorAll(".cases-thumb").forEach((thumb, i) => {
    thumb.classList.toggle("active", i === index);
  });

  // Прогресс-бар
  const progress = ((index + 1) / slides.length) * 100;
  progressBar.style.width = progress + "%";
}

function goToSlide(i) {
  index = i;
  updateCarousel();
}

prevBtn.addEventListener("click", () => {
  index = (index - 1 + slides.length) % slides.length;
  updateCarousel();
});

nextBtn.addEventListener("click", () => {
  index = (index + 1) % slides.length;
  updateCarousel();
});

// Свайп
let startX = 0;

track.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

track.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (endX - startX > 50) prevBtn.click();
  if (startX - endX > 50) nextBtn.click();
});


// ===============================
// КВИЗ
// ===============================
const quizRoot = document.getElementById("quizRoot");
const quizSteps = quizRoot.querySelectorAll(".quiz-step");
const quizProgress = document.getElementById("quizProgress");

let quizIndex = 0;

function showQuizStep(i) {
  quizSteps.forEach(step => step.classList.remove("active"));
  quizSteps[i].classList.add("active");

  const progress = ((i + 1) / quizSteps.length) * 100;
  quizProgress.style.width = progress + "%";
}

quizRoot.querySelectorAll(".quiz-option").forEach(btn => {
  btn.addEventListener("click", () => {
    quizIndex++;
    if (quizIndex >= quizSteps.length) quizIndex = quizSteps.length - 1;
    showQuizStep(quizIndex);
  });
});

showQuizStep(0);


// ===============================
// FAQ
// ===============================
document.querySelectorAll(".faq-item").forEach(item => {
  const question = item.querySelector(".faq-question");

  question.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});
