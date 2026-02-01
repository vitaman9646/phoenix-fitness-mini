// ===============================
// КОНФИГУРАЦИЯ
// ===============================
const CONFIG = {
  BOT_TOKEN: 'YOUR_BOT_TOKEN', // Замени на свой токен бота
  CHAT_ID: 'YOUR_CHAT_ID',     // Замени на свой chat_id
  ANALYTICS_ENABLED: true
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
    
    // Здесь можно добавить интеграцию с Google Analytics, Яндекс.Метрика и т.д.
    // Пример для GA4:
    // gtag('event', action, {
    //   'event_category': category,
    //   'event_label': label
    // });
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
      const offset = 60;
      const targetPosition = target.offsetTop - offset;
      
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

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

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
// КАРУСЕЛЬ КЕЙСОВ
// ===============================
class CasesCarousel {
  constructor() {
    this.track = document.getElementById("casesTrack");
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
  }
  
  createDots() {
    this.dotsContainer.innerHTML = "";
    this.visibleSlides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "cases-dot";
      if (i === 0) dot.classList.add("active");
      this.dotsContainer.appendChild(dot);
      
      dot.addEventListener("click", () => this.goToSlide(i));
    });
  }
  
  createThumbs() {
    this.thumbsContainer.innerHTML = "";
    this.visibleSlides.forEach((slide, i) => {
      const thumb = document.createElement("div");
      thumb.className = "cases-thumb";
      const img = slide.querySelector("img[data-src]");
      if (img) {
        const thumbImg = document.createElement('img');
        thumbImg.src = img.dataset.src;
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
    
    this.dotsContainer.querySelectorAll(".cases-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === this.index);
    });
    
    this.thumbsContainer.querySelectorAll(".cases-thumb").forEach((thumb, i) => {
      thumb.classList.toggle("active", i === this.index);
    });
    
    const progress = ((this.index + 1) / this.visibleSlides.length) * 100;
    this.progressBar.style.width = progress + "%";
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
    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());
    
    // Свайп
    let startX = 0;
    
    this.track.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });
    
    this.track.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 50) this.prev();
      if (startX - endX > 50) this.next();
    });
    
    // Клавиатура
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  }
  
  loadImages() {
    const images = document.querySelectorAll('.case-photo img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => {
            img.classList.add('loaded');
          };
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

const casesCarousel = new CasesCarousel();

// ===============================
// ФИЛЬТРЫ КЕЙСОВ
// ===============================
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    const filter = btn.dataset.filter;
    casesCarousel.filterSlides(filter);
    
    Utils.trackEvent('Cases', 'Filter', filter);
  });
});

// ===============================
// УМНЫЙ КВИЗ С СОХРАНЕНИЕМ ДАННЫХ
// ===============================
class Quiz {
  constructor() {
    this.root = document.getElementById("quizRoot");
    this.steps = this.root.querySelectorAll(".quiz-step");
    this.progress = document.getElementById("quizProgress");
    this.backBtn = document.getElementById("quizBackBtn");
    this.restartBtn = document.getElementById("quizRestart");
    
    this.currentStep = 1;
    this.totalSteps = 4;
    this.answers = {};
    
    this.init();
  }
  
  init() {
    this.setupListeners();
    this.updateProgress();
  }
  
  setupListeners() {
    this.root.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => {
        const step = btn.closest('.quiz-step').dataset.step;
        const value = btn.dataset.value;
        const nextStep = btn.dataset.next;
        
        this.answers[`step${step}`] = value;
        
        if (nextStep === 'result') {
          this.showResult();
        } else {
          this.currentStep = parseInt(nextStep);
          this.showStep(this.currentStep);
        }
        
        Utils.trackEvent('Quiz', 'Answer', `Step ${step}: ${value}`);
      });
    });
    
    this.backBtn.addEventListener('click', () => {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.showStep(this.currentStep);
      }
    });
    
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.restart();
      });
    }
  }
  
  showStep(stepNum) {
    this.steps.forEach(step => step.classList.remove("active"));
    const targetStep = this.root.querySelector(`[data-step="${stepNum}"]`);
    if (targetStep) {
      targetStep.classList.add("active");
    }
    
    this.backBtn.style.display = stepNum > 1 ? 'block' : 'none';
    this.updateProgress();
  }
  
  updateProgress() {
    const progressPercent = (this.currentStep / this.totalSteps) * 100;
    this.progress.style.width = progressPercent + "%";
  }
  
  showResult() {
    this.steps.forEach(step => step.classList.remove("active"));
    const resultStep = this.root.querySelector('[data-step="result"]');
    resultStep.classList.add("active");
    
    this.backBtn.style.display = 'none';
    this.progress.style.width = "100%";
    
    // Генерация персонализированного текста
    const resultText = this.generatePersonalizedResult();
    document.getElementById('quizResultText').innerHTML = resultText;
    
    Utils.trackEvent('Quiz', 'Complete', JSON.stringify(this.answers));
  }
  
  generatePersonalizedResult() {
    const goal = this.answers.step1;
    const place = this.answers.step2;
    const frequency = this.answers.step3;
    const level = this.answers.step4;
    
    const goalText = {
      loss: 'похудение и подтяжку тела',
      gain: 'набор мышечной массы',
      tone: 'повышение тонуса и выносливости'
    };
    
    const placeText = {
      home: 'тренировок дома',
      gym: 'тренировок в зале',
      both: 'комбинированных тренировок'
    };
    
    const levelText = {
      beginner: 'новичков',
      middle: 'продолжающих',
      advanced: 'продвинутых атлетов'
    };
    
    return `
      <p>
        <strong>Твоя цель:</strong> ${goalText[goal]}<br>
        <strong>Место:</strong> ${placeText[place]}<br>
        <strong>Частота:</strong> ${frequency} раза в неделю<br>
        <strong>Уровень:</strong> ${levelText[level]}
      </p>
      <p style="margin-top: 16px;">
        Я подготовлю для тебя персональную программу с учётом всех этих параметров. 
        Тренировки будут короткими (25-40 минут), но максимально эффективными.
      </p>
    `;
  }
  
  restart() {
    this.currentStep = 1;
    this.answers = {};
    this.showStep(1);
    Utils.trackEvent('Quiz', 'Restart', '');
  }
  
  getAnswers() {
    return this.answers;
  }
}

const quiz = new Quiz();

// ===============================
// FAQ
// ===============================
document.querySelectorAll(".faq-item").forEach(item => {
  const question = item.querySelector(".faq-question");
  
  question.addEventListener("click", () => {
    const wasActive = item.classList.contains('active');
    
    // Закрываем все
    document.querySelectorAll(".faq-item").forEach(other => {
      other.classList.remove("active");
    });
    
    // Переключаем текущий
    if (!wasActive) {
      item.classList.add("active");
      Utils.trackEvent('FAQ', 'Open', question.textContent.trim());
    }
  });
});

// ===============================
// ФОРМА CTA С АВТОЗАПОЛНЕНИЕМ
// ===============================
class CTAForm {
  constructor() {
    this.form = document.getElementById('ctaForm');
    this.nameInput = document.getElementById('inputName');
    this.contactInput = document.getElementById('inputContact');
    
    this.init();
  }
  
  init() {
    this.autoFillFromTelegram();
    this.setupSubmit();
  }
  
  autoFillFromTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe.user;
      
      if (user) {
        if (user.first_name) {
          this.nameInput.value = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        }
        
        if (user.username) {
          this.contactInput.value = '@' + user.username;
        }
      }
    }
  }
  
  setupSubmit() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = this.nameInput.value.trim();
      const contact = this.contactInput.value.trim();
      
      if (!name || !contact) {
        Utils.showNotification('Ошибка', 'Пожалуйста, заполни все поля!', 'error');
        return;
      }
      
      // Валидация контакта
      if (!this.validateContact(contact)) {
        Utils.showNotification('Ошибка', 'Укажи корректный контакт (Telegram, WhatsApp или телефон)', 'error');
        return;
      }
      
      Utils.toggleLoader(true);
      
      try {
        await this.sendToTelegram(name, contact);
        
        Utils.toggleLoader(false);
        Utils.showNotification('Успех!', 'Заявка отправлена! Я свяжусь с тобой в ближайшее время.', 'success');
        
        this.nameInput.value = '';
        this.contactInput.value = '';
        
        Utils.trackEvent('Form', 'Submit', 'CTA Form');
        
        // Если в Telegram Web App - закрываем
        if (window.Telegram && window.Telegram.WebApp) {
          setTimeout(() => {
            window.Telegram.WebApp.close();
          }, 2000);
        }
      } catch (error) {
        Utils.toggleLoader(false);
        Utils.showNotification('Ошибка', 'Не удалось отправить заявку. Попробуй ещё раз.', 'error');
        console.error('Submit error:', error);
      }
    });
  }
  
  validateContact(contact) {
    // Проверка на Telegram username (@username)
    if (contact.startsWith('@')) return contact.length > 1;
    
    // Проверка на телефон (простая)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (phoneRegex.test(contact) && contact.replace(/\D/g, '').length >= 10) return true;
    
    return false;
  }
  
  async sendToTelegram(name, contact) {
    const quizAnswers = quiz.getAnswers();
    
    let message = `🎯 <b>Новая заявка!</b>\n\n`;
    message += `👤 <b>Имя:</b> ${name}\n`;
    message += `📱 <b>Контакт:</b> ${contact}\n\n`;
    
    if (Object.keys(quizAnswers).length > 0) {
      message += `📋 <b>Ответы на квиз:</b>\n`;
      
      const goalMap = { loss: 'Похудение', gain: 'Набор массы', tone: 'Тонус' };
      const placeMap = { home: 'Дома', gym: 'Зал', both: 'Дома и в зале' };
      const levelMap = { beginner: 'Новичок', middle: 'Продолжающий', advanced: 'Продвинутый' };
      
      if (quizAnswers.step1) message += `• Цель: ${goalMap[quizAnswers.step1]}\n`;
      if (quizAnswers.step2) message += `• Место: ${placeMap[quizAnswers.step2]}\n`;
      if (quizAnswers.step3) message += `• Частота: ${quizAnswers.step3} раза/нед\n`;
      if (quizAnswers.step4) message += `• Уровень: ${levelMap[quizAnswers.step4]}\n`;
    }
    
    // Отправка в Telegram через Bot API
    const response = await fetch(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CONFIG.CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  }
}

const ctaForm = new CTAForm();

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
  
  // Отслеживание событий
  tg.onEvent('viewportChanged', () => {
    Utils.trackEvent('Telegram', 'ViewportChanged', tg.viewportHeight);
  });
  
  Utils.trackEvent('Telegram', 'WebAppOpened', tg.platform);
}

// ===============================
// RATE LIMITING ДЛЯ ФОРМЫ
// ===============================
const RateLimiter = {
  storage: {},
  
  canSubmit(key, limit = 3, window = 60000) {
    const now = Date.now();
    
    if (!this.storage[key]) {
      this.storage[key] = [];
    }
    
    // Удаляем старые записи
    this.storage[key] = this.storage[key].filter(time => now - time < window);
    
    if (this.storage[key].length >= limit) {
      return false;
    }
    
    this.storage[key].push(now);
    return true;
  }
};

// ===============================
// PWA SUPPORT
// ===============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

// ===============================
// КОНСОЛЬНОЕ СООБЩЕНИЕ
// ===============================
console.log(`
%c🔥 Fitness Coach Vitaliy 🔥
%cВерсия: 2.0
%cМade with ❤️ by Claude
`,
'color: #00e5ff; font-size: 20px; font-weight: bold;',
'color: #9aa3b8; font-size: 12px;',
'color: #9aa3b8; font-size: 12px;'
);

// ===============================
// ЭКСПОРТ ДЛЯ ДЕБАГА
// ===============================
window.DEBUG = {
  quiz,
  casesCarousel,
  ctaForm,
  Utils,
  CONFIG
};
