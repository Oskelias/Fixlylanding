// PRUEBA SIMPLE DE NOTIFICACIONES (SIN KV)

const TELEGRAM_CONFIG = {
  BOT_TOKEN: '7659942257:AAE1ajAek4aC86fQqTWWhoOYmpCkhv0b0Oc',
  CHAT_ID: '1819527108',
  API_URL: 'https://api.telegram.org/bot'
};

async function sendTelegramNotification(message) {
  try {
    const url = `${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Error enviando Telegram:', error);
    return false;
  }
}

async function handleTestNotification(request) {
  try {
    const data = await request.json();
    const { empresa, email } = data;

    const testMessage = `🧪 *PRUEBA NOTIFICACIÓN FIXLY*

👤 *Empresa:* ${empresa}
📧 *Email:* ${email}
⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}

✅ Sistema funcionando correctamente!`;

    const telegramSent = await sendTelegramNotification(testMessage);

    return new Response(JSON.stringify({
      success: true,
      message: 'Prueba de notificación completada',
      telegram: telegramSent ? 'Enviado' : 'Error',
      empresa,
      email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200, 
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST' }
      });
    }

    if (path === '/test-notification' && request.method === 'POST') {
      return handleTestNotification(request);
    }

    return new Response(JSON.stringify({
      message: 'Prueba simple de notificaciones',
      endpoints: ['POST /test-notification']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};