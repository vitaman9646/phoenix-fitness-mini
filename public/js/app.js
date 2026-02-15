(function(){
'use strict';

// ========== TELEGRAM ==========
var tg = null;
var isTG = false;
try {
  tg = window.Telegram && window.Telegram.WebApp;
  isTG = !!tg;
  if (isTG) { tg.ready(); tg.expand(); }
} catch(e) {
  console.warn('Telegram WebApp недоступен');
}

// ========== HELPERS ==========
function haptic(t) {
  try { if (isTG && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(t || 'light'); } catch(e) {}
}
function hapticN(t) {
  try { if (isTG && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred(t || 'success'); } catch(e) {}
}

// ========== THEME ==========
function initTheme() {
  if (isTG) {
    var t = tg.colorScheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } else {
    var saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }
}

// ========== SKELETON ==========
function hideSkeleton() {
  var s = document.getElementById('skeletonOverlay');
  if (s) {
    s.style.opacity = '0';
    s.style.pointerEvents = 'none';
    setTimeout(function() { if (s.parentNode) s.parentNode.removeChild(s); }, 500);
  }
}

// ========== NOTIFY ==========
var Notify = {
  el: null,
  init: function() { this.el = document.getElementById('notificationContainer'); },
  show: function(msg, type, dur) {
    if (!this.el) return;
    type = type || 'info';
    dur = dur || 4000;
    var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    var n = document.createElement('div');
    n.className = 'notification notif-' + type;

    var iconSpan = document.createElement('span');
    iconSpan.textContent = icons[type] || 'ℹ️';

    var msgSpan = document.createElement('span');
    msgSpan.textContent = msg;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'notif-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', function() { n.remove(); });

    n.appendChild(iconSpan);
    n.appendChild(msgSpan);
    n.appendChild(closeBtn);
    this.el.appendChild(n);

    setTimeout(function() {
      n.classList.add('removing');
      setTimeout(function() { if (n.parentNode) n.parentNode.removeChild(n); }, 300);
    }, dur);
  }
};

// ========== MODAL ==========
var Modal = {
  init: function() {
    var close = document.getElementById('modalClose');
    var overlay = document.getElementById('modalOverlay');
    if (close) close.addEventListener('click', function() { Modal.close(); });
    if (overlay) overlay.addEventListener('click', function(e) {
      if (e.target.id === 'modalOverlay') Modal.close();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { Modal.close(); Sheet.close(); }
    });
  },
  open: function(html) {
    var c = document.getElementById('modalContent');
    var o = document.getElementById('modalOverlay');
    if (c) c.innerHTML = html;
    if (o) o.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  close: function() {
    var o = document.getElementById('modalOverlay');
    if (o) o.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ========== BOTTOM SHEET ==========
var Sheet = {
  init: function() {
    var overlay = document.getElementById('bottomSheetOverlay');
    if (overlay) overlay.addEventListener('click', function(e) {
      if (e.target.id === 'bottomSheetOverlay') Sheet.close();
    });
  },
  open: function(html) {
    var c = document.getElementById('bottomSheetContent');
    var o = document.getElementById('bottomSheetOverlay');
    if (c) c.innerHTML = html;
    if (o) o.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  close: function() {
    var o = document.getElementById('bottomSheetOverlay');
    if (o) o.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ========== REVEAL ANIMATIONS ==========
function initReveals() {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 100px 0px' });

    reveals.forEach(function(el) { observer.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('revealed'); });
  }
}

// ========== SMOOTH SCROLL ==========
function initScroll() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-scroll]');
    if (!btn) return;
    e.preventDefault();
    var target = document.querySelector(btn.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// ========== STICKY NAV ==========
function initNav() {
  var links = document.querySelectorAll('.sticky-link');
  if (!links.length) return;

  function updateActive() {
    var scrollY = window.scrollY + 150;
    links.forEach(function(link) {
      var section = document.getElementById(link.dataset.section);
      if (section) {
        var top = section.offsetTop;
        var bottom = top + section.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          links.forEach(function(l) { l.classList.remove('active'); });
          link.classList.add('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

// ========== PAGE PROGRESS ==========
function initPageProgress() {
  var bar = document.getElementById('pageProgress');
  if (!bar) return;

  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + '%';
  }, { passive: true });
}

// ========== STATS COUNTER ==========
function initStats() {
  var animated = false;
  var stats = document.querySelectorAll('.stat-number[data-target]');
  if (!stats.length) return;

  function animateStats() {
    if (animated) return;
    var section = document.querySelector('.stats-section');
    if (!section) return;
    var rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      animated = true;
      stats.forEach(function(el) {
        var target = parseFloat(el.dataset.target);
        var isFloat = target % 1 !== 0;
        var duration = 2000;
        var startTime = null;

        function tick(timestamp) {
          if (!startTime) startTime = timestamp;
          var prog = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - prog, 4);
          var val = target * eased;
          el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
          if (prog < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
  }

  window.addEventListener('scroll', animateStats, { passive: true });
  animateStats();
}

// ========== CASES CAROUSEL ==========
function initCases() {
  var track = document.getElementById('casesTrack');
  var prev = document.getElementById('casesPrev');
  var next = document.getElementById('casesNext');
  var dots = document.getElementById('casesDots');
  if (!track) return;

  var allSlides = Array.from(track.querySelectorAll('.case-slide'));
  var filtered = allSlides.slice();
  var current = 0;

  function updateCarousel() {
    allSlides.forEach(function(s) { s.classList.remove('active'); });
    if (filtered[current]) filtered[current].classList.add('active');
    updateDots();
  }

  function updateDots() {
    if (!dots) return;
    dots.innerHTML = '';
    filtered.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.className = 'cases-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', function() { current = i; updateCarousel(); });
      dots.appendChild(dot);
    });
  }

  if (prev) prev.addEventListener('click', function() {
    current = (current - 1 + filtered.length) % filtered.length;
    updateCarousel();
    haptic('light');
  });

  if (next) next.addEventListener('click', function() {
    current = (current + 1) % filtered.length;
    updateCarousel();
    haptic('light');
  });

  // Фильтры
  var filterBtns = document.querySelectorAll('.cases-filters .filter-btn');
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var filter = this.dataset.filter;

      if (filter === 'all') {
        filtered = allSlides.slice();
      } else {
        filtered = allSlides.filter(function(s) {
          return s.dataset.tags && s.dataset.tags.indexOf(filter) !== -1;
        });
      }

      allSlides.forEach(function(s) { s.style.display = 'none'; });
      filtered.forEach(function(s) { s.style.display = ''; });

      current = 0;
      updateCarousel();
      haptic('light');
    });
  });

  // Свайп
  var startX = 0;
  track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      current = diff > 0
        ? (current + 1) % filtered.length
        : (current - 1 + filtered.length) % filtered.length;
      updateCarousel();
    }
  }, { passive: true });

  updateCarousel();
}

// ========== REVIEWS ==========
function initReviews() {
  var grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  var reviews = [
    { name: 'Алексей', text: 'Сбросил 14 кг за 2 месяца! Программа работает.', rating: 5 },
    { name: 'Мария', text: 'Набрала форму после родов. Виталий — лучший!', rating: 5 },
    { name: 'Дмитрий', text: 'Наконец-то система, а не хаос в зале.', rating: 5 },
    { name: 'Анна', text: 'Тренируюсь дома, результат виден через 3 недели.', rating: 5 }
  ];

  var userReviews = JSON.parse(localStorage.getItem('user_reviews') || '[]');
  reviews = reviews.concat(userReviews);

  grid.innerHTML = '';
  reviews.forEach(function(r) {
    var card = document.createElement('div');
    card.className = 'review-card';

    var stars = '';
    for (var i = 0; i < r.rating; i++) stars += '⭐';

    var nameEl = document.createElement('div');
    nameEl.className = 'review-name';
    nameEl.textContent = r.name;

    var starsEl = document.createElement('div');
    starsEl.className = 'review-stars';
    starsEl.textContent = stars;

    var textEl = document.createElement('p');
    textEl.className = 'review-text';
    textEl.textContent = r.text;

    card.appendChild(nameEl);
    card.appendChild(starsEl);
    card.appendChild(textEl);
    grid.appendChild(card);
  });
}

// ========== LEAVE REVIEW ==========
function initLeaveReview() {
  var btn = document.getElementById('leaveReviewBtn');
  if (!btn) return;

  btn.addEventListener('click', function() {
    Sheet.open(
      '<h3 style="margin-bottom:16px">Оставить отзыв</h3>'
      + '<div class="form-field"><label class="form-label">Имя</label>'
      + '<input type="text" class="input" id="reviewName" maxlength="30"></div>'
      + '<div class="form-field"><label class="form-label">Отзыв</label>'
      + '<textarea class="input" id="reviewText" rows="3" maxlength="200"></textarea></div>'
      + '<div class="form-field"><label class="form-label">Оценка</label>'
      + '<select class="input" id="reviewRating">'
      + '<option value="5">⭐⭐⭐⭐⭐</option>'
      + '<option value="4">⭐⭐⭐⭐</option>'
      + '<option value="3">⭐⭐⭐</option></select></div>'
      + '<button class="btn btn-primary" id="submitReview" style="margin-top:12px">Отправить</button>'
    );

    setTimeout(function() {
      var submit = document.getElementById('submitReview');
      if (submit) {
        submit.addEventListener('click', function() {
          var name = document.getElementById('reviewName').value.trim();
          var text = document.getElementById('reviewText').value.trim();
          var rating = parseInt(document.getElementById('reviewRating').value);

          if (!name || !text) { Notify.show('Заполни все поля', 'error'); return; }

          var saved = JSON.parse(localStorage.getItem('user_reviews') || '[]');
          saved.push({ name: name, text: text, rating: rating });
          localStorage.setItem('user_reviews', JSON.stringify(saved));

          Sheet.close();
          Notify.show('Спасибо за отзыв! ❤️', 'success');
          hapticN('success');
          initReviews();
        });
      }
    }, 100);
  });
}

// ========== QUIZ ==========
function initQuiz() {
  var wrapper = document.getElementById('quizWrapper');
  if (!wrapper) return;

  var steps = wrapper.querySelectorAll('.quiz-step');
  var progress = document.getElementById('quizProgress');
  var backBtn = document.getElementById('quizBack');
  var history = [];
  var answers = {};
  var totalSteps = 6;

  function showStep(stepId) {
    steps.forEach(function(s) { s.classList.remove('active'); });
    var target = wrapper.querySelector('[data-step="' + stepId + '"]');
    if (target) target.classList.add('active');

    // Прогресс
    if (stepId === 'result') {
      progress.style.width = '100%';
    } else {
      var num = parseInt(stepId);
      progress.style.width = ((num / totalSteps) * 100) + '%';
    }

    // Кнопка назад
    if (backBtn) {
      backBtn.style.display = (history.length > 0 && stepId !== 'result') ? '' : 'none';
    }

    if (stepId === 'result') {
      calculateQuizResult();
      localStorage.setItem('quiz_done', 'true');
    }
  }

  // Клик по опции
  wrapper.addEventListener('click', function(e) {
    var option = e.target.closest('.quiz-option');
    if (!option) return;

    var step = option.closest('.quiz-step');
    if (!step) return;
    var stepId = step.dataset.step;
    var value = option.dataset.value;
    var nextStep = option.dataset.next;

    step.querySelectorAll('.quiz-option').forEach(function(o) { o.classList.remove('selected'); });
    option.classList.add('selected');

    switch (stepId) {
      case '1': answers.goal = value; break;
      case '2': answers.gender = value; break;
      case '4': answers.place = value; break;
      case '5': answers.frequency = value; break;
      case '6': answers.level = value; break;
    }

    haptic('light');
    history.push(stepId);
    setTimeout(function() { showStep(nextStep); }, 300);
  });

  // Шаг 3
  var step3Btn = document.getElementById('quizStep3Next');
  if (step3Btn) {
    step3Btn.addEventListener('click', function() {
      var age = parseInt(document.getElementById('quizAge').value);
      var height = parseFloat(document.getElementById('quizHeight').value);
      var weight = parseFloat(document.getElementById('quizWeight').value);

      if (!age || !height || !weight || isNaN(age) || isNaN(height) || isNaN(weight)) {
        Notify.show('Заполни все поля', 'error');
        hapticN('error');
        return;
      }
      if (age < 14 || age > 80 || height < 100 || height > 250 || weight < 30 || weight > 300) {
        Notify.show('Проверь введённые данные', 'error');
        return;
      }

      answers.age = age;
      answers.height = height;
      answers.weight = weight;
      history.push('3');
      showStep('4');
      haptic('light');
    });
  }

  // Назад
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (history.length === 0) return;
      var prevStep = history.pop();
      showStep(prevStep);
      haptic('light');
    });
  }

  // Рестарт
  var restartBtn = document.getElementById('quizRestart');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      answers = {};
      history = [];
      showStep('1');
      haptic('medium');
    });
  }

  // Шеринг
  var shareBtn = document.getElementById('shareQuiz');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      var cal = document.getElementById('qCalories').textContent;
      var text = 'Мой расчёт КБЖУ: ' + cal + ' ккал/день! Рассчитай свой →';
      if (navigator.share) {
        navigator.share({ title: 'КБЖУ расчёт', text: text });
      } else {
        navigator.clipboard.writeText(text).then(function() {
          Notify.show('Скопировано!', 'success');
        });
      }
    });
  }

  // Расчёт результата
  function calculateQuizResult() {
    var age = answers.age;
    var height = answers.height;
    var weight = answers.weight;
    var gender = answers.gender;
    var goal = answers.goal;
    var freq = parseInt(answers.frequency) || 3;

    if (!age || !height || !weight || !gender || !goal) {
      document.getElementById('quizResultText').textContent = 'Недостаточно данных для расчёта';
      return;
    }

    // BMR Миффлина-Сан Жеора
    var bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    var activityMap = { 2: 1.375, 3: 1.55, 4: 1.65, 5: 1.725 };
    var activity = activityMap[freq] || 1.55;
    var tdee = bmr * activity;

    var calories;
    switch (goal) {
      case 'loss':
        calories = tdee * 0.8;
        var minC = (gender === 'male') ? 1500 : 1200;
        if (calories < minC) calories = minC;
        break;
      case 'gain':
        calories = tdee * 1.15;
        break;
      default:
        calories = tdee;
    }
    calories = Math.round(calories);

    var proteinPerKg = (goal === 'loss') ? 2.0 : (goal === 'gain') ? 1.8 : 1.6;
    var protein = Math.round(weight * proteinPerKg);
    var fat = Math.round((calories * 0.25) / 9);
    var carbsCal = calories - protein * 4 - fat * 9;
    var carbs = Math.round(carbsCal / 4);
    if (carbs < 0) carbs = 50;

    // Верификация
    var check = protein * 4 + fat * 9 + carbs * 4;
    console.log('Quiz КБЖУ:', calories, 'ккал | Проверка:', check);

    document.getElementById('qCalories').textContent = calories;
    document.getElementById('qProtein').textContent = protein + 'г';
    document.getElementById('qFat').textContent = fat + 'г';
    document.getElementById('qCarbs').textContent = carbs + 'г';

    // Рекомендации
    var goalNames = { loss: 'Похудение', gain: 'Набор массы', tone: 'Тонус и здоровье' };
    var placeNames = { home: 'дома', gym: 'в зале', both: 'дома и в зале' };
    var levelNames = { beginner: 'новичок', middle: 'средний', advanced: 'продвинутый' };

    var recTariff;
    if (answers.level === 'beginner') {
      recTariff = 'Оптимальный — нужна поддержка на старте';
    } else if (answers.level === 'advanced' || freq >= 5) {
      recTariff = 'VIP — для максимального результата';
    } else {
      recTariff = 'Оптимальный — лучшее соотношение цена/результат';
    }

    var resultEl = document.getElementById('quizResultText');
    resultEl.innerHTML = '<div class="quiz-rec">'
      + '<h3>Рекомендации для тебя:</h3>'
      + '<p><strong>Цель:</strong> ' + (goalNames[goal] || goal) + '</p>'
      + '<p><strong>Тренировки:</strong> ' + freq + ' раз/нед ' + (placeNames[answers.place] || '') + '</p>'
      + '<p><strong>Уровень:</strong> ' + (levelNames[answers.level] || '') + '</p>'
      + '<p><strong>Рекомендованный тариф:</strong> ' + recTariff + '</p>'
      + '</div>';

    // План на неделю
    var weekEl = document.getElementById('quizWeekPlan');
    var days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    var weekHtml = '<div class="quiz-week"><h3>План на неделю:</h3><div class="quiz-week-grid">';
    for (var i = 0; i < 7; i++) {
      var isTraining = i < freq;
      weekHtml += '<div class="quiz-week-day ' + (isTraining ? 'training' : 'rest') + '">'
        + '<span class="quiz-week-day-name">' + days[i] + '</span>'
        + '<span class="quiz-week-day-type">' + (isTraining ? '💪' : '😴') + '</span>'
        + '</div>';
    }
    weekHtml += '</div></div>';
    weekEl.innerHTML = weekHtml;
  }
}

// ========== PROGRESS CALCULATOR ==========
function initProgressCalc() {
  var btn = document.getElementById('calcProgressBtn');
  if (!btn) return;

  btn.addEventListener('click', function() {
    var startW = parseFloat(document.getElementById('startWeight').value);
    var currentW = parseFloat(document.getElementById('currentWeight').value);
    var goalW = parseFloat(document.getElementById('goalWeight').value);

    if (isNaN(startW) || isNaN(currentW) || isNaN(goalW)) {
      Notify.show('Заполни все три поля', 'error');
      hapticN('error');
      return;
    }
    if (startW <= 0 || currentW <= 0 || goalW <= 0) {
      Notify.show('Вес должен быть положительным', 'error');
      return;
    }
    if (startW === goalW) {
      Notify.show('Начальный и целевой вес совпадают', 'warning');
      return;
    }

    var isLoss = startW > goalW;
    var totalDiff, currentDiff, remaining;

    if (isLoss) {
      totalDiff = startW - goalW;
      currentDiff = startW - currentW;
      remaining = currentW - goalW;
    } else {
      totalDiff = goalW - startW;
      currentDiff = currentW - startW;
      remaining = goalW - currentW;
    }

    var progressPercent = 0;
    if (totalDiff > 0) {
      progressPercent = (currentDiff / totalDiff) * 100;
    }
    progressPercent = Math.max(0, Math.min(Math.round(progressPercent * 10) / 10, 100));
    remaining = Math.max(0, remaining);

    document.getElementById('lostWeight').textContent = Math.abs(currentDiff).toFixed(1);
    document.getElementById('progressPercent').textContent = progressPercent + '%';
    document.getElementById('remainWeight').textContent = remaining.toFixed(1);
    document.getElementById('calcResults').style.display = '';

    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('pLabelStart').textContent = startW;
    document.getElementById('pLabelGoal').textContent = goalW;
    document.getElementById('progressBarWrap').style.display = '';

    hapticN('success');
    localStorage.setItem('calc_used', 'true');

    if (progressPercent >= 100) {
      Notify.show('Цель достигнута! 🎉', 'success');
    } else if (progressPercent >= 50) {
      Notify.show('Больше половины пути! 💪', 'success');
    }
  });
}

// ========== KBJU CALCULATOR ==========
function initKBJU() {
  var form = document.getElementById('kbjuForm');
  if (!form) return;

  var selectedGender = 'male';

  var genderBtns = document.querySelectorAll('.toggle-btn[data-gender]');
  genderBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      genderBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      selectedGender = this.dataset.gender;
      haptic('light');
    });
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var age = parseInt(document.getElementById('kbjuAge').value);
    var weight = parseFloat(document.getElementById('kbjuWeight').value);
    var height = parseFloat(document.getElementById('kbjuHeight').value);
    var activity = parseFloat(document.getElementById('kbjuActivity').value);
    var goal = document.getElementById('kbjuGoal').value;

    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
      Notify.show('Заполни все поля', 'error');
      hapticN('error');
      return;
    }
    if (age < 14 || age > 80) { Notify.show('Возраст: 14–80 лет', 'error'); return; }
    if (weight < 30 || weight > 300) { Notify.show('Вес: 30–300 кг', 'error'); return; }
    if (height < 100 || height > 250) { Notify.show('Рост: 100–250 см', 'error'); return; }

    // Миффлин-Сан Жеора
    var bmr;
    if (selectedGender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    var tdee = bmr * activity;

    var calories;
    switch (goal) {
      case 'loss':
        calories = tdee * 0.8;
        var minCal = (selectedGender === 'male') ? 1500 : 1200;
        if (calories < minCal) calories = minCal;
        break;
      case 'gain':
        calories = tdee * 1.15;
        break;
      default:
        calories = tdee;
    }
    calories = Math.round(calories);

    var proteinPerKg, fatPercent;
    switch (goal) {
      case 'loss': proteinPerKg = 2.0; fatPercent = 0.25; break;
      case 'gain': proteinPerKg = 1.8; fatPercent = 0.25; break;
      default: proteinPerKg = 1.6; fatPercent = 0.30;
    }

    var protein = Math.round(weight * proteinPerKg);
    var fat = Math.round((calories * fatPercent) / 9);
    var carbsCal = calories - (protein * 4) - (fat * 9);
    var carbs = Math.round(carbsCal / 4);

    if (carbs < 0) {
      var maxProteinCal = calories - (fat * 9) - (50 * 4);
      protein = Math.max(Math.round(maxProteinCal / 4), 50);
      carbs = 50;
      Notify.show('Калораж низкий — белки скорректированы', 'warning');
    }

    // Верификация
    var check = protein * 4 + fat * 9 + carbs * 4;
    console.log('КБЖУ:', calories, '| Проверка:', check);

    document.getElementById('kbjuCal').textContent = calories;
    document.getElementById('kbjuP').textContent = protein + 'г';
    document.getElementById('kbjuF').textContent = fat + 'г';
    document.getElementById('kbjuC').textContent = carbs + 'г';
    document.getElementById('kbjuResults').style.display = '';

    hapticN('success');
    Notify.show('Расчёт готов!', 'success');
    localStorage.setItem('calc_used', 'true');
  });
}

// ========== CHALLENGE ==========
function initChallenge() {
  var KEY = 'challenge_days';
  var saved = JSON.parse(localStorage.getItem(KEY) || '[]');
  var daysEl = document.getElementById('challengeDays');
  var completedEl = document.getElementById('challengeCompleted');
  var barFill = document.getElementById('challengeBarFill');
  var btn = document.getElementById('challengeBtn');
  if (!daysEl || !btn) return;

  function render() {
    daysEl.innerHTML = '';
    var dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    for (var i = 0; i < 7; i++) {
      var d = document.createElement('div');
      d.className = 'challenge-day' + (saved.indexOf(i) !== -1 ? ' done' : '');
      d.textContent = dayNames[i];
      daysEl.appendChild(d);
    }
    if (completedEl) completedEl.textContent = saved.length;
    if (barFill) barFill.style.width = (saved.length / 7 * 100) + '%';

    if (saved.length >= 7) {
      btn.textContent = '🎉 Выполнено!';
      btn.disabled = true;
    }
  }

  btn.addEventListener('click', function() {
    var today = new Date().getDay();
    var dayIndex = today === 0 ? 6 : today - 1;

    if (saved.indexOf(dayIndex) === -1) {
      saved.push(dayIndex);
      localStorage.setItem(KEY, JSON.stringify(saved));
      hapticN('success');
      Notify.show('День отмечен! 💪', 'success');
    } else {
      Notify.show('Сегодня уже отмечено', 'info');
    }
    render();
  });

  render();
}

// ========== PRICING ==========
function initPricing() {
  var toggleBtns = document.querySelectorAll('.pricing-toggle-btn');
  toggleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      toggleBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var period = this.dataset.period;

      document.querySelectorAll('.pricing-amount.monthly, .pricing-period.monthly')
        .forEach(function(el) { el.style.display = (period === 'monthly') ? '' : 'none'; });
      document.querySelectorAll('.pricing-amount.quarterly, .pricing-period.quarterly')
        .forEach(function(el) { el.style.display = (period === 'quarterly') ? '' : 'none'; });
      haptic('light');
    });
  });

  document.querySelectorAll('.pricing-btn[data-tariff]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tariff = this.dataset.tariff;
      var select = document.getElementById('inputTariff');
      if (select) select.value = tariff;
    });
  });
}

// ========== HABITS ==========
function initHabits() {
  var KEY = 'habits';
  var STREAK_KEY = 'habit_streak';
  var list = document.getElementById('habitsList');
  var input = document.getElementById('habitInput');
  var addBtn = document.getElementById('habitAddBtn');
  var streakEl = document.getElementById('streakCount');
  if (!list || !input || !addBtn) return;

  var habits = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (!habits) {
    habits = [
      { text: 'Выпить 2л воды', done: false },
      { text: 'Тренировка', done: false },
      { text: '8 часов сна', done: false }
    ];
  }

  function save() { localStorage.setItem(KEY, JSON.stringify(habits)); }

  function render() {
    list.innerHTML = '';
    habits.forEach(function(h, i) {
      var div = document.createElement('div');
      div.className = 'habit-item' + (h.done ? ' done' : '');

      var cb = document.createElement('button');
      cb.className = 'habit-check';
      cb.textContent = h.done ? '✅' : '⬜';
      cb.addEventListener('click', function() {
        habits[i].done = !habits[i].done;
        save(); render();
        haptic('light');
      });

      var span = document.createElement('span');
      span.className = 'habit-text';
      span.textContent = h.text;

      var del = document.createElement('button');
      del.className = 'habit-del';
      del.textContent = '×';
      del.addEventListener('click', function() {
        habits.splice(i, 1);
        save(); render();
      });

      div.appendChild(cb);
      div.appendChild(span);
      div.appendChild(del);
      list.appendChild(div);
    });

    // Серия
    var allDone = habits.length > 0 && habits.every(function(h) { return h.done; });
    var streak = parseInt(localStorage.getItem(STREAK_KEY) || '0');
    if (allDone) {
      var today = new Date().toDateString();
      var lastDay = localStorage.getItem('habit_last_day');
      if (lastDay !== today) {
        streak++;
        localStorage.setItem(STREAK_KEY, String(streak));
        localStorage.setItem('habit_last_day', today);
      }
    }
    if (streakEl) streakEl.textContent = streak;
    var cabStreak = document.getElementById('cabStreak');
    if (cabStreak) cabStreak.textContent = streak;
  }

  addBtn.addEventListener('click', function() {
    var text = input.value.trim();
    if (!text) return;
    if (habits.length >= 10) { Notify.show('Максимум 10 привычек', 'warning'); return; }
    habits.push({ text: text, done: false });
    input.value = '';
    save(); render();
    haptic('light');
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addBtn.click();
  });

  render();
}

// ========== FAQ ==========
function initFAQ() {
  var search = document.getElementById('faqSearch');
  var items = document.querySelectorAll('.faq-item');
  var empty = document.getElementById('faqEmpty');
  var catBtns = document.querySelectorAll('[data-faq]');

  function filterFAQ() {
    var query = search ? search.value.toLowerCase() : '';
    var activeCat = 'all';
    catBtns.forEach(function(b) {
      if (b.classList.contains('active')) activeCat = b.dataset.faq;
    });

    var visible = 0;
    items.forEach(function(item) {
      var text = item.textContent.toLowerCase();
      var cat = item.dataset.cat;
      var show = (!query || text.indexOf(query) !== -1)
        && (activeCat === 'all' || cat === activeCat);
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (empty) empty.style.display = visible === 0 ? '' : 'none';
  }

  if (search) search.addEventListener('input', filterFAQ);
  catBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      catBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      filterFAQ();
    });
  });
}

// ========== CTA FORM ==========
function initForm() {
  var form = document.getElementById('ctaForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var hp = form.querySelector('[name="website"]');
    if (hp && hp.value) return;

    var name = document.getElementById('inputName').value.trim();
    var goal = document.getElementById('inputGoal').value;
    var tariff = document.getElementById('inputTariff').value;

    if (!name || name.length < 2) { Notify.show('Введи имя', 'error'); return; }
    if (!goal) { Notify.show('Выбери цель', 'error'); return; }

    var btnText = form.querySelector('.btn-text');
    var btnLoader = form.querySelector('.btn-loader');
    var submitBtn = form.querySelector('[type="submit"]');

    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = '';
    if (submitBtn) submitBtn.disabled = true;

    setTimeout(function() {
      if (btnText) btnText.style.display = '';
      if (btnLoader) btnLoader.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;

      if (isTG) {
        try {
          tg.sendData(JSON.stringify({ type: 'lead', name: name, goal: goal, tariff: tariff }));
        } catch(err) { console.error('TG sendData:', err); }
      }

      var ctaSection = document.getElementById('ctaFinal');
      var successSection = document.getElementById('successSection');
      if (ctaSection) ctaSection.style.display = 'none';
      if (successSection) successSection.style.display = '';

      Notify.show('Заявка отправлена! 🎉', 'success');
      hapticN('success');
    }, 1500);
  });
}

// ========== CABINET ==========
function initCabinet() {
  if (isTG && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    var user = tg.initDataUnsafe.user;
    var avatar = document.getElementById('cabAvatar');
    var name = document.getElementById('cabName');
    if (avatar) avatar.textContent = (user.first_name || '?')[0];
    if (name) name.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
  }
}

// ========== REFERRAL ==========
function initReferral() {
  var codeEl = document.getElementById('referralCode');
  var copyBtn = document.getElementById('copyReferral');
  var shareBtn = document.getElementById('shareReferral');

  if (codeEl) {
    var code = localStorage.getItem('referral_code');
    if (!code) {
      code = 'FIT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      localStorage.setItem('referral_code', code);
    }
    codeEl.value = code;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.value).then(function() {
          Notify.show('Код скопирован!', 'success');
          haptic('light');
        });
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      var text = 'Тренируйся со скидкой 20%! Мой код: ' + (codeEl ? codeEl.value : '');
      if (navigator.share) {
        navigator.share({ title: 'Фитнес', text: text });
      } else {
        navigator.clipboard.writeText(text);
        Notify.show('Скопировано!', 'success');
      }
    });
  }
}

// ========== BADGES ==========
function initBadges() {
  var grid = document.getElementById('badgesGrid');
  if (!grid) return;

  var badges = [
    { id: 'first_visit', icon: '👋', name: 'Первый визит', condition: true },
    { id: 'quiz_done', icon: '🧠', name: 'Квиз пройден', condition: !!localStorage.getItem('quiz_done') },
    { id: 'calc_used', icon: '🔢', name: 'Калькулятор', condition: !!localStorage.getItem('calc_used') },
    { id: 'streak_3', icon: '🔥', name: 'Серия 3 дня', condition: parseInt(localStorage.getItem('habit_streak') || '0') >= 3 },
    { id: 'streak_7', icon: '💎', name: 'Серия 7 дней', condition: parseInt(localStorage.getItem('habit_streak') || '0') >= 7 }
  ];

  grid.innerHTML = '';
  badges.forEach(function(b) {
    var div = document.createElement('div');
    div.className = 'badge-item ' + (b.condition ? 'earned' : 'locked');

    var iconSpan = document.createElement('span');
    iconSpan.className = 'badge-icon';
    iconSpan.textContent = b.condition ? b.icon : '🔒';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'badge-name';
    nameSpan.textContent = b.name;

    div.appendChild(iconSpan);
    div.appendChild(nameSpan);
    grid.appendChild(div);
  });
}

// ========== CHAT FAB ==========
function initChatFab() {
  var fab = document.getElementById('chatFab');
  if (!fab) return;

  fab.addEventListener('click', function() {
    var url = 'https://t.me/vitaman777'; // ← ЗАМЕНИ
    if (isTG) {
      try { tg.openTelegramLink(url); } catch(e) { window.open(url, '_blank'); }
    } else {
      window.open(url, '_blank');
    }
  });
}

// ========== ASK TRAINER ==========
function initAsk() {
  var btn = document.getElementById('askBtn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var url = 'https://t.me/vitaman777'; // ← ЗАМЕНИ
    if (isTG) {
      try { tg.openTelegramLink(url); } catch(e) { window.open(url, '_blank'); }
    } else {
      window.open(url, '_blank');
    }
  });
}
    
// ========== BONUS через Telegram бота ==========
function initBonus() {
  var btn = document.getElementById('downloadBonus');
  if (!btn) return;

  // ═══ ЗАМЕНИ на URL своего Worker ═══
  var WORKER_URL = 'https://fitness-bot-worker.pages.dev';

  btn.addEventListener('click', function() {
    btn.disabled = true;
    btn.textContent = '⏳ Отправляю в Telegram...';

    var quizCalories = document.getElementById('qCalories');
    var quizProtein = document.getElementById('qProtein');
    var calories = quizCalories ? quizCalories.textContent : '2000';
    var protein = quizProtein ? quizProtein.textContent : '150г';

    // Получаем user_id из Telegram WebApp
    var userId = null;
    if (isTG && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      userId = tg.initDataUnsafe.user.id;
    }

    if (!userId) {
      // Не в Telegram — fallback на скачивание PDF
      btn.textContent = '⏳ Генерация PDF...';
      var userData = { calories: calories, protein: protein };

      generateWorkoutPDF(userData)
        .then(function() {
          return new Promise(function(r) { setTimeout(r, 800); });
        })
        .then(function() {
          return generateChecklistPDF(userData);
        })
        .then(function() {
          btn.textContent = '✅ PDF скачаны';
          Notify.show('PDF скачаны! 📥', 'success');
          hapticN('success');
          localStorage.setItem('bonus_downloaded', 'true');
        })
        .catch(function(err) {
          console.error('PDF error:', err);
          btn.textContent = 'Скачать бонус';
          btn.disabled = false;
          Notify.show('Ошибка генерации', 'error');
        });
      return;
    }

    // В Telegram — отправляем через бота
    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        calories: calories,
        protein: protein
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        btn.textContent = '✅ Отправлено в Telegram';
        Notify.show('Бонус отправлен в чат бота! 📩', 'success');
        hapticN('success');
        localStorage.setItem('bonus_downloaded', 'true');
      } else {
        throw new Error(data.error || 'Ошибка отправки');
      }
    })
    .catch(function(err) {
      console.error('Bonus error:', err);
      btn.disabled = false;

      // Проверяем — может пользователь не начал чат с ботом
      if (err.message && err.message.indexOf('403') !== -1) {
        btn.textContent = 'Скачать бонус';
        Notify.show('Сначала напиши боту /start', 'warning', 6000);

        // Открываем чат с ботом
        setTimeout(function() {
          if (isTG) {
            try {
              tg.openTelegramLink('https://t.me/ТВОЙ_БОТ_USERNAME');
            } catch(e) {
              window.open('https://t.me/ТВОЙ_БОТ_USERNAME', '_blank');
            }
          }
        }, 1000);
      } else {
        btn.textContent = 'Попробовать ещё';
        Notify.show('Ошибка. Попробуй ещё раз', 'error');
      }
    });
  });

  if (localStorage.getItem('bonus_downloaded')) {
    btn.textContent = '📥 Получить ещё раз';
    btn.disabled = false;
  }
}

  // Советы
  html += '<div style="margin:0 20px 25px;background:#0f172a;color:#fff;border-radius:12px;padding:20px 25px;page-break-inside:avoid">'
    + '<div style="font-size:15px;font-weight:700;margin-bottom:12px;color:#00e5ff">💡 7 советов для результата</div>'
    + '<div style="font-size:12px;margin-bottom:6px">1. Не пропускай разминку и заминку</div>'
    + '<div style="font-size:12px;margin-bottom:6px">2. Пей воду до, во время и после</div>'
    + '<div style="font-size:12px;margin-bottom:6px">3. Спи 7-8 часов</div>'
    + '<div style="font-size:12px;margin-bottom:6px">4. Записывай повторения</div>'
    + '<div style="font-size:12px;margin-bottom:6px">5. Увеличивай нагрузку на 2-й неделе</div>'
    + '<div style="font-size:12px;margin-bottom:6px">6. Фото: день 1 и день 7</div>'
    + '<div style="font-size:12px">7. Отправляй видео мне — проверю технику!</div>'
    + '</div>';

  // CTA
  html += '<div style="margin:0 20px 20px;background:linear-gradient(135deg,#00e5ff,#06b6d4);border-radius:12px;padding:20px 25px;text-align:center;page-break-inside:avoid">'
    + '<div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:6px">Хочешь полную программу на 4-12 недель?</div>'
    + '<div style="font-size:13px;color:#0f172a;margin-bottom:10px">С контролем техники и планом питания</div>'
    + '<div style="font-size:14px;font-weight:700;color:#0f172a">👉 t.me/vitaman777</div>'
    + '</div>'

    + '<div style="text-align:center;padding:15px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;margin:0 20px">'
    + '© Fitness Coach Vitaliy</div></div>';

  return renderPDF(html, 'Первая_неделя_тренировок.pdf');
}

// --- PDF 2: 7 ошибок ---
function generateChecklistPDF(userData) {
  var html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1e293b;line-height:1.5">'

    + '<div style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:40px 30px;border-radius:0 0 20px 20px;margin-bottom:30px">'
    + '<div style="font-size:12px;color:#ef4444;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Чек-лист</div>'
    + '<div style="font-size:28px;font-weight:800;margin-bottom:6px">❌ 7 ошибок в питании</div>'
    + '<div style="font-size:18px;font-weight:600;color:#94a3b8;margin-bottom:15px">Которые мешают прогрессу</div>'
    + '<div style="margin-top:15px;padding:10px 15px;background:rgba(0,229,255,0.15);border-radius:10px;font-size:12px;color:#00e5ff">'
    + 'Твоя норма: ' + userData.calories + ' ккал/день | Белок: ' + userData.protein + '</div>'
    + '</div>';

  var mistakes = [
    { title: 'Пропуск завтрака',
      problem: 'Метаболизм замедляется на 10-15%. К обеду переедаешь.',
      fix: 'Завтракай в течение 1 часа после пробуждения.',
      tip: 'Овсянка + яйцо + банан = 350 ккал' },
    { title: 'Слишком мало белка',
      problem: 'Мышцы не восстанавливаются. Тело теряет мышцы вместо жира.',
      fix: 'Норма: 1.6-2.0 г белка на кг веса. Белок в каждом приёме.',
      tip: 'Куриная грудь, творог 5%, рыба, яйца, бобовые' },
    { title: 'Страх перед жирами',
      problem: 'Гормональный сбой, сухая кожа, выпадение волос.',
      fix: 'Полезные жиры: авокадо, орехи, оливковое масло. 0.8-1.0 г/кг.',
      tip: '1 ст.л. оливкового масла = 14г жиров = 120 ккал' },
    { title: 'Жидкие калории',
      problem: 'Соки, лимонады, кофе с сиропом — 300-500 невидимых ккал.',
      fix: 'Замени на воду, чай без сахара, чёрный кофе.',
      tip: 'Стакан сока = 110 ккал. Целый апельсин = 60 ккал + клетчатка' },
    { title: 'Еда «на глазок»',
      problem: 'Переедание на 20-40% без осознания.',
      fix: 'Взвешивай еду первые 2-3 недели.',
      tip: 'Приложения: FatSecret, MyFitnessPal — бесплатные' },
    { title: 'Резкий дефицит калорий',
      problem: 'Метаболизм замедляется. Срывы неизбежны. Потеря мышц.',
      fix: 'Дефицит не более 15-20%. Снижение 0.5-1 кг/нед.',
      tip: 'Минимум: 1500 (муж), 1200 (жен). Твоя норма: ' + userData.calories + ' ккал' },
    { title: 'Нет режима питания',
      problem: 'Хаотичный приём → перекусы → переедание.',
      fix: '3 основных + 1-2 перекуса в одно время каждый день.',
      tip: 'Режим: 8:00 / 12:00 / 15:00 / 19:00' }
  ];

  mistakes.forEach(function(m, i) {
    html += '<div style="margin:0 20px 20px;page-break-inside:avoid">'
      + '<div style="display:flex;align-items:center;margin-bottom:10px">'
      + '<div style="background:#ef4444;color:#fff;width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;margin-right:12px;flex-shrink:0;line-height:30px;text-align:center">' + (i + 1) + '</div>'
      + '<div style="font-size:16px;font-weight:700">' + m.title + '</div></div>'
      + '<div style="background:#fef2f2;border-radius:10px;padding:15px 18px;margin-bottom:8px">'
      + '<div style="font-size:12px;color:#ef4444;font-weight:600;margin-bottom:4px">❌ Проблема:</div>'
      + '<div style="font-size:12px;color:#475569">' + m.problem + '</div></div>'
      + '<div style="background:#f0fdf4;border-radius:10px;padding:15px 18px">'
      + '<div style="font-size:12px;color:#22c55e;font-weight:600;margin-bottom:4px">✅ Решение:</div>'
      + '<div style="font-size:12px;color:#475569">' + m.fix + '</div>'
      + '<div style="font-size:11px;color:#94a3b8;margin-top:6px">💡 ' + m.tip + '</div></div></div>';
  });

  // План действий
  html += '<div style="margin:0 20px 25px;background:#0f172a;color:#fff;border-radius:12px;padding:20px 25px;page-break-inside:avoid">'
    + '<div style="font-size:15px;font-weight:700;margin-bottom:15px;color:#00e5ff">📋 План действий на эту неделю</div>'
    + '<div style="font-size:12px;margin-bottom:8px">☐ Посчитать норму калорий (✅ уже: ' + userData.calories + ' ккал)</div>'
    + '<div style="font-size:12px;margin-bottom:8px">☐ Купить кухонные весы</div>'
    + '<div style="font-size:12px;margin-bottom:8px">☐ Установить FatSecret / MyFitnessPal</div>'
    + '<div style="font-size:12px;margin-bottom:8px">☐ Запланировать меню на 3 дня</div>'
    + '<div style="font-size:12px;margin-bottom:8px">☐ Убрать вредные перекусы из дома</div>'
    + '<div style="font-size:12px;margin-bottom:8px">☐ Поставить напоминание пить воду</div>'
    + '<div style="font-size:12px">☐ Сфотографировать всю еду за 1 день</div></div>';

  // CTA
  html += '<div style="margin:0 20px 20px;background:linear-gradient(135deg,#00e5ff,#06b6d4);border-radius:12px;padding:20px 25px;text-align:center;page-break-inside:avoid">'
    + '<div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:6px">Хочешь персональный план питания?</div>'
    + '<div style="font-size:13px;color:#0f172a;margin-bottom:10px">С рецептами и меню на каждый день</div>'
    + '<div style="font-size:14px;font-weight:700;color:#0f172a">👉 t.me/vitaman777</div></div>'

    + '<div style="text-align:center;padding:15px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;margin:0 20px">'
    + '© Fitness Coach Vitaliy</div></div>';

  return renderPDF(html, '7_ошибок_в_питании.pdf');
}

// --- Общая функция рендера PDF ---
function renderPDF(html, filename) {
  var container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm';
  document.body.appendChild(container);

  var opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  return html2pdf().set(opt).from(container).save().then(function() {
    document.body.removeChild(container);
  });
}

// ========== YEAR ==========
function initYear() {
  var el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

// ========== INIT ALL ==========
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  Notify.init();
  Modal.init();
  Sheet.init();
  initReveals();
  initScroll();
  initNav();
  initPageProgress();
  initStats();
  initCases();
  initReviews();
  initLeaveReview();
  initQuiz();
  initProgressCalc();
  initKBJU();
  initChallenge();
  initHabits();
  initPricing();
  initForm();
  initChatFab();
  initCabinet();
  initReferral();
  initBadges();
  initBonus();
  initAsk();
  initYear();
  hideSkeleton();
});

})();
