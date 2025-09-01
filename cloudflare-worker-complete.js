// =================================================================
// CLOUDFLARE WORKER COMPLETO CON EMAILES Y CORS CORREGIDO
// Sube este archivo completo a Cloudflare Workers
// =================================================================

// CONFIGURACIONES
const CONFIG = {
  ADMIN_USER: 'admin',
  ADMIN_PASS: 'fixly2024!',
  EMAIL_CONFIG: {
    FROM_EMAIL: 'noreply@fixlytaller.com',
    ADMIN_EMAIL: 'admin@fixlytaller.com', 
    FROM_NAME: 'Fixly Taller - Sistema Automático',
    MAILCHANNELS_API: 'https://api.mailchannels.net/tx/v1/send'
  },
  TELEGRAM: {
    BOT_TOKEN: '8009458111:AAGfHX4pSPiA34-otoL3gUfFO8Jsb_bWaAA',
    CHAT_ID: '-4535906807'
  }
};

// =================================================================
// FUNCIONES DE CORS - SOLUCIÓN AL PROBLEMA
// =================================================================
function handleCORS(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
  return corsHeaders;
}

function corsResponse(response, request) {
  const corsHeaders = handleCORS(request);
  Object.keys(corsHeaders).forEach(key => {
    response.headers.set(key, corsHeaders[key]);
  });
  return response;
}

// =================================================================
// FUNCIONES DE EMAIL MEJORADAS
// =================================================================
async function sendEmail(to, subject, html, text) {
  try {
    const emailData = {
      personalizations: [{
        to: [{ email: to }]
      }],
      from: {
        email: CONFIG.EMAIL_CONFIG.FROM_EMAIL,
        name: CONFIG.EMAIL_CONFIG.FROM_NAME
      },
      subject: subject,
      content: [
        { type: 'text/html', value: html },
        { type: 'text/plain', value: text }
      ]
    };

    const response = await fetch(CONFIG.EMAIL_CONFIG.MAILCHANNELS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log(`Email enviado exitosamente a ${to}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Error enviando email a ${to}:`, response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error(`Error de conexión enviando email:`, error);
    return false;
  }
}

async function sendEmailCredenciales(email, empresa, username, password) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .credenciales { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0; }
        .acceso { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛠️ Fixly Taller</h1>
            <p>¡Bienvenido al sistema!</p>
        </div>
        
        <h2>Hola ${empresa},</h2>
        <p>¡Excelentes noticias! Tu acceso a <strong>Fixly Taller</strong> ya está listo.</p>
        
        <div class="credenciales">
            <h3>🔐 Tus Credenciales de Acceso:</h3>
            <p><strong>Usuario:</strong> <code>${username}</code></p>
            <p><strong>Contraseña:</strong> <code>${password}</code></p>
        </div>
        
        <div class="acceso">
            <h3>🚀 Cómo acceder:</h3>
            <ol>
                <li>Ve a: <a href="https://app.fixlytaller.com">app.fixlytaller.com</a></li>
                <li>Haz clic en "Acceder al Sistema"</li>
                <li>Ingresa tus credenciales</li>
                <li>¡Comienza a gestionar tu taller!</li>
            </ol>
        </div>
        
        <h3>📋 Características incluidas:</h3>
        <ul>
            <li>✅ Gestión de órdenes de trabajo</li>
            <li>✅ Control de inventario</li>
            <li>✅ Gestión de clientes</li>
            <li>✅ Reportes y estadísticas</li>
            <li>✅ Sistema de facturación</li>
        </ul>
        
        <h3>💡 ¿Necesitas ayuda?</h3>
        <p>📧 Soporte: <a href="mailto:soporte@fixlytaller.com">soporte@fixlytaller.com</a></p>
        <p>📖 Guía de usuario: <a href="https://fixlytaller.com/guia">fixlytaller.com/guia</a></p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://app.fixlytaller.com" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                🚀 ACCEDER AHORA
            </a>
        </div>
        
        <div class="footer">
            <p>Fixly Taller - Sistema de Gestión para Talleres</p>
            <p>¡Gracias por confiar en nosotros!</p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Hola ${empresa},

¡Tu acceso a Fixly Taller ya está listo!

CREDENCIALES DE ACCESO:
- Usuario: ${username}
- Contraseña: ${password}

CÓMO ACCEDER:
1. Ve a: https://app.fixlytaller.com
2. Haz clic en "Acceder al Sistema"
3. Ingresa tus credenciales
4. ¡Comienza a gestionar tu taller!

¿Necesitas ayuda?
- Soporte: soporte@fixlytaller.com
- Guía: https://fixlytaller.com/guia

¡Gracias por confiar en Fixly Taller!
`;

  return await sendEmail(
    email,
    '🎉 ¡Tu acceso a Fixly Taller está listo!',
    html,
    text
  );
}

// =================================================================
// TELEGRAM NOTIFICATIONS
// =================================================================
async function sendTelegramNotification(message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CONFIG.TELEGRAM.CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (response.ok) {
      console.log('Notificación Telegram enviada');
      return true;
    } else {
      console.error('Error enviando Telegram:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error de conexión Telegram:', error);
    return false;
  }
}

// =================================================================
// GENERAR CREDENCIALES
// =================================================================
function generarCredenciales(empresa) {
  // Username limpio basado en empresa
  let username = empresa
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);
  
  if (username.length < 3) {
    username = 'taller' + Math.floor(Math.random() * 1000);
  }
  
  // Password seguro
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return { username, password };
}

// =================================================================
// ENDPOINTS PRINCIPALES
// =================================================================

// ENDPOINT: Generar código (mejorado con emails)
async function handleGenerateCode(request, env) {
  try {
    const data = await request.json();
    const { empresa, email, telefono = '', tipo = 'trial', duracion = 30 } = data;

    if (!empresa || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Empresa y email son requeridos'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    // Generar credenciales
    const { username, password } = generarCredenciales(empresa);
    const userId = 'user_' + Date.now();
    const fechaCreacion = new Date().toISOString();
    const fechaExpiracion = new Date(Date.now() + (duracion * 24 * 60 * 60 * 1000)).toISOString();

    // Guardar usuario en KV
    const userData = {
      id: userId,
      username,
      password,
      empresa,
      email,
      telefono,
      tipo,
      fechaCreacion,
      fechaExpiracion,
      activo: true
    };

    await env.FIXLY_KV.put(`user_${username}`, JSON.stringify(userData));
    await env.FIXLY_KV.put(userId, JSON.stringify(userData));

    // 📧 ENVIAR EMAIL CON CREDENCIALES
    const emailEnviado = await sendEmailCredenciales(email, empresa, username, password);

    // 📱 NOTIFICACIÓN TELEGRAM
    const telegramMessage = `🎉 <b>NUEVO USUARIO CREADO</b>

🏢 <b>Empresa:</b> ${empresa}
👤 <b>Usuario:</b> ${username}
📧 <b>Email:</b> ${email}
📱 <b>Teléfono:</b> ${telefono || 'No proporcionado'}
📅 <b>Tipo:</b> ${tipo} (${duracion} días)
📧 <b>Email enviado:</b> ${emailEnviado ? '✅ Sí' : '❌ Error'}
⏰ <b>Creado:</b> ${new Date().toLocaleString('es-ES')}

🔗 <a href="https://app.fixlytaller.com">Acceder al sistema</a>`;

    const telegramEnviado = await sendTelegramNotification(telegramMessage);

    return new Response(JSON.stringify({
      success: true,
      message: 'Usuario creado exitosamente',
      username,
      userId,
      empresa,
      fechaCreacion,
      fechaExpiracion,
      notificaciones: {
        email: emailEnviado ? 'Enviado' : 'Error',
        telegram: telegramEnviado ? 'Enviado' : 'Error'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });

  } catch (error) {
    console.error('Error en generate-code:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  }
}

// ENDPOINT: Login
async function handleLogin(request, env) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario y contraseña requeridos'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    // Verificar admin
    if (username === CONFIG.ADMIN_USER && password === CONFIG.ADMIN_PASS) {
      return new Response(JSON.stringify({
        success: true,
        user: { username: 'admin', role: 'admin', empresa: 'Administrador' },
        message: 'Login exitoso como administrador'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    // Verificar usuario normal
    const userData = await env.FIXLY_KV.get(`user_${username}`, 'json');
    
    if (!userData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario no encontrado'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    if (userData.password !== password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Contraseña incorrecta'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    // Verificar si está activo y no expirado
    if (!userData.activo) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario desactivado'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    if (new Date() > new Date(userData.fechaExpiracion)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario expirado'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        username: userData.username,
        empresa: userData.empresa,
        email: userData.email,
        role: 'user',
        fechaExpiracion: userData.fechaExpiracion
      },
      message: 'Login exitoso'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  }
}

// ENDPOINT: Health Check (actualizado)
async function handleHealth(request, env) {
  return new Response(JSON.stringify({
    status: 'healthy',
    version: '5.0.0-email-fixed',
    timestamp: new Date().toISOString(),
    features: ['authentication', 'user-management', 'email-notifications', 'telegram-alerts', 'cors-fixed'],
    endpoints: [
      '/api/generate-code',
      '/api/login', 
      '/api/formulario-registro',
      '/api/registros',
      '/health'
    ]
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
  });
}

// =================================================================
// MAIN HANDLER
// =================================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    console.log(`${request.method} ${path}`);

    // Manejar OPTIONS para CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: handleCORS(request)
      });
    }

    try {
      // Rutas principales
      if (path === '/health') {
        return handleHealth(request, env);
      }

      if (path === '/api/generate-code' && request.method === 'POST') {
        return handleGenerateCode(request, env);
      }

      if (path === '/api/login' && request.method === 'POST') {
        return handleLogin(request, env);
      }

      // Endpoint para formulario de registro (futuro)
      if (path === '/api/formulario-registro' && request.method === 'POST') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Endpoint preparado para formulario de registro'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
        });
      }

      // Endpoint para obtener registros (admin)
      if (path === '/api/registros' && request.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          registros: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
        });
      }

      // Ruta no encontrada
      return new Response(JSON.stringify({
        error: 'Endpoint no encontrado',
        path: path,
        availableEndpoints: ['/health', '/api/generate-code', '/api/login']
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });

    } catch (error) {
      console.error('Error general:', error);
      return new Response(JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }
  }
};