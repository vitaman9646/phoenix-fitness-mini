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
// КАРУСЕЛЬ КЕЙСОВ
// ===============================
const track = document.getElementById("casesTrack");
const allSlides = Array.from(document.querySelectorAll(".case-slide"));
const prevBtn = document.getElementById("casesPrev");
const nextBtn = document.getElementById("casesNext");
const dotsContainer = document.getElementById("casesDots");
const thumbsContainer = document.getElementById("casesThumbs");
const progressBar = document.getElementById("casesProgress");

let visibleSlides = [...allSlides];
let index = 0;

// Создание точек
function createDots() {
  dotsContainer.innerHTML = "";
  visibleSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "cases-dot";
    if (i === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);

    dot.addEventListener("click", () => goToSlide(i));
  });
}

// Создание миниатюр
function createThumbs() {
  thumbsContainer.innerHTML = "";
  visibleSlides.forEach((slide, i) => {
    const thumb = document.createElement("div");
    thumb.className = "cases-thumb";
    const img = slide.querySelector("img");
    if (img) {
      thumb.innerHTML = img.outerHTML;
    }
    if (i === 0) thumb.classList.add("active");
    thumbsContainer.appendChild(thumb);

    thumb.addEventListener("click", () => goToSlide(i));
  });
}

function updateCarousel() {
  if (visibleSlides.length === 0) return;

  // Ограничиваем индекс
  if (index >= visibleSlides.length) {
    index = visibleSlides.length - 1;
  }
  if (index < 0) {
    index = 0;
  }

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
  const progress = ((index + 1) / visibleSlides.length) * 100;
  progressBar.style.width = progress + "%";
}

function goToSlide(i) {
  index = i;
  updateCarousel();
}

prevBtn.addEventListener("click", () => {
  index = (index - 1 + visibleSlides.length) % visibleSlides.length;
  updateCarousel();
});

nextBtn.addEventListener("click", () => {
  index = (index + 1) % visibleSlides.length;
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

// Инициализация
createDots();
createThumbs();
updateCarousel();


// ===============================
// ФИЛЬТРЫ КЕЙСОВ
// ===============================
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    // Скрываем/показываем слайды
    allSlides.forEach(slide => {
      const tags = slide.dataset.tags.split(" ");

      if (filter === "all" || tags.includes(filter)) {
        slide.style.display = "block";
      } else {
        slide.style.display = "none";
      }
    });

    // Обновляем массив видимых слайдов
    visibleSlides = allSlides.filter(slide => slide.style.display !== "none");

    // Сбрасываем индекс и пересоздаём навигацию
    index = 0;
    createDots();
    createThumbs();
    updateCarousel();
  });
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
    // Закрываем все остальные
    document.querySelectorAll(".faq-item").forEach(other => {
      if (other !== item) {
        other.classList.remove("active");
      }
    });

    // Переключаем текущий
    item.classList.toggle("active");
  });
});


// ===============================
// ФОРМА CTA
// ===============================
const ctaForm = document.querySelector(".cta-form");
const ctaButton = ctaForm.querySelector(".btn-primary");

ctaButton.addEventListener("click", (e) => {
  e.preventDefault();

  const inputs = ctaForm.querySelectorAll(".input");
  const name = inputs[0].value.trim();
  const contact = inputs[1].value.trim();

  // Простая валидация
  if (!name || !contact) {
    alert("Пожалуйста, заполни все поля!");
    return;
  }

  // Имитация отправки (замени на реальный запрос к боту)
  console.log("Отправка заявки:", { name, contact });

  // Telegram Web App API (если используешь)
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ name, contact }));
    window.Telegram.WebApp.close();
  } else {
    // Для тестирования вне Telegram
    alert(`Заявка отправлена!\n\nИмя: ${name}\nКонтакт: ${contact}`);
    inputs.forEach(input => input.value = "");
  }
});


// ===============================
// TELEGRAM WEB APP ИНТЕГРАЦИЯ
// ===============================
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;

  // Раскрываем приложение на весь экран
  tg.expand();

  // Настраиваем главную кнопку (опционально)
  tg.MainButton.text = "Получить план";
  tg.MainButton.show();
  tg.MainButton.onClick(() => {
    document.querySelector("#ctaFinal").scrollIntoView({ behavior: "smooth" });
  });

  // Применяем цветовую схему Telegram
  document.documentElement.style.setProperty("--bg-main", tg.themeParams.bg_color || "#05070b");
  document.documentElement.style.setProperty("--text-main", tg.themeParams.text_color || "#f5f7ff");
}
