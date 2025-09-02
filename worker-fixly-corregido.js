// ==========================================
// FIXLY WORKER - CORREGIDO Y FUNCIONAL
// ==========================================

// ⚠️ CONFIGURACIÓN CORREGIDA
const TELEGRAM_CONFIG = {
  BOT_TOKEN: '7659942257:AAE1ajAek4aC86fQqTWWhoOYmpCkhv0b0Oc',
  CHAT_ID: '1819527108',
  API_URL: 'https://api.telegram.org/bot'
};

// Utilidades
function makeUsernameSeed(email, empresa) {
  return (empresa || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
}

function randUpper(n) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getCorsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ==========================================
// Notificaciones CORREGIDAS
// ==========================================
async function sendTelegramNotification(text, extra = {}) {
  try {
    console.log('Enviando a Telegram:', text.substring(0, 100) + '...');
    
    const response = await fetch(`${TELEGRAM_CONFIG.API_URL}${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text,
        parse_mode: "HTML",
        ...extra,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error Telegram:', result);
      return { success: false, error: result };
    }
    
    console.log('Telegram enviado exitosamente');
    return { success: true, result };
    
  } catch (error) {
    console.error('Error enviando a Telegram:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmail(to, subject, html) {
  try {
    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "noreply@fixlytaller.com", name: "Fixly Taller" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!response.ok) {
      console.error('Error enviando email:', await response.text());
      return false;
    }
    
    console.log('Email enviado exitosamente a:', to);
    return true;
    
  } catch (error) {
    console.error('Error email:', error);
    return false;
  }
}

// ==========================================
// Handler: Nuevo lead CORREGIDO
// ==========================================
async function handleLeadRegistro(request, env) {
  try {
    const { taller, propietario, email, telefono, ciudad } = await request.json();
    
    if (!taller || !propietario || !email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Faltan datos requeridos: taller, propietario, email" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
      });
    }

    const leadId = "lead_" + Date.now();
    
    // 🔧 DATOS CORREGIDOS - Solo info esencial para callback
    const leadData = {
      leadId,
      taller: taller.substring(0, 50), // Limitar longitud
      propietario: propietario.substring(0, 50),
      email,
      telefono: telefono || "",
      ciudad: ciudad || ""
    };

    // 💾 Guardar lead en KV para recuperar después
    await env.FIXLY_USERS.put(`lead_${leadId}`, JSON.stringify(leadData));

    // 📱 Notificación a Telegram CORREGIDA
    const telegramText = [
      "🆕 <b>Nuevo Lead - Fixly Taller</b>",
      "",
      `🏢 <b>Taller:</b> ${taller}`,
      `👤 <b>Propietario:</b> ${propietario}`, 
      `📧 <b>Email:</b> ${email}`,
      `📱 <b>Teléfono:</b> ${telefono || "No proporcionado"}`,
      `📍 <b>Ciudad:</b> ${ciudad || "No proporcionada"}`,
      "",
      `🆔 <b>ID:</b> ${leadId}`,
      `⏰ <b>Fecha:</b> ${new Date().toLocaleString("es-ES")}`,
      "",
      "👇 <b>Acciones disponibles:</b>"
    ].join("\n");

    const telegramResult = await sendTelegramNotification(telegramText, {
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "✅ Crear usuario + credenciales", 
            callback_data: `approve_${leadId}` // 🔧 CALLBACK CORREGIDO - Solo ID
          }],
          [{ 
            text: "❌ Rechazar lead", 
            callback_data: `reject_${leadId}` 
          }],
          [{ 
            text: "📋 Ver detalles completos", 
            callback_data: `details_${leadId}` 
          }]
        ],
      },
    });

    console.log('Resultado Telegram:', telegramResult);

    return new Response(JSON.stringify({ 
      success: true, 
      leadId,
      telegramSent: telegramResult.success,
      message: telegramResult.success ? 
        "Lead registrado y notificación enviada a Telegram" : 
        "Lead registrado pero falló notificación Telegram"
    }), {
      headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
    });

  } catch (err) {
    console.error('Error en handleLeadRegistro:', err);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message,
      details: "Error interno del servidor" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
    });
  }
}

// ==========================================
// Handler: Aprobar lead CORREGIDO
// ==========================================
async function approveLeadAndSendCreds(leadId, env) {
  try {
    // 🔄 Recuperar datos del lead desde KV
    const leadDataStr = await env.FIXLY_USERS.get(`lead_${leadId}`);
    
    if (!leadDataStr) {
      throw new Error(`Lead ${leadId} no encontrado`);
    }
    
    const leadData = JSON.parse(leadDataStr);
    
    // 🔧 Generar credenciales
    const seed = makeUsernameSeed(leadData.email, leadData.taller);
    let username = seed, i = 1;
    
    while (await env.FIXLY_USERS.get("user_" + username)) {
      username = seed + i++;
    }
    
    const tempPass = randUpper(8);

    // 💾 Crear usuario
    const userData = {
      username,
      password: tempPass,
      email: leadData.email,
      empresa: leadData.taller,
      telefono: leadData.telefono,
      propietario: leadData.propietario,
      ciudad: leadData.ciudad,
      tipo: "starter",
      tenantId: "tenant_" + Date.now(),
      fechaCreacion: new Date().toISOString(),
      fechaExpiracion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      activo: true,
      creadoDesde: "lead_" + leadId
    };

    await env.FIXLY_USERS.put("user_" + username, JSON.stringify(userData));

    // 📧 Email al cliente
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">🎉 ¡Bienvenido a Fixly Taller!</h2>
        <p>Hola <strong>${leadData.propietario}</strong>,</p>
        <p>Tu cuenta para <strong>${leadData.taller}</strong> ya está activa con <strong>15 días de prueba gratuita</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>🔑 Credenciales de Acceso</h3>
          <p><strong>Usuario:</strong> <code>${username}</code></p>
          <p><strong>Contraseña:</strong> <code>${tempPass}</code></p>
          <p><strong>URL de acceso:</strong> <a href="https://app.fixlytaller.com">app.fixlytaller.com</a></p>
        </div>

        <p>✨ <strong>¡Ya puedes empezar a usar el sistema!</strong></p>
        <p>Solo ingresa con tu usuario y contraseña para gestionar tu taller de manera profesional.</p>
        
        <p>¡Que tengas éxito! 🚀</p>
        <p>Saludos,<br><strong>Equipo Fixly Taller</strong></p>
      </div>
    `;

    const emailSent = await sendEmail(
      leadData.email, 
      "🔧 ¡Tu cuenta Fixly Taller está lista! - Credenciales de acceso", 
      emailHtml
    );

    // 📱 Notificación de confirmación
    await sendTelegramNotification([
      "🎉 <b>¡Usuario creado exitosamente!</b>",
      "",
      `✅ <b>Credenciales enviadas a:</b> ${leadData.email}`,
      `👤 <b>Usuario:</b> ${username}`,
      `🔑 <b>Password:</b> ${tempPass}`,
      `🏢 <b>Empresa:</b> ${leadData.taller}`,
      `👨‍💼 <b>Propietario:</b> ${leadData.propietario}`,
      "",
      `📧 <b>Email enviado:</b> ${emailSent ? "✅ Sí" : "❌ No"}`,
      `⏰ <b>Creado:</b> ${new Date().toLocaleString("es-ES")}`,
      "",
      "🎯 <b>El usuario puede acceder inmediatamente a app.fixlytaller.com</b>"
    ].join("\n"));

    // 🗑️ Limpiar lead procesado
    await env.FIXLY_USERS.delete(`lead_${leadId}`);

    return { success: true, username, emailSent };

  } catch (err) {
    console.error('Error aprobando lead:', err);
    
    // 📱 Notificar error
    await sendTelegramNotification([
      "❌ <b>Error procesando lead</b>",
      "",
      `🆔 <b>Lead ID:</b> ${leadId}`,
      `🚫 <b>Error:</b> ${err.message}`,
      `⏰ ${new Date().toLocaleString("es-ES")}`
    ].join("\n"));

    return { success: false, error: err.message };
  }
}

// ==========================================
// Test endpoint
// ==========================================
async function handleTest(request) {
  const testResult = await sendTelegramNotification([
    "🧪 <b>Test de Telegram</b>",
    "",
    "✅ Si ves este mensaje, las notificaciones funcionan correctamente",
    `⏰ ${new Date().toLocaleString("es-ES")}`
  ].join("\n"));

  return new Response(JSON.stringify({
    success: true,
    message: "Test enviado a Telegram",
    telegramResult: testResult,
    config: {
      botToken: TELEGRAM_CONFIG.BOT_TOKEN ? "✅ Configurado" : "❌ Faltante",
      chatId: TELEGRAM_CONFIG.CHAT_ID ? "✅ Configurado" : "❌ Faltante"
    }
  }), {
    headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
  });
}

// ==========================================
// MAIN HANDLER
// ==========================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    console.log(`${request.method} ${path}`);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    // 🧪 Test endpoint
    if (path === "/test-telegram" && request.method === "GET") {
      return handleTest(request);
    }

    // 📝 Registro de lead
    if (path === "/api/lead-registro" && request.method === "POST") {
      return handleLeadRegistro(request, env);
    }

    // 📱 Callback de Telegram CORREGIDO
    if (path === "/telegram/callback" && request.method === "POST") {
      try {
        const body = await request.json();
        const callbackData = body.callback_query?.data;

        console.log('Callback recibido:', callbackData);

        if (callbackData?.startsWith("approve_")) {
          const leadId = callbackData.replace("approve_", "");
          const result = await approveLeadAndSendCreds(leadId, env);
          
          console.log('Resultado aprobación:', result);
        }

        if (callbackData?.startsWith("reject_")) {
          const leadId = callbackData.replace("reject_", "");
          
          await sendTelegramNotification([
            "❌ <b>Lead rechazado</b>",
            "",
            `🆔 <b>Lead ID:</b> ${leadId}`,
            `⏰ ${new Date().toLocaleString("es-ES")}`
          ].join("\n"));
          
          // Limpiar lead rechazado
          await env.FIXLY_USERS.delete(`lead_${leadId}`);
        }

        if (callbackData?.startsWith("details_")) {
          const leadId = callbackData.replace("details_", "");
          const leadDataStr = await env.FIXLY_USERS.get(`lead_${leadId}`);
          
          if (leadDataStr) {
            const leadData = JSON.parse(leadDataStr);
            await sendTelegramNotification([
              "📋 <b>Detalles del Lead</b>",
              "",
              `🆔 <b>ID:</b> ${leadData.leadId}`,
              `🏢 <b>Taller:</b> ${leadData.taller}`,
              `👤 <b>Propietario:</b> ${leadData.propietario}`,
              `📧 <b>Email:</b> ${leadData.email}`,
              `📱 <b>Teléfono:</b> ${leadData.telefono || "No proporcionado"}`,
              `📍 <b>Ciudad:</b> ${leadData.ciudad || "No proporcionada"}`
            ].join("\n"));
          }
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });

      } catch (error) {
        console.error('Error en callback:', error);
        
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 📊 Health check
    if (path === "/health" && request.method === "GET") {
      return new Response(JSON.stringify({
        status: "ok",
        version: "1.1.0-telegram-fixed",
        timestamp: new Date().toISOString(),
        endpoints: [
          "GET /health",
          "GET /test-telegram", 
          "POST /api/lead-registro",
          "POST /telegram/callback"
        ]
      }), {
        headers: { "Content-Type": "application/json", ...getCorsHeaders(request) }
      });
    }

    return new Response(JSON.stringify({ 
      error: "Endpoint no encontrado", 
      path, 
      method: request.method,
      availableEndpoints: [
        "GET /health",
        "GET /test-telegram",
        "POST /api/lead-registro", 
        "POST /telegram/callback"
      ]
    }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};