/* =========================
   HEADER — SCROLL EFFECT
========================= */
const header = document.getElementById("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header.classList.add("header--scrolled");
  } else {
    header.classList.remove("header--scrolled");
  }
});


/* =========================
   SMOOTH SCROLL
========================= */
document.querySelectorAll("[data-scroll-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.querySelector(btn.dataset.scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});


/* =========================
   REVEAL ON SCROLL
========================= */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

revealElements.forEach(el => revealObserver.observe(el));


/* =========================
   CASES — FILTERS
========================= */
const filterButtons = document.querySelectorAll(".cases__filter");
const caseCards = document.querySelectorAll(".case");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    caseCards.forEach(card => {
      const tags = card.dataset.tags.split(" ");

      if (filter === "all" || tags.includes(filter)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});


/* =========================
   CASES — CAROUSEL
========================= */
const track = document.getElementById("casesTrack");
const prevBtn = document.getElementById("casesPrev");
const nextBtn = document.getElementById("casesNext");
const progress = document.getElementById("casesProgress");

let position = 0;
const cardWidth = 344; // 320 + gap
const maxPosition = -(cardWidth * (caseCards.length - 1));

function updateCarousel() {
  track.style.transform = `translateX(${position}px)`;

  const progressPercent = Math.abs(position) / Math.abs(maxPosition) * 100;
  progress.style.width = `${progressPercent}%`;
}

nextBtn.addEventListener("click", () => {
  if (position > maxPosition) {
    position -= cardWidth;
    updateCarousel();
  }
});

prevBtn.addEventListener("click", () => {
  if (position < 0) {
    position += cardWidth;
    updateCarousel();
  }
});


/* =========================
   QUIZ
========================= */
const quizRoot = document.getElementById("quizRoot");
const quizSteps = quizRoot.querySelectorAll(".quiz__step");
const quizProgress = document.getElementById("quizProgress");

let currentStep = 0;

function showStep(index) {
  quizSteps.forEach(step => step.classList.remove("active"));
  quizSteps[index].classList.add("active");

  const percent = (index / (quizSteps.length - 1)) * 100;
  quizProgress.style.width = `${percent}%`;
}

quizRoot.querySelectorAll(".quiz__option").forEach(option => {
  option.addEventListener("click", () => {
    if (currentStep < quizSteps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });
});

showStep(0);


/* =========================
   FAQ — ACCORDION
========================= */
document.querySelectorAll(".faq__item").forEach(item => {
  const question = item.querySelector(".faq__question");

  question.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});


/* =========================
   CTA FORM — SUBMIT
========================= */
const ctaForm = document.getElementById("ctaForm");

ctaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  alert("Спасибо! Я свяжусь с тобой в течение дня.");

  ctaForm.reset();
});
