# 🎨 Примеры кастомизации

## Вариант 1: Женский фитнес (розовые тона)

### В css/style.css:

```css
:root {
  --bg-main: #0a0512;
  --bg-dark: #120818;
  
  --accent: #ff6b9d; /* Розовый акцент */
  --accent-soft: rgba(255, 107, 157, 0.18);
  --accent-strong: rgba(255, 107, 157, 0.35);
  
  --text-main: #fff5f8;
  --text-muted: #d4a5b8;
}
```

### В index.html (Hero):

```html
<h1 class="hero-title reveal">
  Стань лучшей версией себя
</h1>

<p class="hero-subtitle reveal">
  Программы для женщин: похудение, тонус, здоровье.  
  Без изнурительных диет и часов в зале.
</p>
```

---

## Вариант 2: Кроссфит/функционалка (оранжевые тона)

### В css/style.css:

```css
:root {
  --accent: #ff6600; /* Оранжевый */
  --accent-soft: rgba(255, 102, 0, 0.18);
}
```

### В index.html:

```html
<h1 class="hero-title reveal">
  Функциональный тренинг для сильных
</h1>

<p class="hero-subtitle reveal">
  Кроссфит, гимнастика, тяжёлая атлетика.  
  Для тех, кто хочет быть не просто красивым, а сильным.
</p>
```

---

## Вариант 3: Йога/пилатес (зелёные тона)

### В css/style.css:

```css
:root {
  --accent: #4ade80; /* Зелёный */
  --accent-soft: rgba(74, 222, 128, 0.18);
}
```

### В index.html:

```html
<h1 class="hero-title reveal">
  Гармония тела и разума
</h1>

<p class="hero-subtitle reveal">
  Йога, пилатес, растяжка.  
  Персональные занятия онлайн и офлайн.
</p>
```

---

## Вариант 4: Пауэрлифтинг (красные тона)

### В css/style.css:

```css
:root {
  --accent: #ef4444; /* Красный */
  --accent-soft: rgba(239, 68, 68, 0.18);
}
```

### В index.html:

```html
<h1 class="hero-title reveal">
  Сила — это всё
</h1>

<p class="hero-subtitle reveal">
  Пауэрлифтинг, силовой тренинг.  
  Рекорды, медали, результаты.
</p>
```

---

## Кастомизация эмодзи в квизе

### В index.html (секция квиза):

**Для женского фитнеса:**
```html
<span class="quiz-option-icon">💃</span> <!-- вместо 🎯 -->
<span class="quiz-option-icon">🏠</span>
<span class="quiz-option-icon">📅</span>
<span class="quiz-option-icon">🌸</span> <!-- вместо 🌱 -->
```

**Для кроссфита:**
```html
<span class="quiz-option-icon">🔥</span>
<span class="quiz-option-icon">🏋️</span>
<span class="quiz-option-icon">⚡</span>
<span class="quiz-option-icon">💪</span>
```

---

## Изменение текстов под ниши

### Похудение:

```html
<h2 class="section-title">За 8 недель до идеальной формы</h2>
<p class="section-subtitle">
  Без жёстких диет, голодовок и изматывающих кардио.
</p>
```

### Набор массы:

```html
<h2 class="section-title">Набери 5+ кг мышц за 12 недель</h2>
<p class="section-subtitle">
  Прогрессия нагрузки, питание, восстановление.
</p>
```

### Растяжка/гибкость:

```html
<h2 class="section-title">Сядь на шпагат за 30 дней</h2>
<p class="section-subtitle">
  Безопасная растяжка для любого уровня.
</p>
```

---

## Добавление новых секций

### Секция "Программы и цены"

Добавь после секции `#approach`:

```html
<section class="section" id="pricing">
  <div class="container">
    <h2 class="section-title reveal">Программы и цены</h2>
    <div class="grid grid-3">
      
      <div class="card card-outline reveal">
        <div class="card-label">Стартовый</div>
        <h3 class="card-title">1 месяц</h3>
        <div style="font-size: 32px; font-weight: 700; color: var(--accent); margin: 16px 0;">
          5 000 ₽
        </div>
        <ul style="list-style: none; padding: 0;">
          <li>✓ Программа тренировок</li>
          <li>✓ План питания</li>
          <li>✓ Чат-поддержка</li>
        </ul>
        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" 
                data-scroll-target="#ctaFinal">
          Выбрать
        </button>
      </div>

      <div class="card card-outline reveal">
        <div class="card-label">Популярный</div>
        <h3 class="card-title">3 месяца</h3>
        <div style="font-size: 32px; font-weight: 700; color: var(--accent); margin: 16px 0;">
          12 000 ₽
        </div>
        <ul style="list-style: none; padding: 0;">
          <li>✓ Всё из Стартового</li>
          <li>✓ Видео-разборы техники</li>
          <li>✓ Еженедельные созвоны</li>
        </ul>
        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" 
                data-scroll-target="#ctaFinal">
          Выбрать
        </button>
      </div>

      <div class="card card-outline reveal">
        <div class="card-label">VIP</div>
        <h3 class="card-title">6 месяцев</h3>
        <div style="font-size: 32px; font-weight: 700; color: var(--accent); margin: 16px 0;">
          20 000 ₽
        </div>
        <ul style="list-style: none; padding: 0;">
          <li>✓ Всё из Популярного</li>
          <li>✓ Личные встречи (офлайн)</li>
          <li>✓ Доступ к закрытому чату</li>
        </ul>
        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" 
                data-scroll-target="#ctaFinal">
          Выбрать
        </button>
      </div>

    </div>
  </div>
</section>
```

---

## Изменение шрифта

### Google Fonts

В `<head>` замени на другой шрифт:

```html
<!-- Монтсеррат -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Потом в CSS -->
<style>
body {
  font-family: "Montserrat", sans-serif;
}
</style>
```

Другие варианты:
- Roboto (универсальный)
- Poppins (современный)
- Raleway (элегантный)
- Oswald (брутальный)

---

## Добавление видео в Hero

Вместо статичного фона:

```html
<section class="hero" id="hero">
  <div class="hero-bg">
    <video autoplay muted loop playsinline style="
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.3;
    ">
      <source src="images/hero-video.mp4" type="video/mp4">
    </video>
    <div class="hero-glow"></div>
  </div>
  <!-- остальное как было -->
</section>
```

---

## Готовые цветовые схемы

### Тёмно-синяя (премиум)
```css
--accent: #3b82f6;
```

### Фиолетовая (креатив)
```css
--accent: #a855f7;
```

### Янтарная (энергия)
```css
--accent: #f59e0b;
```

### Изумрудная (здоровье)
```css
--accent: #10b981;
```

---

Экспериментируй и адаптируй под свой стиль! 🎨
