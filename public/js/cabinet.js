/* =============================================
   ЛИЧНЫЙ КАБИНЕТ — JS
   ============================================= */
(function () {
  'use strict';

  const tg = window.Telegram?.WebApp;
  const isTelegram = !!tg;

  // ==========================================
  // STORAGE — единая точка работы с данными
  // ==========================================
  const Storage = {
    _data: {},

    init() {
      try {
        const raw = localStorage.getItem('fitCabinet');
        this._data = raw ? JSON.parse(raw) : this._defaults();
      } catch (e) {
        this._data = this._defaults();
      }
    },

    _defaults() {
      return {
        user: {
          name: '',
          tariff: 'standard',
          startDate: new Date().toISOString(),
          startWeight: null,
          goalWeight: null
        },
        measurements: [],
        bodyMeasurements: {},
        habits: [
          { id: 1, text: 'Тренировка', completed: false },
          { id: 2, text: 'Выпить 8 стаканов воды', completed: false },
          { id: 3, text: 'Считать КБЖУ', completed: false },
          { id: 4, text: 'Спать 7+ часов', completed: false }
        ],
        habitsHistory: {},
        water: { current: 0, goal: 8 },
        challenge: {
          id: 1,
          desc: '«50 приседаний каждый день»',
          days: 0,
          total: 7,
          checkedToday: false,
          startDate: new Date().toISOString()
        },
        achievements: {},
        xp: 0,
        workouts: 0,
        streak: 0,
        bestStreak: 0,
        referralCode: '',
        referralCount: 0,
        settings: {
          notifyWorkouts: true,
          notifyWater: false,
          workoutTime: '08:00',
          waterGoal: 8
        }
      };
    },

    get(key) {
      return key.split('.').reduce((obj, k) => obj?.[k], this._data);
    },

    set(key, value) {
      const keys = key.split('.');
      let obj = this._data;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      this.save();
    },

    save() {
      try {
        localStorage.setItem('fitCabinet', JSON.stringify(this._data));

        if (isTelegram && tg.CloudStorage) {
          tg.CloudStorage.setItem(
            'fitCabinet',
            JSON.stringify(this._data),
            () => {}
          );
        }
      } catch (e) {
        console.warn('Storage save failed', e);
      }
    },

    getData() { return this._data; }
  };

  // ==========================================
  // ACHIEVEMENTS SYSTEM
  // ==========================================
  const Achievements = {
    definitions: [
      // Тренировки
      {
        id: 'first_workout', cat: 'training', icon: '🎯',
        name: 'Первый шаг', desc: 'Первая тренировка', xp: 10,
        check: (d) => d.workouts >= 1
      },
      {
        id: 'week_warrior', cat: 'training', icon: '🔥',
        name: 'Неделя огня', desc: '7 тренировок', xp: 25,
        check: (d) => d.workouts >= 7
      },
      {
        id: 'month_beast', cat: 'training', icon: '💪',
        name: 'Месяц силы', desc: '30 тренировок', xp: 50,
        check: (d) => d.workouts >= 30
      },
      {
        id: 'century', cat: 'training', icon: '🏅',
        name: 'Сотка', desc: '100 тренировок', xp: 100,
        check: (d) => d.workouts >= 100
      },

      // Питание
      {
        id: 'water_day', cat: 'nutrition', icon: '💧',
        name: 'Водный баланс', desc: 'Выпить норму воды', xp: 5,
        check: (d) => d.water.current >= d.water.goal
      },
      {
        id: 'habit_master', cat: 'nutrition', icon: '✅',
        name: 'Все привычки', desc: 'Выполнить все за день', xp: 15,
        check: (d) => {
          const habits = d.habits || [];
          return habits.length > 0 && habits.every((h) => h.completed);
        }
      },

      // Прогресс
      {
        id: 'first_kg', cat: 'progress', icon: '📉',
        name: 'Минус 1 кг', desc: 'Сбросить первый килограмм', xp: 20,
        check: (d) => {
          if (!d.user.startWeight || d.measurements.length === 0) return false;
          const last = d.measurements[d.measurements.length - 1];
          return d.user.startWeight - last.weight >= 1;
        }
      },
      {
        id: 'five_kg', cat: 'progress', icon: '🎊',
        name: 'Минус 5 кг', desc: 'Сбросить 5 килограмм', xp: 50,
        check: (d) => {
          if (!d.user.startWeight || d.measurements.length === 0) return false;
          const last = d.measurements[d.measurements.length - 1];
          return d.user.startWeight - last.weight >= 5;
        }
      },
      {
        id: 'ten_kg', cat: 'progress', icon: '🏆',
        name: 'Минус 10 кг', desc: 'Сбросить 10 килограмм', xp: 100,
        check: (d) => {
          if (!d.user.startWeight || d.measurements.length === 0) return false;
          const last = d.measurements[d.measurements.length - 1];
          return d.user.startWeight - last.weight >= 10;
        }
      },
      {
        id: 'goal_reached', cat: 'progress', icon: '🌟',
        name: 'Цель достигнута', desc: 'Достичь целевого веса', xp: 200,
        check: (d) => {
          if (!d.user.goalWeight || d.measurements.length === 0) return false;
          const last = d.measurements[d.measurements.length - 1];
          return last.weight <= d.user.goalWeight;
        }
      },

      // Особые
      {
        id: 'streak_7', cat: 'special', icon: '🔥',
        name: '7 дней подряд', desc: 'Серия из 7 дней', xp: 30,
        check: (d) => d.streak >= 7
      },
      {
        id: 'streak_30', cat: 'special', icon: '💎',
        name: '30 дней подряд', desc: 'Серия из 30 дней', xp: 100,
        check: (d) => d.streak >= 30
      },
      {
        id: 'referral_1', cat: 'special', icon: '🎁',
        name: 'Первый реферал', desc: 'Привёл друга', xp: 25,
        check: (d) => d.referralCount >= 1
      },
      {
        id: 'quiz_done', cat: 'special', icon: '📋',
        name: 'Квиз пройден', desc: 'Пройти квиз на сайте', xp: 5,
        check: () => !!sessionStorage.getItem('quizAnswers')
      }
    ],

    checkAll() {
      const data = Storage.getData();
      const earned = data.achievements || {};
      let newXP = 0;
      const newBadges = [];

      this.definitions.forEach((badge) => {
        if (!earned[badge.id] && badge.check(data)) {
          earned[badge.id] = {
            earnedAt: new Date().toISOString()
          };
          newXP += badge.xp;
          newBadges.push(badge);
        }
      });

      if (newBadges.length > 0) {
        Storage.set('achievements', earned);
        Storage.set('xp', (data.xp || 0) + newXP);

        newBadges.forEach((badge, i) => {
          setTimeout(() => this.showToast(badge), i * 2000);
        });
      }

      return newBadges;
    },

    showToast(badge) {
      const toast = document.getElementById('badgeToast');
      const icon = document.getElementById('badgeToastIcon');
      const name = document.getElementById('badgeToastName');

      if (!toast) return;

      icon.textContent = badge.icon;
      name.textContent = `${badge.name} (+${badge.xp} XP)`;

      toast.classList.add('show');

      if (isTelegram && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }

      setTimeout(() => toast.classList.remove('show'), 3000);
    },

    render() {
      const data = Storage.getData();
      const earned = data.achievements || {};

      const categories = {
        training: 'trainingBadges',
        nutrition: 'nutritionBadges',
        progress: 'progressBadges',
        special: 'specialBadges'
      };

      let totalEarned = 0;
      const total = this.definitions.length;

      Object.keys(categories).forEach((cat) => {
        const container = document.getElementById(categories[cat]);
        if (!container) return;

        const badges = this.definitions.filter((b) => b.cat === cat);

        container.innerHTML = badges
          .map((b) => {
            const isEarned = !!earned[b.id];
            if (isEarned) totalEarned++;

            return `
              <div class="badge ${isEarned ? 'earned' : 'locked'}" 
                   title="${b.desc}">
                <div class="badge-icon">${b.icon}</div>
                <div class="badge-name">${b.name}</div>
                <div class="badge-xp">${b.xp} XP</div>
              </div>`;
          })
          .join('');
      });

      // Summary
      const earnedEl = document.getElementById('earnedBadges');
      const totalEl = document.getElementById('totalBadges');
      const xpEl = document.getElementById('totalXP');

      if (earnedEl) earnedEl.textContent = totalEarned;
      if (totalEl) totalEl.textContent = total;
      if (xpEl) xpEl.textContent = data.xp || 0;

      // Level
      this.renderLevel(data.xp || 0);
    },

    renderLevel(xp) {
      const levels = [
        { level: 1, name: 'Новичок', min: 0, max: 100 },
        { level: 2, name: 'Ученик', min: 100, max: 250 },
        { level: 3, name: 'Спортсмен', min: 250, max: 500 },
        { level: 4, name: 'Атлет', min: 500, max: 1000 },
        { level: 5, name: 'Мастер', min: 1000, max: 2000 },
        { level: 6, name: 'Легенда', min: 2000, max: Infinity }
      ];

      const current = levels.find((l) => xp >= l.min && xp < l.max) || levels[0];
      const progress =
        current.max === Infinity
          ? 100
          : ((xp - current.min) / (current.max - current.min)) * 100;

      const levelNum = document.getElementById('userLevel');
      const levelName = document.getElementById('levelName');
      const levelFill = document.getElementById('levelFill');
      const levelXP = document.getElementById('levelXPText');

      if (levelNum) levelNum.textContent = current.level;
      if (levelName) levelName.textContent = current.name;
      if (levelFill) levelFill.style.width = progress + '%';
      if (levelXP) {
        levelXP.textContent =
          current.max === Infinity
            ? `${xp} XP — Максимальный уровень!`
            : `${xp} / ${current.max} XP`;
      }
    }
  };

  // ==========================================
  // CABINET UI
  // ==========================================
  const CabinetUI = {
    isOpen: false,

    init() {
      this.bindFab();
      this.bindClose();
      this.bindTabs();
      this.bindSettings();
      this.initProfile();
      this.initProgressCalc();
      this.initMeasurements();
      this.initHabits();
      this.initWater();
      this.initChallenge();
      this.initReferral();
      this.initChat();

      Achievements.render();

      this.checkClientStatus();
    },

    checkClientStatus() {
      const fab = document.getElementById('cabinetFab');
      if (!fab) return;

      const data = Storage.getData();
      const hasData =
        data.measurements.length > 0 ||
        data.workouts > 0 ||
        data.user.name;

      if (hasData || isTelegram) {
        fab.style.display = 'flex';
      }
    },

    // --- FAB ---
    bindFab() {
      const fab = document.getElementById('cabinetFab');
      if (fab) {
        fab.addEventListener('click', () => this.open());
      }
    },

    open() {
      const overlay = document.getElementById('cabinetOverlay');
      if (!overlay) return;

      overlay.style.display = 'block';
      this.isOpen = true;
      document.body.style.overflow = 'hidden';

      this.refreshAll();

      if (isTelegram) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => this.close());
        tg.MainButton.hide();
      }

      if (isTelegram && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    },

    close() {
      const overlay = document.getElementById('cabinetOverlay');
      if (!overlay) return;

      overlay.classList.add('closing');

      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('closing');
        this.isOpen = false;
        document.body.style.overflow = '';

        if (isTelegram) {
          tg.BackButton.hide();
          tg.MainButton.show();
        }
      }, 300);
    },

    bindClose() {
      const closeBtn = document.getElementById('cabinetClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
    },

    // --- Tabs ---
    bindTabs() {
      document.querySelectorAll('.cabinet-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.cabTab;

          document.querySelectorAll('.cabinet-tab').forEach((t) =>
            t.classList.remove('active')
          );
          document.querySelectorAll('.cab-panel').forEach((p) =>
            p.classList.remove('active')
          );

          tab.classList.add('active');
          const panel = document.querySelector(
            `[data-cab-panel="${target}"]`
          );
          if (panel) panel.classList.add('active');

          if (isTelegram && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
          }
        });
      });
    },

    // --- Settings ---
    bindSettings() {
      const toggle = document.getElementById('settingsToggle');
      const sheet = document.getElementById('settingsSheet');
      const save = document.getElementById('saveSettings');
      const logout = document.getElementById('logoutBtn');

      if (toggle && sheet) {
        toggle.addEventListener('click', () => {
          sheet.classList.toggle('active');
        });
      }

      if (save) {
        save.addEventListener('click', () => {
          const settings = {
            notifyWorkouts: document.getElementById('notifyWorkouts')?.checked,
            notifyWater: document.getElementById('notifyWater')?.checked,
            workoutTime: document.getElementById('workoutTime')?.value,
            waterGoal:
              parseInt(document.getElementById('waterGoalInput')?.value) || 8
          };

          Storage.set('settings', settings);
          Storage.set('water.goal', settings.waterGoal);

          const waterGoalEl = document.getElementById('waterGoal');
          if (waterGoalEl) waterGoalEl.textContent = settings.waterGoal;

          this.updateWaterDisplay();

          sheet.classList.remove('active');

          if (window.Notify) {
            window.Notify.show('Настройки сохранены ✓', 'success');
          }
        });
      }

      if (logout) {
        logout.addEventListener('click', () => {
          if (sheet) sheet.classList.remove('active');
          this.close();
        });
      }
    },

    // --- Profile ---
    initProfile() {
      const data = Storage.getData();

      if (isTelegram && tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        const name =
          user.first_name + (user.last_name ? ' ' + user.last_name : '');
        Storage.set('user.name', name);

        const initialsEl = document.getElementById('userInitials');
        if (initialsEl) {
          initialsEl.textContent =
            user.first_name[0] + (user.last_name?.[0] || '');
        }
      }

      const nameEl = document.getElementById('userName');
      if (nameEl) {
        nameEl.textContent = data.user.name || 'Клиент';
      }

      this.updateDaysCount();
    },

    updateDaysCount() {
      const data = Storage.getData();
      const start = new Date(data.user.startDate);
      const now = new Date();
      const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));

      const el = document.getElementById('userDays');
      if (el) {
        el.innerHTML = `Дней в системе: <strong>${days}</strong>`;
      }
    },

    // --- Progress Calculator ---
    initProgressCalc() {
      const calcBtn = document.getElementById('calcProgress');
      if (!calcBtn) return;

      const data = Storage.getData();
      if (data.user.startWeight) {
        document.getElementById('startWeight').value = data.user.startWeight;
      }
      if (data.user.goalWeight) {
        document.getElementById('goalWeight').value = data.user.goalWeight;
      }
      if (data.measurements.length > 0) {
        document.getElementById('currentWeight').value =
          data.measurements[data.measurements.length - 1].weight;
      }

      calcBtn.addEventListener('click', () => {
        const startW = parseFloat(
          document.getElementById('startWeight').value
        );
        const currentW = parseFloat(
          document.getElementById('currentWeight').value
        );
        const goalW = parseFloat(
          document.getElementById('goalWeight').value
        );

        if (!startW || !currentW || !goalW) {
          if (window.Notify) {
            window.Notify.show('Заполни все поля', 'warning');
          }
          return;
        }

        Storage.set('user.startWeight', startW);
        Storage.set('user.goalWeight', goalW);

        const lost = startW - currentW;
        const total = startW - goalW;
        const percent =
          total > 0 ? Math.min(Math.round((lost / total) * 100), 100) : 0;
        const remain = Math.max(currentW - goalW, 0);

        document.getElementById('lostWeight').textContent =
          lost.toFixed(1) + ' кг';
        document.getElementById('progressPercent').textContent = percent + '%';
        document.getElementById('remainWeight').textContent =
          remain.toFixed(1) + ' кг';

        document.getElementById('calcResults').style.display = 'grid';

        // Visual progress
        const vpEl = document.getElementById('visualProgress');
        const vpFill = document.getElementById('visualFill');
        const vpMarker = document.getElementById('visualMarker');
        const vpStart = document.getElementById('vpStart');
        const vpGoal = document.getElementById('vpGoal');

        if (vpEl) {
          vpEl.style.display = 'block';
          setTimeout(() => {
            vpFill.style.width = percent + '%';
            vpMarker.style.left = percent + '%';
            vpMarker.textContent = currentW;
          }, 100);
          vpStart.textContent = startW + ' кг';
          vpGoal.textContent = goalW + ' кг';
        }

        // Update quick stats
        document.getElementById('qsLost').textContent =
          lost.toFixed(1) + ' кг';

        Achievements.checkAll();
        Achievements.render();

        if (isTelegram && tg.HapticFeedback) {
          tg.HapticFeedback.impactOccurred('medium');
        }
      });
    },

    // --- Measurements ---
    initMeasurements() {
      const addBtn = document.getElementById('addMeasurement');
      const dateInput = document.getElementById('newDate');

      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const weight = parseFloat(
            document.getElementById('newWeight').value
          );
          const date = document.getElementById('newDate').value;

          if (!weight || !date) {
            if (window.Notify) {
              window.Notify.show('Введи вес и дату', 'warning');
            }
            return;
          }

          const data = Storage.getData();
          data.measurements.push({ weight, date });
          data.measurements.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          Storage.set('measurements', data.measurements);

          document.getElementById('newWeight').value = '';
          document.getElementById('currentWeight').value = weight;
          document.getElementById('qsWeight').textContent = weight + ' кг';

          this.renderMeasurements();
          this.renderChart();
          Achievements.checkAll();
          Achievements.render();

          if (isTelegram && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
          }
        });
      }

      // Body measurements save
      const saveBody = document.getElementById('saveBodyMeasures');
      if (saveBody) {
        saveBody.addEventListener('click', () => {
          const measures = {
            chest: document.getElementById('measureChest')?.value || '',
            waist: document.getElementById('measureWaist')?.value || '',
            hips: document.getElementById('measureHips')?.value || '',
            bicep: document.getElementById('measureBicep')?.value || '',
            date: new Date().toISOString()
          };

          Storage.set('bodyMeasurements', measures);

          if (window.Notify) {
            window.Notify.show('Замеры сохранены ✓', 'success');
          }
        });

        // Load existing
        const body = Storage.get('bodyMeasurements');
        if (body) {
          if (body.chest)
            document.getElementById('measureChest').value = body.chest;
          if (body.waist)
            document.getElementById('measureWaist').value = body.waist;
          if (body.hips)
            document.getElementById('measureHips').value = body.hips;
          if (body.bicep)
            document.getElementById('measureBicep').value = body.bicep;
        }
      }
    },

    renderMeasurements() {
      const list = document.getElementById('measurementsList');
      if (!list) return;

      const data = Storage.getData();
      const measurements = [...data.measurements].reverse();

      if (measurements.length === 0) {
        list.innerHTML =
          '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center">Нет замеров. Добавь первый!</p>';
        return;
      }

      list.innerHTML = measurements
        .map((m, i) => {
          const prev = measurements[i + 1];
          let diffHtml = '';

          if (prev) {
            const diff = m.weight - prev.weight;
            const cls = diff < 0 ? 'diff-negative' : 'diff-positive';
            const sign = diff < 0 ? '' : '+';
            diffHtml = `<span class="measurement-diff ${cls}">${sign}${diff.toFixed(1)}</span>`;
          }

          const dateFormatted = new Date(m.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
          });

          return `
            <div class="measurement-entry">
              <span class="measurement-date">${dateFormatted}</span>
              <span class="measurement-value">${m.weight} кг</span>
              ${diffHtml}
              <button class="measurement-delete" 
                      data-index="${data.measurements.length - 1 - i}" 
                      title="Удалить">✕</button>
            </div>`;
        })
        .join('');

      // Delete handlers
      list.querySelectorAll('.measurement-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index);
          const mData = Storage.getData();
          mData.measurements.splice(index, 1);
          Storage.set('measurements', mData.measurements);
          this.renderMeasurements();
          this.renderChart();
        });
      });
    },

    renderChart() {
      const canvas = document.getElementById('weightChart');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const data = Storage.getData();
      const measurements = data.measurements;

      // Set canvas size
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width - 32;
      canvas.height = 200;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (measurements.length < 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          'Добавь минимум 2 замера для графика',
          canvas.width / 2,
          canvas.height / 2
        );
        return;
      }

      const weights = measurements.map((m) => m.weight);
      const minW = Math.min(...weights) - 2;
      const maxW = Math.max(...weights) + 2;
      const range = maxW - minW || 1;

      const padding = { top: 20, right: 20, bottom: 30, left: 45 };
      const chartW = canvas.width - padding.left - padding.right;
      const chartH = canvas.height - padding.top - padding.bottom;

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();

        const val = maxW - (range / 4) * i;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(1), padding.left - 5, y + 3);
      }

      // Line
      const points = measurements.map((m, i) => ({
        x: padding.left + (i / (measurements.length - 1)) * chartW,
        y: padding.top + ((maxW - m.weight) / range) * chartH
      }));

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,229,255,0.2)');
      gradient.addColorStop(1, 'rgba(0,229,255,0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, canvas.height - padding.bottom);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, canvas.height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dots
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
      });

      // Date labels
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';

      const labelStep = Math.max(1, Math.floor(measurements.length / 5));
      measurements.forEach((m, i) => {
        if (i % labelStep === 0 || i === measurements.length - 1) {
          const date = new Date(m.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
          });
          ctx.fillText(date, points[i].x, canvas.height - 5);
        }
      });

      // Goal line
      if (data.user.goalWeight) {
        const goalY =
          padding.top + ((maxW - data.user.goalWeight) / range) * chartH;
        if (goalY > padding.top && goalY < canvas.height - padding.bottom) {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = 'rgba(76,175,80,0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padding.left, goalY);
          ctx.lineTo(canvas.width - padding.right, goalY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#4caf50';
          ctx.font = '10px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('Цель', padding.left, goalY - 5);
        }
      }
    },

    // --- Habits ---
    initHabits() {
      this.renderWeekGrid();
      this.renderHabits();

      const addBtn = document.getElementById('addHabitBtn');
      const input = document.getElementById('newHabitInput');

      if (addBtn && input) {
        const addHabit = () => {
          const text = input.value.trim();
          if (!text) return;

          const data = Storage.getData();
          const newId =
            data.habits.reduce((max, h) => Math.max(max, h.id), 0) + 1;
          data.habits.push({ id: newId, text, completed: false });
          Storage.set('habits', data.habits);

          input.value = '';
          this.renderHabits();

          if (isTelegram && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
          }
        };

        addBtn.addEventListener('click', addHabit);
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') addHabit();
        });
      }
    },

    renderWeekGrid() {
      const grid = document.getElementById('weekGrid');
      if (!grid) return;

      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const history = Storage.get('habitsHistory') || {};

      grid.innerHTML = days
        .map((day, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - dayOfWeek + i);
          const dateStr = date.toISOString().split('T')[0];
          const isToday = i === dayOfWeek;
          const isFuture = i > dayOfWeek;
          const isCompleted = history[dateStr];

          return `
            <div class="week-day ${isToday ? 'today' : ''} 
                  ${isCompleted ? 'completed' : ''} 
                  ${isFuture ? 'future' : ''}">
              <span class="week-day-label">${day}</span>
              <span class="week-day-num">${date.getDate()}</span>
            </div>`;
        })
        .join('');
    },

    renderHabits() {
      const list = document.getElementById('habitsList');
      if (!list) return;

      const data = Storage.getData();

      list.innerHTML = data.habits
        .map(
          (h) => `
          <div class="habit-item ${h.completed ? 'completed' : ''}" 
               data-habit-id="${h.id}">
            <button class="habit-checkbox" data-id="${h.id}">
              ${h.completed ? '✓' : ''}
            </button>
            <span class="habit-text">${h.text}</span>
            <button class="habit-delete" data-id="${h.id}">✕</button>
          </div>`
        )
        .join('');

      // Toggle handlers
      list.querySelectorAll('.habit-checkbox').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const habits = Storage.get('habits');
          const habit = habits.find((h) => h.id === id);
          if (habit) {
            habit.completed = !habit.completed;
            Storage.set('habits', habits);
            this.renderHabits();
            this.updateHabitStats();
            this.checkDayComplete();
            Achievements.checkAll();
            Achievements.render();

            if (isTelegram && tg.HapticFeedback) {
              tg.HapticFeedback.impactOccurred('light');
            }
          }
        });
      });

      // Delete handlers
      list.querySelectorAll('.habit-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          let habits = Storage.get('habits');
          habits = habits.filter((h) => h.id !== id);
          Storage.set('habits', habits);
          this.renderHabits();
          this.updateHabitStats();
        });
      });

      this.updateHabitStats();
    },

    updateHabitStats() {
      const habits = Storage.get('habits') || [];
      const completed = habits.filter((h) => h.completed).length;
      const total = habits.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      const compEl = document.getElementById('habitsCompleted');
      const totEl = document.getElementById('habitsTotal');
      const rateEl = document.getElementById('habitsRate');

      if (compEl) compEl.textContent = completed;
      if (totEl) totEl.textContent = total;
      if (rateEl) rateEl.textContent = rate + '%';
    },

    checkDayComplete() {
      const habits = Storage.get('habits') || [];
      const allDone = habits.length > 0 && habits.every((h) => h.completed);

      if (allDone) {
        const today = new Date().toISOString().split('T')[0];
        const history = Storage.get('habitsHistory') || {};

        if (!history[today]) {
          history[today] = true;
          Storage.set('habitsHistory', history);

          // Update streak
          let streak = Storage.get('streak') || 0;
          streak++;
          Storage.set('streak', streak);

          const best = Storage.get('bestStreak') || 0;
          if (streak > best) Storage.set('bestStreak', streak);

          // Update workouts
          const workouts = (Storage.get('workouts') || 0) + 1;
          Storage.set('workouts', workouts);

          this.renderWeekGrid();
          this.refreshQuickStats();
        }
      }
    },

    // --- Water Tracker ---
    initWater() {
      const plusBtn = document.getElementById('waterPlus');
      const minusBtn = document.getElementById('waterMinus');

      if (plusBtn) {
        plusBtn.addEventListener('click', () => {
          let current = Storage.get('water.current') || 0;
          const goal = Storage.get('water.goal') || 8;
          if (current < goal * 2) {
            current++;
            Storage.set('water.current', current);
            this.updateWaterDisplay();
            Achievements.checkAll();
            Achievements.render();

            if (isTelegram && tg.HapticFeedback) {
              tg.HapticFeedback.impactOccurred('light');
            }
          }
        });
      }

      if (minusBtn) {
        minusBtn.addEventListener('click', () => {
          let current = Storage.get('water.current') || 0;
          if (current > 0) {
            current--;
            Storage.set('water.current', current);
            this.updateWaterDisplay();
          }
        });
      }

      this.updateWaterDisplay();
    },

    updateWaterDisplay() {
      const current = Storage.get('water.current') || 0;
      const goal = Storage.get('water.goal') || 8;

      const currentEl = document.getElementById('waterCurrent');
      const goalEl = document.getElementById('waterGoal');
      const levelEl = document.getElementById('waterLevel');

      if (currentEl) currentEl.textContent = current;
      if (goalEl) goalEl.textContent = goal;
      if (levelEl) {
        levelEl.style.height = Math.min((current / goal) * 100, 100) + '%';
      }
    },

    // --- Challenge ---
    initChallenge() {
      const data = Storage.getData();
      const challenges = [
        '«50 приседаний каждый день»',
        '«Планка 1 минуту каждое утро»',
        '«10 000 шагов ежедневно»',
        '«Выпивать 2л воды каждый день»',
        '«30 отжиманий каждый день»',
        '«Утренняя зарядка 10 минут»',
        '«Без сахара 7 дней»'
      ];

      // Rotate challenge weekly
      const weekNum = Math.floor(
        (Date.now() - new Date('2024-01-01').getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const currentChallenge = challenges[weekNum % challenges.length];

      const descEl = document.getElementById('challengeDesc');
      if (descEl) descEl.textContent = currentChallenge;

      const fill = document.getElementById('challengeFill');
      const text = document.getElementById('challengeText');
      const days = data.challenge.days || 0;
      const total = data.challenge.total || 7;

      if (fill) fill.style.width = (days / total) * 100 + '%';
      if (text) text.textContent = `${days} / ${total} дней`;

      const checkIn = document.getElementById('challengeCheckIn');
      if (checkIn) {
        if (data.challenge.checkedToday) {
          checkIn.textContent = '✓ Отмечено';
          checkIn.disabled = true;
          checkIn.classList.add('btn-ghost');
          checkIn.classList.remove('btn-primary');
        }

        checkIn.addEventListener('click', () => {
          if (data.challenge.checkedToday) return;

          const newDays = days + 1;
          Storage.set('challenge.days', newDays);
          Storage.set('challenge.checkedToday', true);

          if (fill) fill.style.width = (newDays / total) * 100 + '%';
          if (text) text.textContent = `${newDays} / ${total} дней`;

          checkIn.textContent = '✓ Отмечено';
          checkIn.disabled = true;
          checkIn.classList.add('btn-ghost');
          checkIn.classList.remove('btn-primary');

          if (isTelegram && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }

          if (newDays >= total && window.Notify) {
            window.Notify.show('🎉 Челлендж выполнен! Так держать!', 'success', 5000);
          }
        });
      }
    },

    // --- Referral ---
    initReferral() {
      const data = Storage.getData();

      // Generate code if not exists
      if (!data.referralCode) {
        const code =
          'FIT-' +
          Math.random().toString(36).substring(2, 7).toUpperCase();
        Storage.set('referralCode', code);
      }

      const codeInput = document.getElementById('referralCode');
      if (codeInput) {
        codeInput.value = Storage.get('referralCode');
      }

      const countEl = document.getElementById('referralCount');
      const earnedEl = document.getElementById('referralEarned');
      if (countEl) countEl.textContent = data.referralCount || 0;
      if (earnedEl) {
        earnedEl.textContent = ((data.referralCount || 0) * 200) + '₽';
      }

      // Copy
      const copyBtn = document.getElementById('copyReferral');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const code = Storage.get('referralCode');
          navigator.clipboard.writeText(code).then(() => {
            if (window.Notify) {
              window.Notify.show('Код скопирован!', 'success');
            }
          });
        });
      }

      // Share
      const shareBtn = document.getElementById('shareReferral');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          const code = Storage.get('referralCode');
          const text = `Тренируюсь с фитнес-тренером Виталием! 🏋️ Присоединяйся по коду ${code} и получи скидку! 💪`;

          if (isTelegram) {
            tg.openTelegramLink(
              `https://t.me/share/url?url=${encodeURIComponent('https://t.me/your_bot/app')}&text=${encodeURIComponent(text)}`
            );
          } else if (navigator.share) {
            navigator.share({ title: 'Фитнес тренер', text });
          } else {
            navigator.clipboard.writeText(text);
            if (window.Notify) {
              window.Notify.show('Скопировано!', 'success');
            }
          }
        });
      }
    },

    // --- Chat ---
    initChat() {
      const openBtn = document.getElementById('openTrainerChat');
      if (openBtn) {
        openBtn.addEventListener('click', () => {
          if (isTelegram) {
            tg.openTelegramLink('https://t.me/vitaman777');
          } else {
            window.open('https://t.me/vitaman777', '_blank');
          }
        });
      }
    },

    // --- Quick Stats ---
    refreshQuickStats() {
      const data = Storage.getData();

      const qsWeight = document.getElementById('qsWeight');
      const qsLost = document.getElementById('qsLost');
      const qsWorkouts = document.getElementById('qsWorkouts');
      const qsStreak = document.getElementById('qsStreak');
      const streakCount = document.getElementById('streakCount');

      if (data.measurements.length > 0) {
        const lastWeight = data.measurements[data.measurements.length - 1].weight;
        if (qsWeight) qsWeight.textContent = lastWeight + ' кг';

        if (data.user.startWeight && qsLost) {
          const lost = data.user.startWeight - lastWeight;
          qsLost.textContent = lost.toFixed(1) + ' кг';
        }
      }

      if (qsWorkouts) qsWorkouts.textContent = data.workouts || 0;
      if (qsStreak) qsStreak.textContent = data.streak || 0;
      if (streakCount) streakCount.textContent = data.streak || 0;
    },

    // --- Refresh All ---
    refreshAll() {
      this.initProfile();
      this.refreshQuickStats();
      this.renderMeasurements();
      this.renderChart();
      this.renderWeekGrid();
      this.renderHabits();
      this.updateWaterDisplay();
      Achievements.checkAll();
      Achievements.render();
    }
  };

  // ==========================================
  // DAILY RESET (вода, привычки)
  // ==========================================
  function checkDailyReset() {
    const lastDate = localStorage.getItem('fitLastDate');
    const today = new Date().toISOString().split('T')[0];

    if (lastDate !== today) {
      // Reset daily items
      Storage.set('water.current', 0);
      Storage.set('challenge.checkedToday', false);

      const habits = Storage.get('habits') || [];
      habits.forEach((h) => (h.completed = false));
      Storage.set('habits', habits);

      // Check if streak broken
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const history = Storage.get('habitsHistory') || {};

      if (lastDate && !history[yesterdayStr]) {
        Storage.set('streak', 0);
      }

      localStorage.setItem('fitLastDate', today);
    }
  }

  // ==========================================
  // INIT
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
    checkDailyReset();
    CabinetUI.init();
  });

  // Expose for other scripts
  window.CabinetUI = CabinetUI;
  window.Storage = Storage;
})();
