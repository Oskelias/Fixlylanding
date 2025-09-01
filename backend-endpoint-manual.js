// ==========================================
// ENDPOINT PARA CREACIÓN MANUAL DE USUARIOS
// Agregar este endpoint a tu Worker existente
// ==========================================

async function handleGenerateCodeManual(request, env) {
  try {
    const data = await request.json();
    const { 
      empresa, 
      email, 
      telefono = '', 
      tipo = 'manual', 
      duracion = 30,
      usuarioManual,     // 🔧 Usuario definido manualmente
      passwordManual     // 🔧 Password definido manualmente
    } = data;

    if (!empresa || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Empresa y email son requeridos'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    // 🔧 USAR CREDENCIALES MANUALES O GENERADAS AUTOMÁTICAMENTE
    let username, password;
    
    if (usuarioManual && passwordManual) {
      // Usar credenciales manuales
      username = usuarioManual;
      password = passwordManual;
    } else {
      // Usar generación automática (tu función existente)
      const generated = generateCredentials(empresa);
      username = generated.username;
      password = generated.password;
    }

    // Generar otros datos
    const codigo = generateCode();
    const fechaExpiracion = new Date(Date.now() + (duracion * 24 * 60 * 60 * 1000));
    const tenantId = username;
    const userId = 'user_' + Date.now();

    // Guardar en KV
    const userData = {
      id: userId,
      username,
      password,
      email,
      empresa,
      telefono,
      codigo,
      tenantId,
      plan: tipo,
      fechaRegistro: new Date().toISOString(),
      fechaExpiracion: fechaExpiracion.toISOString(),
      activo: true,
      creadoManualmente: usuarioManual ? true : false // Marcar si fue manual
    };

    // Guardar usuario con múltiples claves
    await env.FIXLY_KV.put(`user_${username}`, JSON.stringify(userData));
    await env.FIXLY_KV.put(userId, JSON.stringify(userData));
    
    // Guardar código
    await env.FIXLY_KV.put(`code_${codigo}`, JSON.stringify({
      codigo,
      username,
      password,
      usado: false,
      fechaCreacion: new Date().toISOString()
    }));

    // 🚀 ENVIAR NOTIFICACIONES
    const notificationData = {
      empresa,
      email,
      telefono,
      username,
      password,
      codigo,
      fechaExpiracion
    };

    // 1. Notificación Telegram (para ti)
    const telegramMessage = `🛠️ USUARIO CREADO MANUALMENTE

👤 Empresa: ${empresa}
📧 Email: ${email}
📱 Teléfono: ${telefono || 'No proporcionado'}

🔑 Credenciales ${usuarioManual ? 'MANUALES' : 'automáticas'}:
• Usuario: ${username}
• Password: ${password}
• Código: ${codigo}

⏰ Duración: ${duracion} días
📅 Expira: ${fechaExpiracion.toLocaleDateString('es-ES')}
🔗 Panel: admin.fixlytaller.com`;

    const telegramSent = await sendTelegramNotification(telegramMessage);

    // 2. Email al usuario (credenciales)
    const emailTemplate = getEmailTemplate(notificationData);
    const emailSent = await sendEmail(
      email,
      '🛠️ ¡Bienvenido a Fixly Taller! - Tus credenciales están listas',
      emailTemplate.html,
      emailTemplate.text
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Usuario creado exitosamente',
      codigo,
      username,
      password,
      email,
      tenantId,
      userId,
      empresa,
      fechaCreacion: userData.fechaRegistro,
      fechaExpiracion: userData.fechaExpiracion,
      creadoManualmente: userData.creadoManualmente,
      notificaciones: {
        telegram: telegramSent ? 'Enviado' : 'Error',
        email: emailSent ? 'Enviado' : 'Error'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });

  } catch (error) {
    console.error('Error en generate-code-manual:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  }
}

// ==========================================
// AGREGAR ESTA RUTA AL MAIN HANDLER
// ==========================================

// En tu export default, agrega esta línea en las rutas:
/*
if (path === '/api/generate-code' && request.method === 'POST') {
  return handleGenerateCodeManual(request, env); // 🔧 Cambiar a la versión manual
}

// O crear una ruta separada:
if (path === '/api/create-user-manual' && request.method === 'POST') {
  return handleGenerateCodeManual(request, env);
}
*/