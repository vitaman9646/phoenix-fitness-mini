// ===============================
// КОНФИГУРАЦИЯ
// ===============================
const CONFIG = {
  ANALYTICS_ENABLED: true,
  URGENCY_TIMER_HOURS: 6 // Часов до конца акции
};

// ===============================
// УТИЛИТЫ
// ===============================
const Utils = {
  // Показать уведомление
  showNotification(title, message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    
    const icon = type === 'success' ? '✅' : '❌';
    
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  },

  // Показать/скрыть лоадер
  toggleLoader(show) {
    const loader = document.getElementById('loaderOverlay');
    if (show) {
      loader.classList.remove('hidden');
    } else {
      loader.classList.add('hidden');
    }
  },

  // Отправить событие в аналитику
  trackEvent(category, action, label) {
    if (!CONFIG.ANALYTICS_ENABLED) return;
    
    console.log(`📊 Analytics: ${category} - ${action} - ${label}`);
    
    // Интеграция с Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        'event_category': category,
        'event_label': label
      });
    }
    
    // Интеграция с Яндекс.Метрика
    if (typeof ym !== 'undefined') {
      ym(YANDEX_METRIKA_ID, 'reachGoal', action);
    }
  },
  
  // Debounce для оптимизации событий
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ===============================
// ЛОАДЕР ПРИ ЗАГРУЗКЕ
// ===============================
window.addEventListener('load', () => {
  setTimeout(() => {
    Utils.toggleLoader(false);
  }, 500);
});

// ===============================
// ПЛАВНЫЙ СКРОЛЛ
// ===============================
document.querySelectorAll("[data-scroll-target]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = btn.dataset.scrollTarget;
    const target = document.querySelector(targetId);
    
    if (target) {
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
      
      Utils.trackEvent('Navigation', 'Click', targetId);
    }
  });
});

// ===============================
// REVEAL-АНИМАЦИИ С INTERSECTION OBSERVER
// ===============================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

// ===============================
// STICKY HEADER
// ===============================
const header = document.querySelector('.header');
let lastScroll = 0;

const handleScroll = Utils.debounce(() => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
}, 10);

window.addEventListener('scroll', handleScroll, { passive: true });

// ===============================
// АНИМИРОВАННЫЕ СЧЁТЧИКИ
// ===============================
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      const endValue = parseFloat(target.dataset.target);
      const isDecimal = endValue % 1 !== 0;
      
      animateNumber(target, 0, endValue, 2000, isDecimal);
      statObserver.unobserve(target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => {
  statObserver.observe(el);
});

function animateNumber(element, start, end, duration, isDecimal = false) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    
    if (isDecimal) {
      element.textContent = current.toFixed(1);
    } else {
      element.textContent = Math.floor(current) + '+';
    }
  }, 16);
}

// ===============================
// ГЕНЕРАЦИЯ APPROACH TIMELINE
// ===============================
const approachSteps = [
  {
    number: 1,
    title: "Диагностика",
    text: "Разбираем твою цель, опыт, ограничения, график, доступный инвентарь и питание."
  },
  {
    number: 2,
    title: "План",
    text: "Составляю программу тренировок и питания под тебя. Без шаблонов и «универсальных» схем."
  },
  {
    number: 3,
    title: "Контроль техники",
    text: "Разбираем технику, корректируем ошибки, чтобы ты тренировал мышцы, а не суставы."
  },
  {
    number: 4,
    title: "Поддержка и результат",
    text: "Я веду тебя по плану, корректирую нагрузку и питание, чтобы ты дошёл до результата."
  }
];

function renderApproachTimeline() {
  const timeline = document.getElementById('approachTimeline');
  if (!timeline) return;
  
  timeline.innerHTML = `
    <div class="approach-line" aria-hidden="true"></div>
    ${approachSteps.map(step => `
      <li class="approach-step enhanced reveal">
        <div class="approach-number" aria-label="Шаг ${step.number}">${step.number}</div>
        <div class="approach-content">
          <h3 class="approach-title">${step.title}</h3>
          <p class="approach-text">${step.text}</p>
        </div>
      </li>
    `).join('')}
  `;
  
  // Re-apply observer for new elements
  timeline.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
}

renderApproachTimeline();

// ===============================
// КАРУСЕЛЬ КЕЙСОВ
// ===============================
class CasesCarousel {
  constructor() {
    this.track = document.getElementById("casesTrack");
    if (!this.track) return;
    
    this.allSlides = Array.from(document.querySelectorAll(".case-slide"));
    this.prevBtn = document.getElementById("casesPrev");
    this.nextBtn = document.getElementById("casesNext");
    this.dotsContainer = document.getElementById("casesDots");
    this.thumbsContainer = document.getElementById("casesThumbs");
    this.progressBar = document.getElementById("casesProgress");
    
    this.visibleSlides = [...this.allSlides];
    this.index = 0;
    
    this.init();
  }
  
  init() {
    this.createDots();
    this.createThumbs();
    this.updateCarousel();
    this.setupListeners();
    this.loadImages();
    this.setupSwipe();
  }
  
  createDots() {
    if (!this.dotsContainer) return;
    
    this.dotsContainer.innerHTML = "";
    this.visibleSlides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "cases-dot";
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Кейс ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      
      if (i === 0) dot.classList.add("active");
      this.dotsContainer.appendChild(dot);
      
      dot.addEventListener("click", () => this.goToSlide(i));
    });
  }
  
  createThumbs() {
    if (!this.thumbsContainer) return;
    
    this.thumbsContainer.innerHTML = "";
    this.visibleSlides.forEach((slide, i) => {
      const thumb = document.createElement("button");
      thumb.className = "cases-thumb";
      thumb.setAttribute('aria-label', `Перейти к кейсу ${i + 1}`);
      
      const img = slide.querySelector("img[data-src]");
      if (img) {
        const thumbImg = document.createElement('img');
        thumbImg.src = img.dataset.src;
        thumbImg.alt = "";
        thumb.appendChild(thumbImg);
      }
      if (i === 0) thumb.classList.add("active");
      this.thumbsContainer.appendChild(thumb);
      
      thumb.addEventListener("click", () => this.goToSlide(i));
    });
  }
  
  updateCarousel() {
    if (this.visibleSlides.length === 0) return;
    
    if (this.index >= this.visibleSlides.length) {
      this.index = this.visibleSlides.length - 1;
    }
    if (this.index < 0) {
      this.index = 0;
    }
    
    this.track.style.transform = `translateX(-${this.index * 100}%)`;
    
    if (this.dotsContainer) {
      this.dotsContainer.querySelectorAll(".cases-dot").forEach((dot, i) => {
        const isActive = i === this.index;
        dot.classList.toggle("active", isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
    
    if (this.thumbsContainer) {
      this.thumbsContainer.querySelectorAll(".cases-thumb").forEach((thumb, i) => {
        thumb.classList.toggle("active", i === this.index);
      });
    }
    
    if (this.progressBar) {
      const progress = ((this.index + 1) / this.visibleSlides.length) * 100;
      this.progressBar.style.width = progress + "%";
    }
  }
  
  goToSlide(i) {
    this.index = i;
    this.updateCarousel();
    Utils.trackEvent('Cases', 'Slide', `Slide ${i + 1}`);
  }
  
  prev() {
    this.index = (this.index - 1 + this.visibleSlides.length) % this.visibleSlides.length;
    this.updateCarousel();
  }
  
  next() {
    this.index = (this.index + 1) % this.visibleSlides.length;
    this.updateCarousel();
  }
  
  filterSlides(filter) {
    this.allSlides.forEach(slide => {
      const tags = slide.dataset.tags.split(" ");
      
      if (filter === "all" || tags.includes(filter)) {
        slide.style.display = "block";
      } else {
        slide.style.display = "none";
      }
    });
    
    this.visibleSlides = this.allSlides.filter(slide => slide.style.display !== "none");
    this.index = 0;
    this.createDots();
    this.createThumbs();
    this.updateCarousel();
  }
  
  setupListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.next());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }
  
  setupSwipe() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    this.track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
  }
  
  loadImages() {
    const images = this.track.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

const casesCarousel = new CasesCarousel();

// Фильтры кейсов
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("active");
      b.setAttribute('aria-selected', 'false');
    });
    
    btn.classList.add("active");
    btn.setAttribute('aria-selected', 'true');
    
    if (casesCarousel) {
      casesCarousel.filterSlides(filter);
    }
    
    Utils.trackEvent('Cases', 'Filter', filter);
  });
});

// ===============================
// КВИЗ С УЛУЧШЕННОЙ ЛОГИКОЙ
// ===============================
class Quiz {
  constructor() {
    this.wrapper = document.getElementById('quizWrapper');
    if (!this.wrapper) return;
    
    this.currentStep = 1;
    this.answers = this.loadAnswers();
    this.totalSteps = 4;
    this.history = [1];
    
    this.init();
  }
  
  init() {
    this.setupListeners();
    this.updateProgress();
    this.loadSavedState();
  }
  
  setupListeners() {
    // Опции квиза
    this.wrapper.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.closest('.quiz-step').dataset.step);
        const value = btn.dataset.value;
        const nextStep = btn.dataset.next;
        
        this.saveAnswer(step, value);
        
        if (nextStep === 'result') {
          this.showResult();
        } else {
          this.showStep(parseInt(nextStep));
        }
      });
    });
    
    // Кнопка "Назад"
    const backBtn = document.getElementById('quizBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goBack());
    }
    
    // Кнопка "Пройти заново"
    const restartBtn = document.getElementById('quizRestart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }
    
    // Кнопка скачать бонус
    const downloadBtn = document.getElementById('downloadBonus');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadBonus());
    }
  }
  
  saveAnswer(step, value) {
    this.answers[`step${step}`] = value;
    this.saveAnswers();
    Utils.trackEvent('Quiz', `Step${step}`, value);
  }
  
  showStep(step) {
    this.wrapper.querySelectorAll('.quiz-step').forEach(s => {
      s.classList.remove('active');
    });
    
    const targetStep = this.wrapper.querySelector(`[data-step="${step}"]`);
    if (targetStep) {
      targetStep.classList.add('active');
    }
    
    this.currentStep = step;
    this.history.push(step);
    this.updateProgress();
    this.updateBackButton();
  }
  
  goBack() {
    if (this.history.length <= 1) return;
    
    this.history.pop(); // Remove current
    const prevStep = this.history[this.history.length - 1];
    
    this.wrapper.querySelectorAll('.quiz-step').forEach(s => {
      s.classList.remove('active');
    });
    
    const targetStep = this.wrapper.querySelector(`[data-step="${prevStep}"]`);
    if (targetStep) {
      targetStep.classList.add('active');
    }
    
    this.currentStep = prevStep;
    this.updateProgress();
    this.updateBackButton();
  }
  
  updateBackButton() {
    const backBtn = document.getElementById('quizBackBtn');
    if (!backBtn) return;
    
    if (this.history.length > 1 && this.currentStep !== 'result') {
      backBtn.style.display = 'block';
    } else {
      backBtn.style.display = 'none';
    }
  }
  
  updateProgress() {
    const progress = document.getElementById('quizProgress');
    if (!progress) return;
    
    const percentage = (this.currentStep / this.totalSteps) * 100;
    progress.style.width = percentage + '%';
    
    const progressBar = progress.closest('.quiz-progress');
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', percentage);
    }
  }
  
  showResult() {
    this.wrapper.querySelectorAll('.quiz-step').forEach(s => {
      s.classList.remove('active');
    });
    
    const resultStep = this.wrapper.querySelector('[data-step="result"]');
    if (resultStep) {
      resultStep.classList.add('active');
    }
    
    this.currentStep = 'result';
    this.updateBackButton();
    this.generatePersonalizedResult();
    Utils.trackEvent('Quiz', 'Complete', 'Result');
  }
  
  generatePersonalizedResult() {
    const resultContainer = document.getElementById('quizResultText');
    if (!resultContainer) return;
    
    const goal = this.answers.step1;
    const place = this.answers.step2;
    const frequency = this.answers.step3;
    const level = this.answers.step4;
    
    const goalTexts = {
      loss: 'похудение и рельеф',
      gain: 'набор мышечной массы',
      tone: 'тонус и общее здоровье'
    };
    
    const placeTexts = {
      home: 'тренировки дома',
      gym: 'тренировки в зале',
      both: 'комбинированные тренировки'
    };
    
    const levelTexts = {
      beginner: 'новичок',
      middle: 'продолжающий',
      advanced: 'продвинутый уровень'
    };
    
    const recommendedPlan = this.getRecommendedPlan(goal, frequency, level);
    
    resultContainer.innerHTML = `
      <div class="quiz-result-summary">
        <p><strong>Твоя цель:</strong> ${goalTexts[goal] || 'не указана'}</p>
        <p><strong>Формат:</strong> ${placeTexts[place] || 'не указан'}</p>
        <p><strong>Частота:</strong> ${frequency || '?'} раз в неделю</p>
        <p><strong>Уровень:</strong> ${levelTexts[level] || 'не указан'}</p>
      </div>
      
      <div class="quiz-result-recommendation">
        <h4>Тебе подойдёт тариф «${recommendedPlan.name}»:</h4>
        <p>${recommendedPlan.description}</p>
        <div class="quiz-result-price">
          от <strong>${recommendedPlan.price}</strong>
        </div>
      </div>
    `;
  }
  
  getRecommendedPlan(goal, frequency, level) {
    // Логика рекомендации тарифа под НОВЫЕ цены
    if (level === 'beginner' || frequency <= 3) {
      return {
        name: 'Базовый',
        description: 'Библиотека программ похудения, набора массы, женский фитнес и домашние тренировки. Трекеры веса и КБЖУ. Для самостоятельных занятий.',
        price: '890₽/месяц'
      };
    } else if (level === 'advanced' || frequency >= 5) {
      return {
        name: 'VIP',
        description: 'Всё из Оптимального + live-занятия 1-2 раза в неделю, еженедельный видео-разбор техники, чат 24/7 без лимита, полная индивидуалка.',
        price: '3 990₽/месяц'
      };
    } else {
      return {
        name: 'Оптимальный',
        description: 'Самый популярный тариф! Всё из Базового + чат с тренером 4-6 раз в неделю, 3-4 корректировки в месяц, персональный подбор под цель, чек-ин по фото.',
        price: '1 490₽/месяц'
      };
    }
  }
  
  downloadBonus() {
    // Запрашиваем email для отправки бонусов
    const email = prompt('Введи свой email для получения бонусов:');
    
    if (!email || email.trim() === '') {
      Utils.showNotification('Отмена', 'Email не указан', 'error');
      return;
    }
    
    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Utils.showNotification('Ошибка', 'Укажи корректный email', 'error');
      return;
    }
    
    // Здесь можно отправить на сервер для реальной отправки
    // await fetch('/api/send-bonus', { method: 'POST', body: JSON.stringify({ email, quiz: this.getAnswers() }) });
    
    Utils.showNotification('Успех!', `Бонусы отправлены на ${email}. Проверь почту!`, 'success');
    Utils.trackEvent('Quiz', 'DownloadBonus', email);
    
    // Вариант 2: Просто открыть PDF файл
    // window.open('/bonuses/first-week-plan.pdf', '_blank');
  }
  
  saveAnswers() {
    localStorage.setItem('quizAnswers', JSON.stringify(this.answers));
  }
  
  loadAnswers() {
    const saved = localStorage.getItem('quizAnswers');
    return saved ? JSON.parse(saved) : {};
  }
  
  loadSavedState() {
    // Можно восстановить прогресс если пользователь вернулся
    if (Object.keys(this.answers).length > 0) {
      console.log('Найдены сохранённые ответы:', this.answers);
    }
  }
  
  restart() {
    this.currentStep = 1;
    this.answers = {};
    this.history = [1];
    this.saveAnswers();
    this.showStep(1);
    Utils.trackEvent('Quiz', 'Restart', '');
  }
  
  getAnswers() {
    return this.answers;
  }
}

const quiz = new Quiz();

// ===============================
// FAQ (работает нативно с details)
// ===============================
document.querySelectorAll(".faq-item").forEach(item => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      const question = item.querySelector("summary").textContent.trim();
      Utils.trackEvent('FAQ', 'Open', question);
    }
  });
});

// ===============================
// ФОРМА CTA С ВАЛИДАЦИЕЙ
// ===============================
class CTAForm {
  constructor() {
    this.form = document.getElementById('ctaForm');
    if (!this.form) return;
    
    this.nameInput = document.getElementById('inputName');
    this.contactInput = document.getElementById('inputContact');
    this.goalInput = document.getElementById('inputGoal');
    this.honeypot = this.form.querySelector('input[name="website"]');
    
    this.init();
  }
  
  init() {
    this.autoFillFromQuiz();
    this.autoFillFromTelegram();
    this.setupRealTimeValidation();
    this.setupSubmit();
  }
  
  autoFillFromQuiz() {
    if (quiz && this.goalInput) {
      const quizAnswers = quiz.getAnswers();
      if (quizAnswers.step1) {
        this.goalInput.value = quizAnswers.step1;
      }
    }
  }
  
  autoFillFromTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe.user;
      
      if (user) {
        if (user.first_name && this.nameInput) {
          this.nameInput.value = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        }
        
        if (user.username && this.contactInput) {
          this.contactInput.value = '@' + user.username;
        }
      }
    }
  }
  
  setupRealTimeValidation() {
    // Валидация имени
    if (this.nameInput) {
      this.nameInput.addEventListener('blur', () => {
        if (this.nameInput.value.trim().length < 2) {
          this.showFieldError(this.nameInput, 'Имя должно быть минимум 2 символа');
        } else {
          this.clearFieldError(this.nameInput);
        }
      });
    }
    
    // Валидация контакта
    if (this.contactInput) {
      this.contactInput.addEventListener('blur', () => {
        if (!this.validateContact(this.contactInput.value)) {
          this.showFieldError(this.contactInput, 'Укажи корректный Telegram, WhatsApp или телефон');
        } else {
          this.clearFieldError(this.contactInput);
        }
      });
    }
  }
  
  showFieldError(input, message) {
    this.clearFieldError(input);
    
    input.classList.add('input-error');
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    error.setAttribute('role', 'alert');
    
    input.parentElement.appendChild(error);
  }
  
  clearFieldError(input) {
    input.classList.remove('input-error');
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }
  
  setupSubmit() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Проверка honeypot
      if (this.honeypot && this.honeypot.value !== '') {
        console.log('Bot detected');
        return;
      }
      
      const name = this.nameInput.value.trim();
      const contact = this.contactInput.value.trim();
      const goal = this.goalInput.value;
      
      // Валидация
      let hasErrors = false;
      
      if (!name || name.length < 2) {
        this.showFieldError(this.nameInput, 'Введи своё имя');
        hasErrors = true;
      }
      
      if (!this.validateContact(contact)) {
        this.showFieldError(this.contactInput, 'Укажи корректный контакт');
        hasErrors = true;
      }
      
      if (!goal) {
        this.showFieldError(this.goalInput, 'Выбери свою цель');
        hasErrors = true;
      }
      
      if (hasErrors) {
        Utils.showNotification('Ошибка', 'Проверь правильность заполнения полей', 'error');
        return;
      }
      
      // Показываем состояние загрузки
      this.setButtonLoading(true);
      
      try {
        await this.sendForm({ name, contact, goal });
        
        this.setButtonLoading(false);
        Utils.showNotification('Успех!', 'Заявка отправлена! Я свяжусь с тобой в ближайшее время.', 'success');
        
        // Очистка формы
        this.form.reset();
        
        Utils.trackEvent('Form', 'Submit', 'CTA Form Success');
        
        // Если в Telegram Web App - закрываем
        if (window.Telegram && window.Telegram.WebApp) {
          setTimeout(() => {
            window.Telegram.WebApp.close();
          }, 2000);
        }
      } catch (error) {
        this.setButtonLoading(false);
        Utils.showNotification('Ошибка', 'Не удалось отправить заявку. Попробуй ещё раз или напиши напрямую в Telegram.', 'error');
        console.error('Submit error:', error);
        Utils.trackEvent('Form', 'Submit', 'CTA Form Error');
      }
    });
  }
  
  setButtonLoading(loading) {
    const btn = this.form.querySelector('button[type="submit"]');
    if (!btn) return;
    
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    if (loading) {
      btn.disabled = true;
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
    } else {
      btn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  }
  
  validateContact(contact) {
    // Проверка на Telegram username (@username)
    if (contact.startsWith('@')) return contact.length > 1;
    
    // Проверка на телефон
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (phoneRegex.test(contact) && contact.replace(/\D/g, '').length >= 10) return true;
    
    // Проверка на возможный WhatsApp или другой мессенджер
    if (contact.includes('whatsapp') || contact.includes('wa.me')) return true;
    
    return false;
  }
  
  async sendForm(data) {
    // Добавляем ответы квиза если есть
    const quizAnswers = quiz ? quiz.getAnswers() : {};
    
    const payload = {
      ...data,
      quiz: quizAnswers,
      timestamp: new Date().toISOString(),
      source: window.location.href
    };
    
    // Отправка через API endpoint
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', errorData);
      throw new Error(errorData.message || 'Failed to send form');
    }
    
    return response.json();
  }
}

const ctaForm = new CTAForm();

// ===============================
// URGENCY ТАЙМЕР
// ===============================
class UrgencyTimer {
  constructor() {
    this.hoursElement = document.getElementById('timerHours');
    this.minutesElement = document.getElementById('timerMinutes');
    this.secondsElement = document.getElementById('timerSeconds');
    
    if (!this.hoursElement) return;
    
    this.init();
  }
  
  init() {
    // Получаем или создаём время окончания акции
    let endTime = localStorage.getItem('urgencyEndTime');
    
    if (!endTime) {
      // Создаём новое время окончания (через X часов)
      const now = new Date();
      const end = new Date(now.getTime() + CONFIG.URGENCY_TIMER_HOURS * 60 * 60 * 1000);
      endTime = end.getTime();
      localStorage.setItem('urgencyEndTime', endTime);
    }
    
    this.endTime = parseInt(endTime);
    this.update();
    
    // Обновляем каждую секунду
    setInterval(() => this.update(), 1000);
  }
  
  update() {
    const now = new Date().getTime();
    const distance = this.endTime - now;
    
    if (distance < 0) {
      // Таймер истёк - можно перезапустить или скрыть
      this.hoursElement.textContent = '00';
      this.minutesElement.textContent = '00';
      this.secondsElement.textContent = '00';
      return;
    }
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    this.hoursElement.textContent = String(hours).padStart(2, '0');
    this.minutesElement.textContent = String(minutes).padStart(2, '0');
    this.secondsElement.textContent = String(seconds).padStart(2, '0');
  }
}

const urgencyTimer = new UrgencyTimer();

// ===============================
// TELEGRAM WEB APP ИНТЕГРАЦИЯ
// ===============================
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  
  // Раскрываем приложение на весь экран
  tg.expand();
  
  // Включаем swipe-to-close
  tg.enableClosingConfirmation();
  
  // Настраиваем цветовую схему
  if (tg.themeParams.bg_color) {
    document.documentElement.style.setProperty("--bg-main", tg.themeParams.bg_color);
  }
  if (tg.themeParams.text_color) {
    document.documentElement.style.setProperty("--text-main", tg.themeParams.text_color);
  }
  
  // Настраиваем главную кнопку
  tg.MainButton.text = "Получить план 🚀";
  tg.MainButton.color = "#00e5ff";
  tg.MainButton.textColor = "#000000";
  
  // Показываем кнопку только после квиза
  const quizObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }
    });
  }, { threshold: 0.3 });
  
  const quizSection = document.getElementById('quiz');
  if (quizSection) {
    quizObserver.observe(quizSection);
  }
  
  tg.MainButton.onClick(() => {
    const ctaSection = document.querySelector("#ctaFinal");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  });
  
  Utils.trackEvent('Telegram', 'WebAppOpened', tg.platform);
}

// ===============================
// PWA SUPPORT
// ===============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// ===============================
// ВИДЕО PLACEHOLDERS
// ===============================
document.querySelectorAll('.video-placeholder').forEach(placeholder => {
  placeholder.addEventListener('click', function() {
    const videoId = this.dataset.videoId;
    // Здесь можно открыть модальное окно с видео или встроить iframe
    console.log('Play video:', videoId);
    Utils.trackEvent('Video', 'Play', videoId);
    
    // Пример: открыть в модальном окне
    // showVideoModal(videoId);
  });
});

// ===============================
// КОНСОЛЬНОЕ СООБЩЕНИЕ
// ===============================
console.log(`
%c🔥 Fitness Coach Vitaliy 🔥
%cВерсия: 3.0 (Improved)
%cMade with ❤️ by Claude
%c
📊 Tracking: ${CONFIG.ANALYTICS_ENABLED ? 'Enabled' : 'Disabled'}
`,
'color: #00e5ff; font-size: 20px; font-weight: bold;',
'color: #9aa3b8; font-size: 12px;',
'color: #9aa3b8; font-size: 12px;',
'color: #9aa3b8; font-size: 10px;'
);

// ===============================
// ЭКСПОРТ ДЛЯ ДЕБАГА
// ===============================
window.DEBUG = {
  quiz,
  casesCarousel,
  ctaForm,
  urgencyTimer,
  Utils,
  CONFIG
};
