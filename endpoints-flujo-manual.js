// ==========================================
// ENDPOINTS PARA EL FLUJO MANUAL COMPLETO
// Agregar estos endpoints a tu Worker existente
// ==========================================

// 🔧 MODIFICAR TU FUNCIÓN handleGenerateCode EXISTENTE
async function handleGenerateCode(request, env) {
  try {
    const data = await request.json();
    const { 
      empresa, 
      email, 
      telefono = '', 
      tipo = 'manual', 
      duracion = 30,
      usuarioManual,     // 🆕 Credenciales manuales
      passwordManual,    // 🆕 Credenciales manuales  
      procesandoRegistro // 🆕 ID del registro que se está procesando
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

    // 🔧 USAR CREDENCIALES MANUALES O AUTOMÁTICAS
    let username, password;
    
    if (usuarioManual && passwordManual) {
      // ✅ Credenciales definidas manualmente por el admin
      username = usuarioManual;
      password = passwordManual;
    } else {
      // ⚙️ Generación automática (tu función existente)
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
      password, // 🔧 IMPORTANTE: Guardar password
      email,
      empresa,
      telefono,
      codigo,
      tenantId,
      plan: tipo,
      fechaRegistro: new Date().toISOString(),
      fechaExpiracion: fechaExpiracion.toISOString(),
      activo: true,
      creadoManualmente: usuarioManual ? true : false,
      procesadoDesdeRegistro: procesandoRegistro || null
    };

    // Guardar usuario
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

    // 🔧 MARCAR REGISTRO COMO PROCESADO (si existe)
    if (procesandoRegistro) {
      try {
        const registroData = await env.FIXLY_KV.get(procesandoRegistro, 'json');
        if (registroData) {
          registroData.estado = 'procesado';
          registroData.usuarioCreado = username;
          registroData.fechaProcesado = new Date().toISOString();
          await env.FIXLY_KV.put(procesandoRegistro, JSON.stringify(registroData));
        }
      } catch (error) {
        console.log('Error marcando registro como procesado:', error);
      }
    }

    // 🚀 NOTIFICACIONES
    const notificationData = {
      empresa,
      email,
      telefono,
      username,
      password,
      codigo,
      fechaExpiracion
    };

    // 1️⃣ Telegram (notificación al admin)
    const telegramMessage = `✅ USUARIO CREADO MANUALMENTE

🏢 Empresa: ${empresa}
📧 Email: ${email}
📱 Teléfono: ${telefono || 'No proporcionado'}

🔑 Credenciales creadas:
👤 Usuario: ${username}
🔒 Password: ${password}
📝 Código: ${codigo}

⏰ Duración: ${duracion} días
📅 Expira: ${fechaExpiracion.toLocaleDateString('es-ES')}
📧 Email enviado automáticamente al cliente

🔗 Admin: app.fixlytaller.com/admin`;

    const telegramSent = await sendTelegramNotification(telegramMessage);

    // 2️⃣ Email al cliente (credenciales de acceso)
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
    console.error('Error en generate-code:', error);
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
// 🆕 NUEVO ENDPOINT: OBTENER REGISTROS PENDIENTES
// ==========================================
async function handleRegistrosPendientes(request, env) {
  try {
    // Obtener todos los registros de leads pendientes
    const { keys } = await env.FIXLY_KV.list({ prefix: 'lead_' });
    const registrosPendientes = [];
    
    for (const key of keys) {
      const registroData = await env.FIXLY_KV.get(key.name, 'json');
      if (registroData && registroData.estado === 'pendiente') {
        registrosPendientes.push({
          id: registroData.id,
          empresa: registroData.empresa,
          email: registroData.email,
          telefono: registroData.telefono,
          propietario: registroData.propietario,
          direccion: registroData.direccion,
          fecha: registroData.fechaRegistro,
          estado: registroData.estado
        });
      }
    }
    
    // Ordenar por fecha más reciente
    registrosPendientes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    return new Response(JSON.stringify({
      success: true,
      registros: registrosPendientes,
      total: registrosPendientes.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
    
  } catch (error) {
    console.error('Error obteniendo registros pendientes:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error obteniendo registros'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  }
}

// ==========================================
// 🆕 NUEVO ENDPOINT: OBTENER USUARIOS ACTIVOS
// ==========================================
async function handleUsuariosActivos(request, env) {
  try {
    // Obtener todos los usuarios
    const { keys } = await env.FIXLY_KV.list({ prefix: 'user_' });
    const usuariosActivos = [];
    
    for (const key of keys) {
      const userData = await env.FIXLY_KV.get(key.name, 'json');
      if (userData && userData.activo) {
        usuariosActivos.push({
          username: userData.username,
          empresa: userData.empresa,
          email: userData.email,
          plan: userData.plan,
          fechaRegistro: userData.fechaRegistro,
          fechaExpiracion: userData.fechaExpiracion,
          creadoManualmente: userData.creadoManualmente || false,
          expirado: new Date() > new Date(userData.fechaExpiracion)
        });
      }
    }
    
    // Ordenar por fecha de creación más reciente
    usuariosActivos.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
    
    return new Response(JSON.stringify({
      success: true,
      usuarios: usuariosActivos,
      total: usuariosActivos.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
    
  } catch (error) {
    console.error('Error obteniendo usuarios activos:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error obteniendo usuarios'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  }
}

// ==========================================
// 🔧 AGREGAR AL MAIN HANDLER
// ==========================================

// En tu export default, agregar estas rutas:

/*
if (path === '/api/generate-code' && request.method === 'POST') {
  return handleGenerateCode(request, env); // 🔧 Ya modificada arriba
}

if (path === '/api/registros-pendientes' && request.method === 'GET') {
  return handleRegistrosPendientes(request, env); // 🆕 Nuevo
}

if (path === '/api/usuarios-activos' && request.method === 'GET') {
  return handleUsuariosActivos(request, env); // 🆕 Nuevo  
}
*/

// ==========================================
// 📋 RESUMEN DE CAMBIOS NECESARIOS
// ==========================================

/*
CAMBIOS EN TU WORKER:

1. 🔧 REEMPLAZA handleGenerateCode con la versión de arriba
2. 🆕 AGREGA handleRegistrosPendientes  
3. 🆕 AGREGA handleUsuariosActivos
4. 🔧 AGREGA las 2 rutas nuevas al main handler

FLUJO COMPLETO:
1. Cliente se registra → endpoint lead-registro (YA TIENES) → Telegram
2. Tú recibes notificación → Vas al panel admin
3. Seleccionas registro → Creas credenciales → Sistema envía email automático
4. Cliente recibe email → Accede con credenciales

¡El sistema será completamente manual y controlado por ti!
*/