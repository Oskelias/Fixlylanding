/**
 * FIXLY BACKEND - VERSION 4.3.3 ADMIN LOGIN FIXED
 * Cloudflare Worker con funcionalidades completas de administración empresarial
 * 
 * CAMBIOS EN ESTA VERSIÓN:
 * - ✅ Admin login hardcodeado funcionando (admin/admin123)
 * - ✅ CORS corregido para consola.fixlytaller.com
 * - ✅ Todas las funcionalidades anteriores mantenidas
 */

// ==========================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ==========================================

const TELEGRAM_CONFIG = {
  BOT_TOKEN: '7659942257:AAE1ajAek4aC86fQqTWWhoOYmpCkhv0b0Oc',
  CHAT_ID: '1819527108',
  API_URL: 'https://api.telegram.org/bot'
};

const EMAIL_CONFIG = {
  FROM_EMAIL: 'noreply@fixlytaller.com',
  FROM_NAME: 'Fixly Taller - Sistema Automático',
  MAILCHANNELS_API: 'https://api.mailchannels.net/tx/v1/send'
};

// ==========================================
// CORS CONFIGURATION - ACTUALIZADO
// ==========================================
const allowedOrigins = [
  'https://fixlytaller.com',
  'https://www.fixlytaller.com', 
  'https://app.fixlytaller.com',
  'https://admin.fixlytaller.com',
  'https://consola.fixlytaller.com',
  'https://sistema.fixlytaller.com',
  'https://administrador.fixlytaller.com',
  'https://genspark.ai',
  'https://claude.ai',
  // Testing domains
  'https://8000-i2laypwrf943b2kjj1zwi-6532622b.e2b.dev',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8000'
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  const isAllowed = allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
    'Access-Control-Max-Age': '86400'
  };
}

// ==========================================
// PLAN CONFIGURATIONS - FIXLY TALLER ACTUAL
// ==========================================
const PLANS = {
  starter: {
    name: 'Starter',
    duration: 15, 
    price: 0, 
    features: [
      '1 taller',
      '2 usuarios máximo', 
      'Todas las funcionalidades en prueba'
    ],
    displayPrice: '$0',
    description: '15 días de prueba'
  },
  pro: {
    name: 'Pro',
    duration: 30, 
    price: 14999, 
    features: [
      '1 taller',
      'Hasta 5 usuarios',
      'Todas las funcionalidades',
      'Soporte',
      'Base de datos SQL'
    ],
    displayPrice: '$14.999',
    description: 'Plan completo'
  },
  enterprise: {
    name: 'Enterprise', 
    duration: 365, 
    price: 999999, 
    features: [
      'Multi-sucursal',
      'Usuarios ilimitados', 
      'Personalización completa',
      'Soporte premium 24/7',
      'Integración ERP'
    ],
    displayPrice: 'A medida',
    description: 'Solución empresarial'
  }
};

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

function isValidAdmin(request) {
  const authHeader = request.headers.get('Authorization');
  const adminKey = request.headers.get('X-Admin-Key');
  
  return authHeader === 'Bearer admin123' || adminKey === 'admin123';
}

function generateTenantId() {
  return 'tenant_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ==========================================
// NOTIFICATION FUNCTIONS
// ==========================================

async function sendTelegramNotification(message) {
  try {
    const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error enviando notificación Telegram:', error);
  }
}

async function sendEmail(to, subject, htmlBody) {
  try {
    const response = await fetch(EMAIL_CONFIG.MAILCHANNELS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }]
        }],
        from: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.FROM_NAME
        },
        subject: subject,
        content: [{
          type: 'text/html',
          value: htmlBody
        }]
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

// ==========================================
// ADMIN MANAGEMENT FUNCTIONS
// ==========================================

async function handleListUsers(request, env) {
  if (!isValidAdmin(request)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'No autorizado'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }

  try {
    const usersList = await env.FIXLY_USERS.list({ prefix: 'user_' });
    const users = [];
    
    for (const key of usersList.keys) {
      const userData = await env.FIXLY_USERS.get(key.name);
      if (userData) {
        const user = JSON.parse(userData);
        users.push({
          username: user.username,
          empresa: user.empresa,
          email: user.email,
          plan: user.tipo,
          status: user.activo ? 'active' : 'inactive',
          fechaCreacion: user.fechaCreacion,
          fechaExpiracion: user.fechaExpiracion,
          validado: user.validado
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      users: users
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error obteniendo usuarios: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

async function handlePauseUser(request, env) {
  if (!isValidAdmin(request)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'No autorizado'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }

  try {
    const url = new URL(request.url);
    const username = url.pathname.split('/')[4];
    const { action } = await request.json();

    if (!username) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const userDataStr = await env.FIXLY_USERS.get(`user_${username}`);
    if (!userDataStr) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const userData = JSON.parse(userDataStr);
    userData.activo = action === 'resume';
    userData.pausado = action === 'pause';
    userData.modificadoPor = 'admin';
    userData.fechaModificacion = new Date().toISOString();

    await env.FIXLY_USERS.put(`user_${username}`, JSON.stringify(userData));

    await sendTelegramNotification(`
🔧 <b>Usuario ${action === 'pause' ? 'Pausado' : 'Reactivado'}</b>
👤 Usuario: ${username}
🏢 Empresa: ${userData.empresa}
⏰ Fecha: ${new Date().toLocaleString('es-ES')}
    `);

    return new Response(JSON.stringify({
      success: true,
      message: `Usuario ${action === 'pause' ? 'pausado' : 'reactivado'} exitosamente`
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error procesando solicitud: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

async function handleExtendUser(request, env) {
  if (!isValidAdmin(request)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'No autorizado'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }

  try {
    const url = new URL(request.url);
    const username = url.pathname.split('/')[4];
    const { days, newPlan } = await request.json();

    if (!username || !days) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username y días requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const userDataStr = await env.FIXLY_USERS.get(`user_${username}`);
    if (!userDataStr) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const userData = JSON.parse(userDataStr);
    const currentExpiration = new Date(userData.fechaExpiracion);
    const newExpiration = new Date(currentExpiration.getTime() + (days * 24 * 60 * 60 * 1000));
    
    userData.fechaExpiracion = newExpiration.toISOString();
    if (newPlan) {
      userData.tipo = newPlan;
    }
    userData.modificadoPor = 'admin';
    userData.fechaModificacion = new Date().toISOString();

    await env.FIXLY_USERS.put(`user_${username}`, JSON.stringify(userData));

    await sendTelegramNotification(`
📅 <b>Suscripción Extendida</b>
👤 Usuario: ${username}
🏢 Empresa: ${userData.empresa}
📈 Días agregados: ${days}
📋 Plan: ${newPlan || userData.tipo}
🗓️ Nueva expiración: ${newExpiration.toLocaleDateString('es-ES')}
    `);

    return new Response(JSON.stringify({
      success: true,
      message: `Suscripción extendida ${days} días`,
      newExpiration: newExpiration.toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error extendiendo suscripción: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

async function handleDeleteUser(request, env) {
  if (!isValidAdmin(request)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'No autorizado'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }

  try {
    const url = new URL(request.url);
    const username = url.pathname.split('/')[4];

    if (!username) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const userDataStr = await env.FIXLY_USERS.get(`user_${username}`);
    if (!userDataStr) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const userData = JSON.parse(userDataStr);
    userData.eliminado = true;
    userData.eliminadoPor = 'admin';
    userData.fechaEliminacion = new Date().toISOString();

    await env.FIXLY_USERS.put(`user_deleted_${username}`, JSON.stringify(userData));
    await env.FIXLY_USERS.delete(`user_${username}`);

    await sendTelegramNotification(`
🗑️ <b>Usuario Eliminado</b>
👤 Usuario: ${username}
🏢 Empresa: ${userData.empresa}
⏰ Fecha: ${new Date().toLocaleString('es-ES')}
    `);

    return new Response(JSON.stringify({
      success: true,
      message: 'Usuario eliminado exitosamente'
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error eliminando usuario: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

// ==========================================
// CORE FUNCTIONS
// ==========================================

async function handleGenerateCode(request, env) {
  try {
    const { username, password, email, telefono, empresa, tipo = 'trial', duracion = 15 } = await request.json();

    if (!username || !password || !email || !empresa) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Datos incompletos. Se requiere username, password, email y empresa.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const existingUser = await env.FIXLY_USERS.get(`user_${username}`);
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El username ya existe. Elige otro.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const codigo = generateCode();
    const tenantId = generateTenantId();
    const fechaCreacion = new Date().toISOString();
    const fechaExpiracion = new Date(Date.now() + duracion * 24 * 60 * 60 * 1000).toISOString();

    const userData = {
      username,
      password,
      email,
      telefono: telefono || '',
      empresa,
      codigo,
      tenantId,
      tipo,
      fechaCreacion,
      fechaExpiracion,
      activo: false,
      validado: false,
      role: 'user'
    };

    await env.FIXLY_USERS.put(`user_${username}`, JSON.stringify(userData));

    const planInfo = PLANS[tipo] || PLANS.trial;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">¡Bienvenido a Fixly Taller!</h2>
        <p>Hola <strong>${empresa}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Credenciales de Acceso</h3>
          <p><strong>Usuario:</strong> ${username}</p>
          <p><strong>Contraseña:</strong> ${password}</p>
          <p><strong>Código de Activación:</strong> <span style="font-size: 18px; color: #667eea; font-weight: bold;">${codigo}</span></p>
        </div>

        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Plan ${planInfo.name}</h3>
          <p><strong>Precio:</strong> ${planInfo.displayPrice}</p>
          <p><strong>Duración:</strong> ${duracion} días</p>
          <p><strong>Válido hasta:</strong> ${new Date(fechaExpiracion).toLocaleDateString('es-ES')}</p>
        </div>

        <p><strong>Próximos pasos:</strong></p>
        <ol>
          <li>Ingresa a <a href="https://app.fixlytaller.com">https://app.fixlytaller.com</a></li>
          <li>Usa tu código de activación: <strong>${codigo}</strong></li>
          <li>Completa la configuración de tu taller</li>
        </ol>

        <p>¡Estás listo para gestionar tu taller de manera profesional!</p>
        <p>Saludos,<br>Equipo Fixly Taller</p>
      </div>
    `;

    await sendEmail(email, '🔧 Bienvenido a Fixly Taller - Credenciales de Acceso', emailHtml);

    await sendTelegramNotification(`
🎉 <b>Nuevo Usuario Registrado</b>
👤 Usuario: ${username}
🏢 Empresa: ${empresa}
📧 Email: ${email}
📋 Plan: ${planInfo.name} (${planInfo.displayPrice})
🗓️ Válido hasta: ${new Date(fechaExpiracion).toLocaleDateString('es-ES')}
🔑 Código: ${codigo}
    `);

    return new Response(JSON.stringify({
      success: true,
      username,
      password,
      codigo,
      tenantId,
      empresa,
      email,
      tipo,
      fechaCreacion,
      fechaExpiracion,
      message: 'Usuario creado exitosamente. Revisa tu email para las instrucciones de activación.'
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

async function handleValidateCode(request, env) {
  try {
    const { codigo } = await request.json();

    if (!codigo) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Código requerido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const usersList = await env.FIXLY_USERS.list({ prefix: 'user_' });
    
    for (const key of usersList.keys) {
      const userData = await env.FIXLY_USERS.get(key.name);
      if (userData) {
        const user = JSON.parse(userData);
        if (user.codigo === codigo.toUpperCase()) {
          user.validado = true;
          user.activo = true;
          user.fechaActivacion = new Date().toISOString();
          
          await env.FIXLY_USERS.put(key.name, JSON.stringify(user));

          await sendTelegramNotification(`
✅ <b>Usuario Activado</b>
👤 Usuario: ${user.username}
🏢 Empresa: ${user.empresa}
🗓️ Activado: ${new Date().toLocaleString('es-ES')}
          `);

          return new Response(JSON.stringify({
            success: true,
            user: {
              username: user.username,
              empresa: user.empresa,
              tenantId: user.tenantId,
              plan: user.tipo,
              fechaExpiracion: user.fechaExpiracion
            },
            message: 'Código validado correctamente'
          }), {
            headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
          });
        }
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Código inválido o expirado'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error validando código: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

async function handleLogin(request, env) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username y password requeridos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    // ==========================================
    // HARDCODED ADMIN LOGIN - FIXED
    // ==========================================
    if (username === 'admin' && password === 'admin123') {
      return new Response(JSON.stringify({
        success: true,
        user: {
          username: 'admin',
          empresa: 'Fixly Taller Admin',
          tenantId: 'admin_tenant',
          plan: 'enterprise',
          fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          role: 'admin'
        },
        message: 'Login admin exitoso'
      }), {
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    // ==========================================
    // REGULAR USER LOGIN
    // ==========================================
    const userDataStr = await env.FIXLY_USERS.get(`user_${username}`);
    if (!userDataStr) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario no encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const userData = JSON.parse(userDataStr);

    if (userData.password !== password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Contraseña incorrecta'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    if (!userData.validado) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario no activado. Valida tu código primero.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    if (userData.pausado) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Usuario pausado. Contacta al administrador.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    const now = new Date();
    const expiration = new Date(userData.fechaExpiracion);
    
    if (now > expiration) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Suscripción expirada. Renueva tu plan.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    userData.ultimoAcceso = new Date().toISOString();
    await env.FIXLY_USERS.put(`user_${username}`, JSON.stringify(userData));

    return new Response(JSON.stringify({
      success: true,
      user: {
        username: userData.username,
        empresa: userData.empresa,
        tenantId: userData.tenantId,
        plan: userData.tipo,
        fechaExpiracion: userData.fechaExpiracion,
        role: userData.role || 'user'
      },
      message: 'Login exitoso'
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error en login: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

async function handleLeadRegistro(request, env) {
  try {
    const { nombre, email, telefono, empresa, mensaje } = await request.json();

    const leadData = {
      nombre,
      email,
      telefono,
      empresa,
      mensaje: mensaje || '',
      fecha: new Date().toISOString(),
      origen: 'landing-fixlytaller'
    };

    const leadId = 'lead_' + Date.now();
    await env.FIXLY_USERS.put(leadId, JSON.stringify(leadData));

    await sendTelegramNotification(`
📝 <b>Nuevo Lead - Fixly Taller</b>
👤 Nombre: ${nombre}
🏢 Empresa: ${empresa}
📧 Email: ${email}
📱 Teléfono: ${telefono}
💬 Mensaje: ${mensaje}
⏰ Fecha: ${new Date().toLocaleString('es-ES')}
    `);

    return new Response(JSON.stringify({
      success: true,
      message: 'Información recibida correctamente. Nos contactaremos pronto.'
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error registrando lead: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

async function handleMercadoPagoWebhook(request, env) {
  try {
    const webhookData = await request.json();
    
    if (webhookData.type === 'payment' && webhookData.action === 'payment.updated') {
      const paymentId = webhookData.data.id;
      
      await sendTelegramNotification(`
💰 <b>Webhook MercadoPago Recibido</b>
🆔 Payment ID: ${paymentId}
📊 Tipo: ${webhookData.type}
⚡ Acción: ${webhookData.action}
⏰ Procesado: ${new Date().toLocaleString('es-ES')}

🔍 <i>Verificando detalles del pago...</i>
      `);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook procesado',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Error procesando webhook: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
}

// ==========================================
// MAIN HANDLER
// ==========================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: getCorsHeaders(request)
      });
    }

    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        version: '4.3.3-admin-login-fixed',
        timestamp: new Date().toISOString(),
        features: ['user_management', 'mercadopago_webhook', 'plan_system', 'admin_panel'],
        corsStatus: 'updated-consola-domain',
        adminLogin: 'hardcoded-working',
        availableEndpoints: [
          'POST /api/generate-code',
          'POST /api/validate-code', 
          'POST /api/login (admin: admin/admin123)',
          'POST /api/lead-registro',
          'POST /webhook/mercadopago',
          'GET /api/admin/users',
          'PUT /api/admin/user/{username}/pause',
          'PUT /api/admin/user/{username}/extend',
          'DELETE /api/admin/user/{username}',
          'GET /health'
        ],
        adminFeatures: 'complete-user-management',
        plans: Object.keys(PLANS)
      }), {
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    if (path === '/api/generate-code' && request.method === 'POST') {
      return handleGenerateCode(request, env);
    }
    
    if (path === '/api/validate-code' && request.method === 'POST') {
      return handleValidateCode(request, env);
    }
    
    if (path === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }
    
    if (path === '/api/lead-registro' && request.method === 'POST') {
      return handleLeadRegistro(request, env);
    }

    if (path === '/api/admin/users' && request.method === 'GET') {
      return handleListUsers(request, env);
    }

    if (path.startsWith('/api/admin/user/') && path.endsWith('/pause') && request.method === 'PUT') {
      return handlePauseUser(request, env);
    }

    if (path.startsWith('/api/admin/user/') && path.endsWith('/extend') && request.method === 'PUT') {
      return handleExtendUser(request, env);
    }

    if (path.startsWith('/api/admin/user/') && request.method === 'DELETE') {
      return handleDeleteUser(request, env);
    }

    if (path === '/webhook/mercadopago' && request.method === 'POST') {
      return handleMercadoPagoWebhook(request, env);
    }

    return new Response(JSON.stringify({
      error: 'Endpoint no encontrado',
      path: path,
      method: request.method,
      availableEndpoints: [
        'GET /health',
        'POST /api/generate-code',
        'POST /api/validate-code',
        'POST /api/login (admin: admin/admin123)', 
        'POST /api/lead-registro',
        'POST /webhook/mercadopago',
        'GET /api/admin/users (requiere auth)',
        'PUT /api/admin/user/{username}/pause (requiere auth)',
        'PUT /api/admin/user/{username}/extend (requiere auth)', 
        'DELETE /api/admin/user/{username} (requiere auth)'
      ]
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
};