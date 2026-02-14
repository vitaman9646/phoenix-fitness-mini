/* ========================================
   APP V2 — Telegram Mini App
   ======================================== */

(function () {
  'use strict';

  // ==========================================
  // 1. TELEGRAM WEBAPP INIT
  // ==========================================
  const tg = window.Telegram?.WebApp;
  const isTelegram = !!tg;

  if (isTelegram) {
    tg.ready();
    tg.expand();
  }

  // ==========================================
  // 2. THEME MANAGEMENT
  // ==========================================
  const ThemeManager = {
    init() {
      if (isTelegram) {
        this.applyTelegramTheme();
        tg.onEvent('themeChanged', () => this.applyTelegramTheme());
      } else {
        const saved = localStorage.getItem('theme');
        this.setTheme(saved || 'dark');
      }
    },

    applyTelegramTheme() {
      const isDark = tg.colorScheme === 'dark';
      this.setTheme(isDark ? 'dark' : 'light');

      const root = document.documentElement.style;
      const params = tg.themeParams;

      if (params.bg_color) root.setProperty('--tg-bg', params.bg_color);
      if (params.text_color) root.setProperty('--tg-text', params.text_color);
      if (params.button_color) root.setProperty('--tg-button', params.button_color);
      if (params.button_text_color) root.setProperty('--tg-button-text', params.button_text_color);
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  };

  // ==========================================
  // 3. HAPTIC FEEDBACK
  // ==========================================
  const Haptic = {
    light() {
      if (isTelegram && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    },
    medium() {
      if (isTelegram && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
      }
    },
    success() {
      if (isTelegram && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
    },
    error() {
      if (isTelegram && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('error');
      }
    }
  };

  // ==========================================
  // 4. NOTIFICATION SYSTEM
  // ==========================================
  const Notify = {
    container: null,

    init() {
      this.container = document.getElementById('notificationContainer');
    },

    show(message, type = 'info', duration = 4000) {
      if (!this.container) return;

      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };

      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <span class="notification-icon">${icons[type]}</span>
        <span class="notification-text">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
      `;

      this.container.appendChild(notification);

      setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
      }, duration);
    }
  };

  // ==========================================
  // 5. MODAL SYSTEM
  // ==========================================
  const Modal = {
    overlay: null,
    content: null,
    closeBtn: null,

    init() {
      this.overlay = document.getElementById('modalOverlay');
      this.content = document.getElementById('modalContent');
      this.closeBtn = document.getElementById('modalClose');

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.close());
      }

      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) this.close();
        });
      }
    },

    open(html) {
      if (!this.overlay || !this.content) return;
      this.content.innerHTML = html;
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      Haptic.light();
    },

    close() {
      if (!this.overlay) return;
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ==========================================
  // 6. SKELETON LOADER
  // ==========================================
  function hideSkeleton() {
    const skeleton = document.getElementById('skeletonOverlay');
    if (skeleton) {
      skeleton.classList.add('hidden');
      setTimeout(() => skeleton.remove(), 400);
    }
  }

  // ==========================================
  // 7. SCROLL ANIMATIONS (reveal)
  // ==========================================
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ==========================================
  // 8. SMOOTH SCROLL
  // ==========================================
  function initSmoothScroll() {
    document.querySelectorAll('[data-scroll-target]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(btn.dataset.scrollTarget);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          Haptic.light();
        }
      });
    });
  }

  // ==========================================
  // 9. STAT COUNTERS
  // ==========================================
  function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const isFloat = target % 1 !== 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = isFloat ? target.toFixed(1) : target;
      }
    }

    requestAnimationFrame(update);
  }

  // ==========================================
  // 10. LAZY LOADING IMAGES
  // ==========================================
  function initLazyImages() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const parent = img.closest('.case-photo') || img.parentElement;

            parent.classList.add('loading');

            img.onload = () => {
              parent.classList.remove('loading');
              parent.classList.add('loaded');
            };

            img.onerror = () => {
              parent.classList.remove('loading');
              parent.classList.add('error');
            };

            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '100px' }
    );

    images.forEach((img) => observer.observe(img));
  }

  // ==========================================
  // 11. CASES CAROUSEL
  // ==========================================
  const CasesCarousel = {
    slides: [],
    current: 0,
    filteredSlides: [],

    init() {
      this.slides = Array.from(document.querySelectorAll('.case-slide'));
      this.filteredSlides = [...this.slides];
      if (!this.slides.length) return;

      this.buildDots();
      this.bindControls();
      this.bindFilters();
      this.updateView();
    },

    buildDots() {
      const dotsContainer = document.getElementById('casesDots');
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';

      this.filteredSlides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = `cases-dot${i === 0 ? ' active' : ''}`;
        dot.addEventListener('click', () => {
          this.goTo(i);
          Haptic.light();
        });
        dotsContainer.appendChild(dot);
      });
    },

    bindControls() {
      const prev = document.getElementById('casesPrev');
      const next = document.getElementById('casesNext');

      if (prev) {
        prev.addEventListener('click', () => {
          this.goTo(this.current - 1);
          Haptic.light();
        });
      }
      if (next) {
        next.addEventListener('click', () => {
          this.goTo(this.current + 1);
          Haptic.light();
        });
      }

      // Swipe support
      const track = document.getElementById('casesTrack');
      if (track) {
        let startX = 0;
        let diff = 0;

        track.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
        }, { passive: true });

        track.addEventListener('touchmove', (e) => {
          diff = e.touches[0].clientX - startX;
        }, { passive: true });

        track.addEventListener('touchend', () => {
          if (Math.abs(diff) > 50) {
            if (diff < 0) this.goTo(this.current + 1);
            else this.goTo(this.current - 1);
            Haptic.light();
          }
          diff = 0;
        });
      }
    },

    bindFilters() {
      document.querySelectorAll('.cases-filters .filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.cases-filters .filter-btn').forEach((b) =>
            b.classList.remove('active')
          );
          btn.classList.add('active');

          const filter = btn.dataset.filter;

          if (filter === 'all') {
            this.filteredSlides = [...this.slides];
          } else {
            this.filteredSlides = this.slides.filter((s) =>
              s.dataset.tags.includes(filter)
            );
          }

          this.slides.forEach((s) => {
            s.style.display = 'none';
            s.classList.remove('active');
          });

          this.current = 0;
          this.buildDots();
          this.updateView();
          Haptic.light();
        });
      });
    },

    goTo(index) {
      if (this.filteredSlides.length === 0) return;
      this.current =
        (index + this.filteredSlides.length) % this.filteredSlides.length;
      this.updateView();
    },

    updateView() {
      this.slides.forEach((s) => {
        s.style.display = 'none';
        s.classList.remove('active');
      });

      if (this.filteredSlides[this.current]) {
        this.filteredSlides[this.current].style.display = 'block';
        this.filteredSlides[this.current].classList.add('active');
      }

      // Update dots
      document.querySelectorAll('.cases-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === this.current);
      });

      // Update progress
      const progress = document.getElementById('casesProgress');
      if (progress && this.filteredSlides.length > 0) {
        progress.style.width =
          ((this.current + 1) / this.filteredSlides.length) * 100 + '%';
      }
    }
  };

  // ==========================================
  // 12. QUIZ
  // ==========================================
  const Quiz = {
    answers: {},
    history: [],

    init() {
      this.loadSaved();
      this.bindOptions();
      this.bindBack();
      this.bindRestart();
      this.bindShare();
      this.bindDownload();
    },

    loadSaved() {
      const saved = sessionStorage.getItem('quizAnswers');
      const savedStep = sessionStorage.getItem('quizStep');

      if (saved && savedStep && savedStep !== '1' && savedStep !== 'result') {
        this.answers = JSON.parse(saved);

        if (isTelegram) {
          tg.showConfirm(
            'Продолжить квиз с того места, где остановился?',
            (confirmed) => {
              if (confirmed) {
                this.goToStep(savedStep);
              } else {
                this.reset();
              }
            }
          );
        }
      }
    },

    bindOptions() {
      document.querySelectorAll('.quiz-option').forEach((opt) => {
        opt.addEventListener('click', () => {
          const step = opt.closest('.quiz-step');
          const stepNum = step.dataset.step;
          const value = opt.dataset.value;
          const next = opt.dataset.next;

          // Highlight selection
          step.querySelectorAll('.quiz-option').forEach((o) =>
            o.classList.remove('selected')
          );
          opt.classList.add('selected');

          this.answers[`step_${stepNum}`] = value;
          this.history.push(stepNum);

          sessionStorage.setItem('quizAnswers', JSON.stringify(this.answers));
          sessionStorage.setItem('quizStep', next);

          Haptic.medium();

          setTimeout(() => {
            this.goToStep(next);
          }, 300);
        });
      });
    },

    goToStep(step) {
      document.querySelectorAll('.quiz-step').forEach((s) =>
        s.classList.remove('active')
      );

      const target = document.querySelector(`.quiz-step[data-step="${step}"]`);
      if (target) target.classList.add('active');

      // Progress bar
      const progress = document.getElementById('quizProgress');
      if (progress) {
        const steps = { '1': 25, '2': 50, '3': 75, '4': 100, result: 100 };
        progress.style.width = (steps[step] || 0) + '%';
      }

      // Back button
      const backBtn = document.getElementById('quizBackBtn');
      if (backBtn) {
        backBtn.style.display = step === '1' ? 'none' : 'block';
      }

      // Telegram BackButton
      if (isTelegram) {
        if (step !== '1' && step !== 'result') {
          tg.BackButton.show();
        } else {
          tg.BackButton.hide();
        }
      }

      if (step === 'result') {
        this.showResult();
      }
    },

    showResult() {
      const goal = this.answers.step_1;
      const place = this.answers.step_2;
      const freq = this.answers.step_3;
      const level = this.answers.step_4;

      const goalText = { loss: 'похудение', gain: 'набор массы', tone: 'тонус и здоровье' };
      const placeText = { home: 'дома', gym: 'в зале', both: 'дома и в зале' };
      const levelText = { beginner: 'новичок', middle: 'средний', advanced: 'уверенный' };

      const resultEl = document.getElementById('quizResultText');
      if (resultEl) {
        resultEl.innerHTML = `
          <div style="margin-bottom: 1rem;">
            <strong>Цель:</strong> ${goalText[goal] || goal}<br>
            <strong>Место:</strong> ${placeText[place] || place}<br>
            <strong>Частота:</strong> ${freq} раз/нед<br>
            <strong>Уровень:</strong> ${levelText[level] || level}
          </div>
          <p>Тебе подойдёт тариф <strong>${goal === 'tone' ? '«Базовый»' : '«Оптимальный»'}</strong> — 
          с чатом и корректировками для максимального результата.</p>
        `;
      }

      // Build week plan
      this.buildWeekPlan(goal, place, freq, level);

      // Pre-fill form
      this.prefillForm();

      // Track
      Analytics.track('quiz_complete', this.answers);
    },

    buildWeekPlan(goal, place, freq, level) {
      const planEl = document.getElementById('quizWeekPlan');
      if (!planEl) return;

      const workouts = {
        loss: {
          home: ['HIIT 25 мин', 'Силовая верх', 'Кардио 30 мин', 'Силовая низ', 'HIIT 25 мин'],
          gym: ['Силовая верх + кардио', 'Ноги + ягодицы', 'Кардио 40 мин', 'Спина + руки', 'Full body'],
          both: ['Зал: силовая верх', 'Дома: HIIT 25 мин', 'Зал: ноги', 'Дома: кардио', 'Зал: full body']
        },
        gain: {
          home: ['Отжимания + брусья', 'Ноги + прыжки', 'Спина + подтяг.', 'Плечи + руки', 'Full body'],
          gym: ['Грудь + трицепс', 'Спина + бицепс', 'Ноги', 'Плечи + руки', 'Full body'],
          both: ['Зал: грудь', 'Дома: core', 'Зал: спина', 'Дома: кардио', 'Зал: ноги']
        },
        tone: {
          home: ['Йога 30 мин', 'Силовая лёгкая', 'Растяжка', 'Функционалка', 'Йога'],
          gym: ['Кардио + силовая', 'Функционалка', 'Бассейн/кардио', 'Силовая лёгкая', 'Растяжка'],
          both: ['Зал: кардио', 'Дома: йога', 'Зал: силовая', 'Дома: растяжка', 'Зал: функц.']
        }
      };

      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const planWorkouts = workouts[goal]?.[place] || workouts.loss.home;
      const freqNum = parseInt(freq) || 3;

      let html = '<div class="week-plan-title">📅 Примерный план на неделю:</div>';

      let workoutIndex = 0;
      days.forEach((day, i) => {
        if (workoutIndex < freqNum && (i < 5 || freqNum > 5)) {
          html += `
            <div class="week-plan-day">
              <span class="week-plan-day-name">${day}</span>
              <span class="week-plan-day-workout">${planWorkouts[workoutIndex % planWorkouts.length]}</span>
            </div>`;
          workoutIndex++;
        } else {
          html += `
            <div class="week-plan-day">
              <span class="week-plan-day-name">${day}</span>
              <span class="week-plan-day-rest">Отдых</span>
            </div>`;
        }
      });

      planEl.innerHTML = html;
    },

    prefillForm() {
      const goalMap = { loss: 'loss', gain: 'gain', tone: 'tone' };
      const goalSelect = document.getElementById('inputGoal');
      if (goalSelect && this.answers.step_1) {
        goalSelect.value = goalMap[this.answers.step_1] || '';
      }
    },

    bindBack() {
      const backBtn = document.getElementById('quizBackBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (this.history.length > 0) {
            const prev = this.history.pop();
            this.goToStep(prev);
            Haptic.light();
          }
        });
      }

      if (isTelegram) {
        tg.BackButton.onClick(() => {
          if (this.history.length > 0) {
            const prev = this.history.pop();
            this.goToStep(prev);
          } else {
            tg.BackButton.hide();
          }
        });
      }
    },

    bindRestart() {
      const restartBtn = document.getElementById('quizRestart');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.reset();
          Haptic.light();
        });
      }
    },

    bindShare() {
      const shareBtn = document.getElementById('shareQuizResult');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          const goalText = {
            loss: 'похудение',
            gain: 'набор массы',
            tone: 'тонус'
          };
          const text = `Прошёл квиз у фитнес-тренера Виталия!\nМоя цель: ${goalText[this.answers.step_1] || ''}. Попробуй тоже! 💪`;

          if (isTelegram) {
            tg.openTelegramLink(
              `https://t.me/share/url?url=${encodeURIComponent('https://t.me/your_bot/app')}&text=${encodeURIComponent(text)}`
            );
          } else {
            if (navigator.share) {
              navigator.share({ title: 'Фитнес квиз', text });
            } else {
              navigator.clipboard.writeText(text);
              Notify.show('Скопировано в буфер!', 'success');
            }
          }

          Haptic.success();
          Analytics.track('quiz_share');
        });
      }
    },

    bindDownload() {
      const downloadBtn = document.getElementById('downloadBonus');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          // В реальном приложении — ссылка на файл
          Notify.show('Бонус отправлен тебе в Telegram! 📩', 'success');
          Haptic.success();

          if (isTelegram) {
            tg.sendData(
              JSON.stringify({
                action: 'download_bonus',
                quiz: this.answers
              })
            );
          }

          Analytics.track('bonus_download');
        });
      }
    },

    reset() {
      this.answers = {};
      this.history = [];
      sessionStorage.removeItem('quizAnswers');
      sessionStorage.removeItem('quizStep');
      this.goToStep('1');
    }
  };

  // ==========================================
  // 13. EXERCISE LIBRARY
  // ==========================================
  const ExerciseLibrary = {
    exercises: [
      {
        id: 1,
        name: 'Приседания',
        muscle: 'Ноги',
        category: 'legs',
        difficulty: 'easy',
        icon: '🦵',
        description: 'Базовое упражнение для ног и ягодиц.',
        tips: [
          'Колени не выходят за носки',
          'Спина прямая, взгляд вперёд',
          'Опускайся до параллели бёдер с полом',
          'Вдох на спуске, выдох на подъёме'
        ]
      },
      {
        id: 2,
        name: 'Отжимания',
        muscle: 'Грудь',
        category: 'chest',
        difficulty: 'easy',
        icon: '💪',
        description: 'Классическое упражнение для грудных мышц и трицепсов.',
        tips: [
          'Тело — прямая линия от головы до пят',
          'Локти под углом 45° к корпусу',
          'Грудь опускается почти до пола',
          'Не прогибай поясницу'
        ]
      },
      {
        id: 3,
        name: 'Подтягивания',
        muscle: 'Спина',
        category: 'back',
        difficulty: 'hard',
        icon: '🏋️',
        description: 'Лучшее упражнение для широчайших мышц спины.',
        tips: [
          'Хват чуть шире плеч',
          'Тяни грудь к перекладине',
          'Своди лопатки в верхней точке',
          'Полное разгибание рук внизу'
        ]
      },
      {
        id: 4,
        name: 'Планка',
        muscle: 'Пресс',
        category: 'core',
        difficulty: 'easy',
        icon: '🧘',
        description: 'Статическое упражнение для укрепления кора.',
        tips: [
          'Тело прямая линия',
          'Не поднимай и не опускай таз',
          'Напряги пресс и ягодицы',
          'Дыши ровно, не задерживай дыхание'
        ]
      },
      {
        id: 5,
        name: 'Сгибания на бицепс',
        muscle: 'Руки',
        category: 'arms',
        difficulty: 'easy',
        icon: '💪',
        description: 'Изолированное упражнение для бицепсов.',
        tips: [
          'Локти прижаты к корпусу',
          'Не раскачивай тело',
          'Медленно опускай вес',
          'Полная амплитуда движения'
        ]
      },
      {
        id: 6,
        name: 'Выпады',
        muscle: 'Ноги',
        category: 'legs',
        difficulty: 'medium',
        icon: '🦵',
        description: 'Упражнение для ног и ягодиц с акцентом на баланс.',
        tips: [
          'Шаг достаточно широкий',
          'Колено задней ноги почти касается пола',
          'Корпус вертикальный',
          'Переднее колено не выходит за носок'
        ]
      },
      {
        id: 7,
        name: 'Жим лёжа',
        muscle: 'Грудь',
        category: 'chest',
        difficulty: 'medium',
        icon: '🏋️',
        description: 'Базовое упражнение для грудных мышц.',
        tips: [
          'Сведи лопатки и упрись в скамью',
          'Хват чуть шире плеч',
          'Штанга опускается к нижней части груди',
          'Не отрывай таз от скамьи'
        ]
      },
      {
        id: 8,
        name: 'Тяга в наклоне',
        muscle: 'Спина',
        category: 'back',
        difficulty: 'medium',
        icon: '🏋️',
        description: 'Упражнение для толщины спины.',
        tips: [
          'Наклон корпуса 45°',
          'Тяни к поясу, не к груди',
          'Своди лопатки в верхней точке',
          'Спина прямая, без округления'
        ]
      },
      {
        id: 9,
        name: 'Скручивания',
        muscle: 'Пресс',
        category: 'core',
        difficulty: 'easy',
        icon: '🧘',
        description: 'Классическое упражнение для верхнего пресса.',
        tips: [
          'Не тяни голову руками',
          'Отрывай лопатки от пола',
          'Выдох на подъёме',
          'Медленный контролируемый спуск'
        ]
      },
      {
        id: 10,
        name: 'Бёрпи',
        muscle: 'Всё тело',
        category: 'core',
        difficulty: 'hard',
        icon: '🔥',
        description: 'Высокоинтенсивное упражнение для всего тела.',
        tips: [
          'Выполняй плавно, без рывков',
          'Грудь касается пола в нижней точке',
          'Полное разгибание в прыжке',
          'Начинай медленно, ускоряйся по мере подготовки'
        ]
      },
      {
        id: 11,
        name: 'Французский жим',
        muscle: 'Руки',
        category: 'arms',
        difficulty: 'medium',
        icon: '💪',
        description: 'Изолированное упражнение для трицепсов.',
        tips: [
          'Локти направлены в потолок',
          'Не разводи локти в стороны',
          'Медленное опускание',
          'Полное разгибание наверху'
        ]
      },
      {
        id: 12,
        name: 'Становая тяга',
        muscle: 'Спина',
        category: 'back',
        difficulty: 'hard',
        icon: '🏋️',
        description: 'Базовое упражнение для задней цепи.',
        tips: [
          'Спина нейтральная, без округления',
          'Штанга движется вдоль тела',
          'Отталкивайся ногами от пола',
          'Начни с малого веса для освоения техники'
        ]
      }
    ],

    init() {
      this.render();
      this.bindFilters();
      this.bindSearch();
    },

    render(filtered = null) {
      const grid = document.getElementById('exerciseGrid');
      if (!grid) return;

      const items = filtered || this.exercises;

      if (items.length === 0) {
        grid.innerHTML =
          '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1">Ничего не найдено</p>';
        return;
      }

      grid.innerHTML = items
        .map(
          (ex) => `
        <div class="exercise-card" data-id="${ex.id}" data-category="${ex.category}">
          <div class="exercise-card-icon">${ex.icon}</div>
          <div class="exercise-card-name">${ex.name}</div>
          <div class="exercise-card-muscle">${ex.muscle}</div>
          <div class="exercise-card-difficulty difficulty-${ex.difficulty}">
            ${ex.difficulty === 'easy' ? 'Лёгкое' : ex.difficulty === 'medium' ? 'Среднее' : 'Сложное'}
          </div>
        </div>
      `
        )
        .join('');

      // Bind click
      grid.querySelectorAll('.exercise-card').forEach((card) => {
        card.addEventListener('click', () => {
          const id = parseInt(card.dataset.id);
          this.showDetail(id);
          Haptic.light();
        });
      });
    },

    showDetail(id) {
      const ex = this.exercises.find((e) => e.id === id);
      if (!ex) return;

      Modal.open(`
        <div class="exercise-detail">
          <div class="exercise-detail-icon">${ex.icon}</div>
          <div class="exercise-detail-name">${ex.name}</div>
          <div class="exercise-detail-muscle">${ex.muscle} • ${
        ex.difficulty === 'easy'
          ? 'Лёгкое'
          : ex.difficulty === 'medium'
          ? 'Среднее'
          : 'Сложное'
      }</div>
          <div class="exercise-detail-desc">${ex.description}</div>
          <div class="exercise-detail-tips">
            <h4>Советы по технике:</h4>
            <ul>
              ${ex.tips.map((t) => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        </div>
      `);

      Analytics.track('exercise_view', { name: ex.name });
    },

    bindFilters() {
      document.querySelectorAll('[data-exercise-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document
            .querySelectorAll('[data-exercise-filter]')
            .forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          const filter = btn.dataset.exerciseFilter;
          const filtered =
            filter === 'all'
              ? this.exercises
              : this.exercises.filter((e) => e.category === filter);

          this.render(filtered);
          Haptic.light();
        });
      });
    },

    bindSearch() {
      const input = document.getElementById('exerciseSearch');
      if (!input) return;

      let debounceTimer;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = input.value.toLowerCase().trim();
          if (!query) {
            this.render();
            return;
          }
          const filtered = this.exercises.filter(
            (e) =>
              e.name.toLowerCase().includes(query) ||
              e.muscle.toLowerCase().includes(query)
          );
          this.render(filtered);
        }, 300);
      });
    }
  };

  // ==========================================
  // 14. KBJU CALCULATOR
  // ==========================================
  const Calculator = {
    gender: 'male',

    init() {
      this.bindGenderToggle();
      this.bindForm();
    },

    bindGenderToggle() {
      document.querySelectorAll('[data-gender]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document
            .querySelectorAll('[data-gender]')
            .forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.gender = btn.dataset.gender;
          Haptic.light();
        });
      });
    },

    bindForm() {
      const form = document.getElementById('calcForm');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculate();
        Haptic.success();
      });
    },

    calculate() {
      const age = parseInt(document.getElementById('calcAge').value);
      const weight = parseFloat(document.getElementById('calcWeight').value);
      const height = parseFloat(document.getElementById('calcHeight').value);
      const activity = parseFloat(document.getElementById('calcActivity').value);
      const goal = document.getElementById('calcGoal').value;

      if (!age || !weight || !height) {
        Notify.show('Заполни все поля', 'warning');
        return;
      }

      // Mifflin-St Jeor
      let bmr;
      if (this.gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      let tdee = bmr * activity;

      // Goal adjustment
      const multipliers = { loss: 0.8, maintain: 1, gain: 1.15 };
      const calories = Math.round(tdee * (multipliers[goal] || 1));

      // Macros
      const proteinPerKg = goal === 'gain' ? 2.2 : goal === 'loss' ? 2.0 : 1.8;
      const protein = Math.round(weight * proteinPerKg);
      const fat = Math.round((calories * 0.25) / 9);
      const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

      // Display
      this.animateValue('calcCalories', calories);
      this.animateValue('calcProtein', protein);
      this.animateValue('calcFat', fat);
      this.animateValue('calcCarbs', Math.max(carbs, 0));

      const result = document.getElementById('calcResult');
      if (result) {
        result.style.display = 'block';
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      Analytics.track('calculator_used', { goal, calories });
    },

    animateValue(elementId, target) {
      const el = document.getElementById(elementId);
      if (!el) return;

      const duration = 800;
      const start = performance.now();
      const startVal = parseInt(el.textContent) || 0;

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(startVal + (target - startVal) * eased);

        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }
  };

  // ==========================================
  // 15. WORKOUT TIMER
  // ==========================================
  const WorkoutTimer = {
    seconds: 30,
    remaining: 30,
    interval: null,
    isRunning: false,
    sets: 0,

    init() {
      this.bindPresets();
      this.bindControls();
      this.bindSets();
      this.updateDisplay();
    },

    bindPresets() {
      document.querySelectorAll('.timer-preset').forEach((btn) => {
        btn.addEventListener('click', () => {
          document
            .querySelectorAll('.timer-preset')
            .forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          this.seconds = parseInt(btn.dataset.seconds);
          this.remaining = this.seconds;
          this.stop();
          this.updateDisplay();
          Haptic.light();
        });
      });
    },

    bindControls() {
      const startBtn = document.getElementById('timerStart');
      const pauseBtn = document.getElementById('timerPause');
      const resetBtn = document.getElementById('timerReset');

      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.start();
          Haptic.medium();
        });
      }

      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
          this.stop();
          Haptic.light();
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.reset();
          Haptic.light();
        });
      }
    },

    bindSets() {
      const increase = document.getElementById('setsIncrease');
      const decrease = document.getElementById('setsDecrease');

      if (increase) {
        increase.addEventListener('click', () => {
          this.sets++;
          this.updateSets();
          Haptic.light();
        });
      }

      if (decrease) {
        decrease.addEventListener('click', () => {
          if (this.sets > 0) {
            this.sets--;
            this.updateSets();
            Haptic.light();
          }
        });
      }
    },

    start() {
      if (this.isRunning) return;
      this.isRunning = true;

      const startBtn = document.getElementById('timerStart');
      const pauseBtn = document.getElementById('timerPause');
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';

      this.interval = setInterval(() => {
        this.remaining--;
        this.updateDisplay();

        if (this.remaining <= 5 && this.remaining > 0) {
          const display = document.getElementById('timerDisplay');
          if (display) display.classList.add('timer-warning');
          Haptic.light();
        }

        if (this.remaining <= 0) {
          this.done();
        }
      }, 1000);
    },

    stop() {
      this.isRunning = false;
      clearInterval(this.interval);

      const startBtn = document.getElementById('timerStart');
      const pauseBtn = document.getElementById('timerPause');
      if (startBtn) startBtn.style.display = 'inline-flex';
      if (pauseBtn) pauseBtn.style.display = 'none';
    },

    reset() {
      this.stop();
      this.remaining = this.seconds;
      this.updateDisplay();

      const display = document.getElementById('timerDisplay');
      if (display) {
        display.classList.remove('timer-warning', 'timer-done');
      }
    },

    done() {
      this.stop();
      this.sets++;
      this.updateSets();

      const display = document.getElementById('timerDisplay');
      if (display) {
        display.classList.remove('timer-warning');
        display.classList.add('timer-done');
      }

      Haptic.success();
      Notify.show(`Подход ${this.sets} завершён! 💪`, 'success', 3000);

      // Auto-reset after 2 seconds
      setTimeout(() => this.reset(), 2000);
    },

    updateDisplay() {
      const display = document.getElementById('timerDisplay');
      if (!display) return;

      const mins = Math.floor(this.remaining / 60);
      const secs = this.remaining % 60;
      display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    updateSets() {
      const el = document.getElementById('setsCount');
      if (el) el.textContent = this.sets;
    }
  };

  // ==========================================
  // 16. FAQ SEARCH & FILTERS
  // ==========================================
  const FAQManager = {
    init() {
      this.bindSearch();
      this.bindCategories();
    },

    bindSearch() {
      const input = document.getElementById('faqSearch');
      if (!input) return;

      let debounceTimer;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.filter(input.value.toLowerCase().trim());
        }, 300);
      });
    },

    bindCategories() {
      document.querySelectorAll('[data-faq-cat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          document
            .querySelectorAll('[data-faq-cat]')
            .forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          const cat = btn.dataset.faqCat;
          const items = document.querySelectorAll('.faq-item');

          items.forEach((item) => {
            if (cat === 'all' || item.dataset.category === cat) {
              item.hidden = false;
            } else {
              item.hidden = true;
            }
          });

          // Clear search
          const searchInput = document.getElementById('faqSearch');
          if (searchInput) searchInput.value = '';

          Haptic.light();
        });
      });
    },

    filter(query) {
      const items = document.querySelectorAll('.faq-item');
      const emptyEl = document.getElementById('faqEmpty');
      let visible = 0;

      // Reset category filter
      document.querySelectorAll('[data-faq-cat]').forEach((b) => {
        b.classList.toggle('active', b.dataset.faqCat === 'all');
      });

      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        const match = !query || text.includes(query);
        item.hidden = !match;
        if (match) visible++;
      });

      if (emptyEl) {
        emptyEl.style.display = visible === 0 ? 'block' : 'none';
      }
    }
  };

  // ==========================================
  // 17. REVIEW FORM
  // ==========================================
  const ReviewForm = {
    init() {
      const btn = document.getElementById('leaveReviewBtn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        this.show();
        Haptic.light();
      });

      const askBtn = document.getElementById('askQuestionBtn');
      if (askBtn) {
        askBtn.addEventListener('click', () => {
          if (isTelegram) {
            tg.openTelegramLink('https://t.me/vitaman777');
          } else {
            window.open('https://t.me/vitaman777', '_blank');
          }
          Haptic.light();
        });
      }
    },

    show() {
      Modal.open(`
        <form class="review-form" id="reviewFormInner">
          <h3>Оставить отзыв</h3>
          
          <div class="review-stars" id="reviewStars">
            <button type="button" class="review-star" data-rating="1">⭐</button>
            <button type="button" class="review-star" data-rating="2">⭐</button>
            <button type="button" class="review-star" data-rating="3">⭐</button>
            <button type="button" class="review-star" data-rating="4">⭐</button>
            <button type="button" class="review-star" data-rating="5">⭐</button>
          </div>
          
          <div class="form-field">
            <label class="form-label">Как тебя зовут?</label>
            <input type="text" class="input" id="reviewName" 
                   placeholder="Имя" required>
          </div>
          
          <div class="form-field">
            <label class="form-label">Расскажи о результате:</label>
            <textarea class="input" id="reviewText" rows="4" 
                      placeholder="Что понравилось? Какой результат?" required></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width:100%">
            Отправить отзыв
          </button>
        </form>
      `);

      // Star rating
      let rating = 0;
      document.querySelectorAll('#reviewStars .review-star').forEach((star) => {
        star.addEventListener('click', () => {
          rating = parseInt(star.dataset.rating);
          document.querySelectorAll('#reviewStars .review-star').forEach((s, i) => {
            s.classList.toggle('active', i < rating);
          });
          Haptic.light();
        });
      });

      // Auto-fill name from Telegram
      if (isTelegram && tg.initDataUnsafe?.user?.first_name) {
        const nameInput = document.getElementById('reviewName');
        if (nameInput) {
          nameInput.value = tg.initDataUnsafe.user.first_name;
        }
      }

      // Submit
      const form = document.getElementById('reviewFormInner');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          if (rating === 0) {
            Notify.show('Поставь оценку', 'warning');
            return;
          }

          const data = {
            action: 'review',
            rating,
            name: document.getElementById('reviewName').value,
            text: document.getElementById('reviewText').value,
            user: isTelegram ? tg.initDataUnsafe?.user : null
          };

          if (isTelegram) {
            tg.sendData(JSON.stringify(data));
          }

          Modal.close();
          Notify.show('Спасибо за отзыв! ❤️', 'success');
          Haptic.success();
          Analytics.track('review_submit', { rating });
        });
      }
    }
  };

  // ==========================================
  // 18. CTA FORM
  // ==========================================
  const CTAForm = {
    init() {
      this.autofillFromTelegram();
      this.bindTariffButtons();
      this.bindSubmit();
    },

    autofillFromTelegram() {
      if (!isTelegram) return;
      const user = tg.initDataUnsafe?.user;
      if (!user) return;

      const nameInput = document.getElementById('inputName');
      if (nameInput && user.first_name) {
        nameInput.value =
          user.first_name + (user.last_name ? ' ' + user.last_name : '');
      }
    },

    bindTariffButtons() {
      document.querySelectorAll('[data-tariff]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tariff = btn.dataset.tariff;
          const tariffSelect = document.getElementById('inputTariff');
          if (tariffSelect) tariffSelect.value = tariff;
          Analytics.track('tariff_click', { tariff });
        });
      });
    },

    bindSubmit() {
      const form = document.getElementById('ctaForm');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot
        if (form.querySelector('input[name="website"]').value) return;

        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        const data = {
          action: 'lead',
          name: form.name.value.trim(),
          goal: form.goal.value,
          tariff: form.tariff?.value || '',
          comment: form.comment?.value?.trim() || '',
          quiz: Quiz.answers,
          telegram_user: isTelegram ? tg.initDataUnsafe?.user : null
        };

        // Validation
        if (data.name.length < 2) {
          Notify.show('Введи имя (минимум 2 символа)', 'warning');
          Haptic.error();
          return;
        }

        if (!data.goal) {
          Notify.show('Выбери цель', 'warning');
          Haptic.error();
          return;
        }

        // Check connection
        if (!navigator.onLine) {
          Notify.show('Нет интернета. Проверь соединение.', 'error');
          Haptic.error();
          return;
        }

        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        btn.disabled = true;

        try {
          if (isTelegram) {
            tg.sendData(JSON.stringify(data));
          }

          // Also send to backend
          // await fetch('https://your-api.com/lead', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data)
          // });

          Haptic.success();

          // Show success section
          const ctaSection = document.getElementById('ctaFinal');
          const successSection = document.getElementById('successSection');
          if (ctaSection) ctaSection.style.display = 'none';
          if (successSection) {
            successSection.style.display = 'flex';
            successSection.scrollIntoView({ behavior: 'smooth' });
          }

          Notify.show('Заявка отправлена! 🎉', 'success');
          Analytics.track('form_submit', data);
          form.reset();
        } catch (err) {
          Haptic.error();
          Notify.show('Ошибка отправки. Попробуй ещё раз.', 'error');
        } finally {
          btnText.style.display = 'inline';
          btnLoader.style.display = 'none';
          btn.disabled = false;
        }
      });
    }
  };

  // ==========================================
  // 19. ANALYTICS
  // ==========================================
  const Analytics = {
    events: [],

    track(event, data = {}) {
      const entry = {
        event,
        data,
        timestamp: Date.now(),
        user: isTelegram ? tg.initDataUnsafe?.user?.id : 'anonymous'
      };

      this.events.push(entry);
      console.log('[Analytics]', event, data);

      if (this.events.length >= 5) {
        this.flush();
      }
    },

    async flush() {
      if (this.events.length === 0) return;

      const batch = [...this.events];
      this.events = [];

      try {
        // await fetch('https://your-api.com/analytics', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ events: batch }),
        //   keepalive: true
        // });
      } catch (e) {
        this.events = [...batch, ...this.events];
      }
    }
  };

  // ==========================================
  // 20. TELEGRAM MAIN BUTTON & CHAT FAB
  // ==========================================
  function initTelegramButtons() {
    if (!isTelegram) return;

    // Main Button
    tg.MainButton.setText('Получить план');
    tg.MainButton.color = tg.themeParams.button_color || '#00e5ff';
    tg.MainButton.textColor = tg.themeParams.button_text_color || '#000000';
    tg.MainButton.show();

    tg.MainButton.onClick(() => {
      const cta = document.getElementById('ctaFinal');
      if (cta) cta.scrollIntoView({ behavior: 'smooth' });
    });

    // Personalize hero
    const user = tg.initDataUnsafe?.user;
    if (user?.first_name) {
      const heroTitle = document.getElementById('heroTitle');
      if (heroTitle) {
        heroTitle.textContent = `${user.first_name}, трансформация твоего тела начинается здесь`;
      }
    }
  }

  function initChatFab() {
    const fab = document.getElementById('chatFab');
    if (!fab) return;

    fab.addEventListener('click', () => {
      if (isTelegram) {
        tg.openTelegramLink('https://t.me/vitaman777');
      } else {
        window.open('https://t.me/vitaman777', '_blank');
      }
      Haptic.light();
      Analytics.track('chat_fab_click');
    });
  }

  // ==========================================
  // 21. HAPTIC ON ALL INTERACTIVE ELEMENTS
  // ==========================================
  function initGlobalHaptics() {
    document.querySelectorAll('.btn, .filter-btn, details summary').forEach((el) => {
      el.addEventListener('click', () => Haptic.light());
    });
  }

  // ==========================================
  // 22. DYNAMIC YEAR
  // ==========================================
  function setCurrentYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  // ==========================================
  // 23. OFFLINE HANDLER
  // ==========================================
  function initOfflineHandler() {
    window.addEventListener('offline', () => {
      Notify.show('Соединение потеряно. Проверь интернет.', 'warning', 6000);
    });

    window.addEventListener('online', () => {
      Notify.show('Соединение восстановлено!', 'success', 3000);
      Analytics.flush();
    });
  }

  // ==========================================
  // 24. CLOUD STORAGE (Telegram)
  // ==========================================
  const CloudStorage = {
    async save(key, value) {
      if (!isTelegram || !tg.CloudStorage) return;
      return new Promise((resolve) => {
        tg.CloudStorage.setItem(key, JSON.stringify(value), (err) => {
          resolve(!err);
        });
      });
    },

    async load(key) {
      if (!isTelegram || !tg.CloudStorage) return null;
      return new Promise((resolve) => {
        tg.CloudStorage.getItem(key, (err, value) => {
          if (err || !value) resolve(null);
          else {
            try {
              resolve(JSON.parse(value));
            } catch {
              resolve(null);
            }
          }
        });
      });
    }
  };

  // ==========================================
  // INIT EVERYTHING
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    // Core
    ThemeManager.init();
    Notify.init();
    Modal.init();

    // Telegram
    initTelegramButtons();
    initChatFab();

    // Animations & UI
    initRevealAnimations();
    initSmoothScroll();
    initStatCounters();
    initLazyImages();
    initGlobalHaptics();

    // Features
    CasesCarousel.init();
    Quiz.init();
    ExerciseLibrary.init();
    Calculator.init();
    WorkoutTimer.init();
    FAQManager.init();
    ReviewForm.init();
    CTAForm.init();

    // Misc
    setCurrentYear();
    initOfflineHandler();

    // Analytics
    Analytics.track('page_view');

    // Hide skeleton
    setTimeout(hideSkeleton, 500);

    // Flush analytics before close
    window.addEventListener('beforeunload', () => Analytics.flush());
  });
})();
