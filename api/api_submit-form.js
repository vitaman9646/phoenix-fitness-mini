// api/submit-form.js
// API endpoint для Vercel serverless function
// Безопасная отправка формы в Telegram

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, contact, goal, quiz, website } = req.body;

    // Honeypot защита от ботов
    if (website) {
      console.log('🤖 Bot detected - honeypot filled');
      return res.status(200).json({ success: true, message: 'Form submitted' });
    }

    // Валидация обязательных полей
    if (!name || !contact) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Имя и контакт обязательны'
      });
    }

    // Базовая валидация имени
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ 
        error: 'Invalid name',
        message: 'Имя должно быть от 2 до 100 символов'
      });
    }

    // Формируем сообщение для Telegram
    let message = `🎯 <b>Новая заявка с лендинга!</b>\n\n`;
    message += `👤 <b>Имя:</b> ${escapeHtml(name)}\n`;
    message += `📱 <b>Контакт:</b> ${escapeHtml(contact)}\n`;
    
    // Добавляем цель если указана
    if (goal) {
      const goalMap = {
        loss: 'Похудение и рельеф',
        gain: 'Набор мышечной массы',
        tone: 'Тонус и здоровье'
      };
      message += `🎯 <b>Цель:</b> ${goalMap[goal] || escapeHtml(goal)}\n`;
    }

    // Добавляем данные квиза если есть
    if (quiz && Object.keys(quiz).length > 0) {
      message += `\n📋 <b>Результаты квиза:</b>\n`;
      
      const placeMap = { 
        home: 'Дома', 
        gym: 'В зале', 
        both: 'Дома и в зале' 
      };
      const levelMap = { 
        beginner: 'Новичок', 
        middle: 'Продолжающий', 
        advanced: 'Продвинутый' 
      };
      
      if (quiz.step1) {
        const goalMap = { loss: 'Похудение', gain: 'Набор массы', tone: 'Тонус' };
        message += `• Цель: ${goalMap[quiz.step1]}\n`;
      }
      if (quiz.step2) message += `• Место: ${placeMap[quiz.step2]}\n`;
      if (quiz.step3) message += `• Частота: ${quiz.step3} раз/неделю\n`;
      if (quiz.step4) message += `• Уровень: ${levelMap[quiz.step4]}\n`;
    }

    // Добавляем метаданные
    message += `\n🕐 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}\n`;
    message += `🔗 <b>Источник:</b> Telegram Mini App\n`;

    // Проверяем наличие переменных окружения
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.error('❌ Missing environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Не настроены переменные окружения'
      });
    }

    // Отправка в Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('❌ Telegram API error:', errorText);
      
      return res.status(500).json({ 
        error: 'Failed to send to Telegram',
        message: 'Не удалось отправить сообщение. Попробуй ещё раз.'
      });
    }

    const telegramData = await telegramResponse.json();
    console.log('✅ Message sent to Telegram:', telegramData.result.message_id);

    // Опционально: отправить в Google Sheets, email и т.д.
    // await sendToGoogleSheets({ name, contact, goal, quiz });
    // await sendEmailNotification({ name, contact, goal });

    return res.status(200).json({ 
      success: true, 
      message: 'Заявка успешно отправлена!' 
    });

  } catch (error) {
    console.error('❌ Error processing form:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Произошла ошибка. Попробуй написать напрямую в Telegram.'
    });
  }
}

// Helper: Экранирование HTML для безопасности
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Опциональные дополнительные интеграции:

// Google Sheets
async function sendToGoogleSheets(data) {
  // Используй Google Sheets API или сервис типа SheetDB
  // https://sheetdb.io/
  
  /*
  const response = await fetch('https://sheetdb.io/api/v1/YOUR_SHEET_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        timestamp: new Date().toISOString(),
        name: data.name,
        contact: data.contact,
        goal: data.goal,
        quiz_place: data.quiz?.step2,
        quiz_frequency: data.quiz?.step3,
        quiz_level: data.quiz?.step4
      }]
    })
  });
  
  return response.json();
  */
}

// Email уведомление
async function sendEmailNotification(data) {
  // Используй SendGrid, Mailgun, Resend и т.д.
  
  /*
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@fitness-coach.ru',
      to: 'vitaliy@fitness-coach.ru',
      subject: 'Новая заявка с лендинга',
      html: `
        <h2>Новая заявка</h2>
        <p><strong>Имя:</strong> ${data.name}</p>
        <p><strong>Контакт:</strong> ${data.contact}</p>
        <p><strong>Цель:</strong> ${data.goal}</p>
      `
    })
  });
  
  return response.json();
  */
}
