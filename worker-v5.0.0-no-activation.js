/**
 * FIXLY BACKEND - VERSION 5.0.0 NO ACTIVATION CODES
 * Sistema simplificado sin códigos de activación
 * 
 * CAMBIOS PRINCIPALES:
 * - ❌ Eliminados códigos de activación
 * - ✅ Usuarios activos inmediatamente al crearlos
 * - ✅ Login directo con username/password
 * - ✅ Admin endpoints mejorados para gestión completa
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
// CORS CONFIGURATION
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
  'http://localhost:3000',
  'http://localhost:8000'
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
// PLAN CONFIGURATIONS
// ==========================================
const PLANS = {
  starter: {
    name: 'Starter',
    duration: 15, 
    price: 0, 
    features: ['1 taller', '2 usuarios máximo', 'Todas las funcionalidades en prueba'],
    displayPrice: '$0',
    description: '15 días de prueba'
  },
  pro: {
    name: 'Pro',
    duration: 30, 
    price: 14999, 
    features: ['1 taller', 'Hasta 5 usuarios', 'Todas las funcionalidades', 'Soporte', 'Base de datos SQL'],
    displayPrice: '$14.999',
    description: 'Plan completo'
  },
  enterprise: {
    name: 'Enterprise', 
    duration: 365, 
    price: 999999, 
    features: ['Multi-sucursal', 'Usuarios ilimitados', 'Personalización completa', 'Soporte premium 24/7', 'Integración ERP'],
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
// ADMIN MANAGEMENT FUNCTIONS MEJORADAS
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
      try {
        const userData = await env.FIXLY_USERS.get(key.name);
        if (userData) {
          const user = JSON.parse(userData);
          
          // Calcular estado del usuario
          const now = new Date();
          const expiration = new Date(user.fechaExpiracion);
          let status = 'active';
          
          if (user.pausado) {
            status = 'paused';
          } else if (now > expiration) {
            status = 'expired';
          } else if (user.tipo === 'starter' || user.tipo === 'trial') {
            status = 'trial';
          }
          
          users.push({
            username: user.username,
            empresa: user.empresa,
            email: user.email,
            telefono: user.telefono || '',
            plan: user.tipo,
            status: status,
            fechaCreacion: user.fechaCreacion,
            fechaExpiracion: user.fechaExpiracion,
            activo: user.activo,
            pausado: user.pausado || false,
            tenantId: user.tenantId,
            ultimoAcceso: user.ultimoAcceso || null
          });
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    users.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    
    return new Response(JSON.stringify({
      success: true,
      users: users,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      trialUsers: users.filter(u => u.status === 'trial').length,
      expiredUsers: users.filter(u => u.status === 'expired').length,
      pausedUsers: users.filter(u => u.status === 'paused').length
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
    userData.pausado = action === 'pause';
    userData.activo = action === 'resume';
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
      message: `Usuario ${action === 'pause' ? 'pausado' : 'reactivado'} exitosamente`,
      newStatus: action === 'pause' ? 'paused' : 'active'
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
    if (newPlan && PLANS[newPlan]) {
      userData.tipo = newPlan;
    }
    userData.modificadoPor = 'admin';
    userData.fechaModificacion = new Date().toISOString();
    userData.activo = true;
    userData.pausado = false;

    await env.FIXLY_USERS.put(`user_${username}`, JSON.stringify(userData));

    const planInfo = PLANS[userData.tipo] || { name: userData.tipo, displayPrice: 'N/A' };

    await sendTelegramNotification(`
📅 <b>Suscripción Extendida</b>
👤 Usuario: ${username}
🏢 Empresa: ${userData.empresa}
📈 Días agregados: ${days}
📋 Plan: ${planInfo.name} (${planInfo.displayPrice})
🗓️ Nueva expiración: ${newExpiration.toLocaleDateString('es-ES')}
    `);

    return new Response(JSON.stringify({
      success: true,
      message: `Suscripción extendida ${days} días`,
      newExpiration: newExpiration.toISOString(),
      newPlan: userData.tipo
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
    const { softDelete = true } = await request.json() || {};

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

    if (softDelete) {
      // Soft delete: marcar como eliminado pero mantener datos
      userData.eliminado = true;
      userData.eliminadoPor = 'admin';
      userData.fechaEliminacion = new Date().toISOString();
      userData.activo = false;
      
      await env.FIXLY_USERS.put(`user_deleted_${username}`, JSON.stringify(userData));
      await env.FIXLY_USERS.delete(`user_${username}`);
    } else {
      // Hard delete: eliminar completamente
      await env.FIXLY_USERS.delete(`user_${username}`);
    }

    await sendTelegramNotification(`
🗑️ <b>Usuario ${softDelete ? 'Eliminado (Soft)' : 'Eliminado (Permanente)'}</b>
👤 Usuario: ${username}
🏢 Empresa: ${userData.empresa}
⏰ Fecha: ${new Date().toLocaleString('es-ES')}
    `);

    return new Response(JSON.stringify({
      success: true,
      message: `Usuario eliminado exitosamente (${softDelete ? 'reversible' : 'permanente'})`,
      deleteType: softDelete ? 'soft' : 'hard'
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
// CORE FUNCTIONS - SIN CÓDIGOS DE ACTIVACIÓN
// ==========================================

async function handleGenerateCode(request, env) {
  try {
    const { username, password, email, telefono, empresa, tipo = 'pro', duracion = 30 } = await request.json();

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

    const tenantId = generateTenantId();
    const fechaCreacion = new Date().toISOString();
    const fechaExpiracion = new Date(Date.now() + duracion * 24 * 60 * 60 * 1000).toISOString();

    // USUARIOS ACTIVOS INMEDIATAMENTE - SIN CÓDIGOS
    const userData = {
      username,
      password,
      email,
      telefono: telefono || '',
      empresa,
      tenantId,
      tipo,
      fechaCreacion,
      fechaExpiracion,
      activo: true,        // ✅ ACTIVO INMEDIATAMENTE
      validado: true,      // ✅ VALIDADO AUTOMÁTICAMENTE
      pausado: false,
      role: 'user'
    };

    await env.FIXLY_USERS.put(`user_${username}`, JSON.stringify(userData));

    const planInfo = PLANS[tipo] || PLANS.pro;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">¡Bienvenido a Fixly Taller!</h2>
        <p>Hola <strong>${empresa}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente y está <strong>lista para usar</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Credenciales de Acceso</h3>
          <p><strong>Usuario:</strong> ${username}</p>
          <p><strong>Contraseña:</strong> ${password}</p>
          <p><strong>URL:</strong> <a href="https://app.fixlytaller.com">https://app.fixlytaller.com</a></p>
        </div>

        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Plan ${planInfo.name}</h3>
          <p><strong>Precio:</strong> ${planInfo.displayPrice}</p>
          <p><strong>Duración:</strong> ${duracion} días</p>
          <p><strong>Válido hasta:</strong> ${new Date(fechaExpiracion).toLocaleDateString('es-ES')}</p>
        </div>

        <p><strong>¡Ya puedes empezar a usar el sistema!</strong></p>
        <p>Solo ingresa a <a href="https://app.fixlytaller.com">app.fixlytaller.com</a> con tu usuario y contraseña.</p>

        <p>¡Estás listo para gestionar tu taller de manera profesional!</p>
        <p>Saludos,<br>Equipo Fixly Taller</p>
      </div>
    `;

    await sendEmail(email, '🔧 Bienvenido a Fixly Taller - Cuenta Activa', emailHtml);

    await sendTelegramNotification(`
🎉 <b>Nuevo Usuario Creado - ACTIVO</b>
👤 Usuario: ${username}
🏢 Empresa: ${empresa}
📧 Email: ${email}
📋 Plan: ${planInfo.name} (${planInfo.displayPrice})
🗓️ Válido hasta: ${new Date(fechaExpiracion).toLocaleDateString('es-ES')}
✅ Estado: ACTIVO (sin códigos)
    `);

    return new Response(JSON.stringify({
      success: true,
      username,
      password,
      tenantId,
      empresa,
      email,
      tipo,
      fechaCreacion,
      fechaExpiracion,
      activo: true,
      validado: true,
      message: 'Usuario creado exitosamente y activo inmediatamente. Ya puede hacer login.'
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

// Mantener el endpoint de validación por compatibilidad, pero que siempre devuelva error
async function handleValidateCode(request, env) {
  return new Response(JSON.stringify({
    success: false,
    error: 'Los códigos de activación han sido eliminados. Los usuarios se activan automáticamente.'
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
  });
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

    // ADMIN LOGIN
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

    // REGULAR USER LOGIN - SIMPLIFICADO
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
        error: 'Suscripción expirada. Contacta al administrador para renovar.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
      });
    }

    // Actualizar último acceso
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
        version: '5.0.0-no-activation',
        timestamp: new Date().toISOString(),
        features: ['user_management', 'mercadopago_webhook', 'plan_system', 'admin_panel', 'no_activation_codes'],
        changes: [
          'Eliminados códigos de activación',
          'Usuarios activos inmediatamente',
          'Login simplificado username/password',
          'Admin endpoints mejorados'
        ],
        availableEndpoints: [
          'POST /api/generate-code (usuarios activos automáticamente)',
          'POST /api/login (sin códigos requeridos)',
          'POST /api/lead-registro',
          'POST /webhook/mercadopago',
          'GET /api/admin/users (mejorado)',
          'PUT /api/admin/user/{username}/pause',
          'PUT /api/admin/user/{username}/extend',
          'DELETE /api/admin/user/{username}',
          'GET /health'
        ],
        adminFeatures: 'complete-user-management-improved',
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
      version: '5.0.0-no-activation'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) }
    });
  }
};