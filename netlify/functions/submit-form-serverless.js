// netlify/functions/submit-form.js
// Пример serverless функции для безопасной отправки формы в Telegram
// 
// УСТАНОВКА:
// 1. Создай файл netlify/functions/submit-form.js в корне проекта
// 2. Установи переменные окружения в Netlify:
//    - TELEGRAM_BOT_TOKEN
//    - TELEGRAM_CHAT_ID
// 3. Deploy на Netlify
// 
// Функция будет доступна по адресу: /.netlify/functions/submit-form

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    if (!data.name || !data.contact) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Basic spam protection - check honeypot
    if (data.website) {
      console.log('Bot detected - honeypot filled');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Form submitted' })
      };
    }

    // Rate limiting (simple implementation)
    // В production используй Redis или подобное
    const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'];
    // TODO: Implement rate limiting logic

    // Build Telegram message
    let message = `🎯 <b>Новая заявка с лендинга!</b>\n\n`;
    message += `👤 <b>Имя:</b> ${escapeHtml(data.name)}\n`;
    message += `📱 <b>Контакт:</b> ${escapeHtml(data.contact)}\n`;
    
    if (data.goal) {
      const goalMap = {
        loss: 'Похудение',
        gain: 'Набор массы',
        tone: 'Тонус и здоровье'
      };
      message += `🎯 <b>Цель:</b> ${goalMap[data.goal] || data.goal}\n`;
    }
    
    if (data.quiz && Object.keys(data.quiz).length > 0) {
      message += `\n📋 <b>Ответы на квиз:</b>\n`;
      
      const placeMap = { home: 'Дома', gym: 'Зал', both: 'Дома и в зале' };
      const levelMap = { beginner: 'Новичок', middle: 'Продолжающий', advanced: 'Продвинутый' };
      
      if (data.quiz.step2) message += `• Место: ${placeMap[data.quiz.step2]}\n`;
      if (data.quiz.step3) message += `• Частота: ${data.quiz.step3} раза/нед\n`;
      if (data.quiz.step4) message += `• Уровень: ${levelMap[data.quiz.step4]}\n`;
    }
    
    if (data.timestamp) {
      const date = new Date(data.timestamp);
      message += `\n🕐 <b>Время:</b> ${date.toLocaleString('ru-RU')}\n`;
    }
    
    if (data.source) {
      message += `🔗 <b>Источник:</b> ${escapeHtml(data.source)}\n`;
    }

    // Send to Telegram
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
      console.error('Telegram API error:', errorText);
      throw new Error('Failed to send message to Telegram');
    }

    // Опционально: отправить в Google Sheets, email, CRM и т.д.
    // await sendToGoogleSheets(data);
    // await sendEmailNotification(data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Form submitted successfully' 
      })
    };

  } catch (error) {
    console.error('Error processing form:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Опциональные дополнительные интеграции:

// Google Sheets integration
async function sendToGoogleSheets(data) {
  // Используй Google Sheets API или сервис типа SheetDB
  // const response = await fetch('https://sheetdb.io/api/v1/YOUR_SHEET_ID', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     data: [{
  //       name: data.name,
  //       contact: data.contact,
  //       goal: data.goal,
  //       timestamp: data.timestamp
  //     }]
  //   })
  // });
}

// Email notification
async function sendEmailNotification(data) {
  // Используй SendGrid, Mailgun или подобный сервис
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // 
  // const msg = {
  //   to: 'vitaliy@fitness.ru',
  //   from: 'noreply@fitness.ru',
  //   subject: 'Новая заявка с лендинга',
  //   text: `Имя: ${data.name}\nКонтакт: ${data.contact}`,
  //   html: `<strong>Имя:</strong> ${data.name}<br><strong>Контакт:</strong> ${data.contact}`
  // };
  // 
  // await sgMail.send(msg);
}
