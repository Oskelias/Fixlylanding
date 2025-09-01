// ==========================================
// ACTUALIZACIÓN PARA CLOUDFLARE WORKER
// Agregar este endpoint a tu worker existente
// ==========================================

// NUEVAS CONFIGURACIONES DE EMAIL
const EMAIL_CONFIG_UPDATED = {
  FROM_EMAIL: 'noreply@fixlytaller.com',        // ✅ Ya configurado
  ADMIN_EMAIL: 'admin@fixlytaller.com',         // ✅ Ya configurado  
  REGISTROS_EMAIL: 'admin@fixlytaller.com',     // Para notificaciones de registro
  FROM_NAME: 'Fixly Taller - Sistema Automático',
  MAILCHANNELS_API: 'https://api.mailchannels.net/tx/v1/send'
};

// ==========================================
// NUEVO ENDPOINT: RECIBIR REGISTROS DEL FORMULARIO
// Agrega esto a tu worker existente
// ==========================================

async function handleFormularioRegistro(request, env) {
  try {
    const data = await request.json();
    const { empresa, email, telefono, propietario, direccion, mensaje } = data;

    if (!empresa || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Empresa y email son requeridos'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
      });
    }

    // Generar ID único para el registro
    const registroId = 'registro_' + Date.now();
    const fechaRegistro = new Date().toISOString();
    
    // Guardar registro en KV
    const registroData = {
      id: registroId,
      empresa,
      email,
      telefono: telefono || '',
      propietario: propietario || '',
      direccion: direccion || '',
      mensaje: mensaje || '',
      fechaRegistro,
      estado: 'pendiente', // pendiente, procesado, rechazado
      procesadoPor: null,
      fechaProcesado: null
    };

    await env.FIXLY_KV.put(registroId, JSON.stringify(registroData));

    // 🚀 ENVIAR NOTIFICACIÓN TELEGRAM (A TI)
    const telegramMessage = `🆕 NUEVO REGISTRO EN FIXLYTALLER.COM

🏢 Empresa: ${empresa}
👨‍💼 Propietario: ${propietario || 'No especificado'}
📧 Email: ${email}
📱 Teléfono: ${telefono || 'No proporcionado'}
📍 Dirección: ${direccion || 'No especificada'}
💬 Mensaje: ${mensaje || 'Sin mensaje'}

⏰ Fecha: ${new Date().toLocaleString('es-ES')}
🆔 Registro ID: ${registroId}

🎯 ACCIÓN REQUERIDA:
1. Ve a tu consola admin: app.fixlytaller.com/admin
2. Sección "Nuevos Registros"  
3. Crear usuario para este taller
4. El sistema enviará credenciales automáticamente

🔗 Admin Panel: https://app.fixlytaller.com/admin`;

    const telegramSent = await sendTelegramNotification(telegramMessage);

    // 📧 ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE
    const emailCliente = await sendEmailConfirmacion(email, empresa, registroData);

    // 📧 ENVIAR EMAIL DE NOTIFICACIÓN A ADMIN
    const emailAdmin = await sendEmailNotificacionAdmin(registroData);

    return new Response(JSON.stringify({
      success: true,
      mensaje: 'Registro recibido correctamente',
      registroId: registroId,
      notificaciones: {
        telegram: telegramSent ? 'Enviado' : 'Error',
        emailCliente: emailCliente ? 'Enviado' : 'Error',
        emailAdmin: emailAdmin ? 'Enviado' : 'Error'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });

  } catch (error) {
    console.error('Error en formulario-registro:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  }
}

// ==========================================
// NUEVAS FUNCIONES DE EMAIL
// ==========================================

async function sendEmailConfirmacion(email, empresa, registroData) {
  try {
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
        .info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛠️ Fixly Taller</h1>
            <p>¡Gracias por tu interés!</p>
        </div>
        
        <h2>Hola ${empresa},</h2>
        <p>Hemos recibido tu solicitud de información sobre <strong>Fixly Taller</strong>.</p>
        
        <div class="info">
            <h3>📋 Resumen de tu solicitud:</h3>
            <p><strong>Empresa:</strong> ${registroData.empresa}</p>
            <p><strong>Email:</strong> ${registroData.email}</p>
            <p><strong>Teléfono:</strong> ${registroData.telefono || 'No proporcionado'}</p>
            <p><strong>Fecha:</strong> ${new Date(registroData.fechaRegistro).toLocaleString('es-ES')}</p>
        </div>
        
        <h3>🕐 ¿Qué sigue?</h3>
        <ol>
            <li>Nuestro equipo revisará tu solicitud</li>
            <li>Te contactaremos en las próximas 24 horas</li>
            <li>Recibirás tus credenciales de acceso por email</li>
            <li>¡Podrás comenzar a usar Fixly Taller!</li>
        </ol>
        
        <h3>🎯 Mientras tanto:</h3>
        <p>Visita nuestra web: <a href="https://fixlytaller.com">fixlytaller.com</a></p>
        <p>¿Dudas? Contáctanos: <a href="mailto:soporte@fixlytaller.com">soporte@fixlytaller.com</a></p>
        
        <div class="footer">
            <p>Fixly Taller - Sistema de Gestión para Talleres</p>
            <p>Este es un email automático, no respondas a esta dirección.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Hola ${empresa},

Hemos recibido tu solicitud de información sobre Fixly Taller.

DATOS RECIBIDOS:
- Empresa: ${registroData.empresa}
- Email: ${registroData.email}  
- Teléfono: ${registroData.telefono || 'No proporcionado'}
- Fecha: ${new Date(registroData.fechaRegistro).toLocaleString('es-ES')}

¿QUÉ SIGUE?
1. Nuestro equipo revisará tu solicitud
2. Te contactaremos en las próximas 24 horas  
3. Recibirás tus credenciales de acceso
4. ¡Podrás usar Fixly Taller!

Dudas: soporte@fixlytaller.com
Web: https://fixlytaller.com

Fixly Taller - Sistema de Gestión para Talleres
`;

    return await sendEmail(
      email,
      '🛠️ Solicitud recibida - Fixly Taller',
      html,
      text
    );
  } catch (error) {
    console.error('Error enviando email confirmación:', error);
    return false;
  }
}

async function sendEmailNotificacionAdmin(registroData) {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                  color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .registro { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .acciones { background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 NUEVO REGISTRO</h1>
            <p>Fixly Taller - Formulario Web</p>
        </div>
        
        <div class="registro">
            <h3>📋 Datos del registro:</h3>
            <p><strong>🏢 Empresa:</strong> ${registroData.empresa}</p>
            <p><strong>👤 Propietario:</strong> ${registroData.propietario || 'No especificado'}</p>
            <p><strong>📧 Email:</strong> ${registroData.email}</p>
            <p><strong>📱 Teléfono:</strong> ${registroData.telefono || 'No proporcionado'}</p>
            <p><strong>📍 Dirección:</strong> ${registroData.direccion || 'No especificada'}</p>
            <p><strong>💬 Mensaje:</strong> ${registroData.mensaje || 'Sin mensaje'}</p>
            <p><strong>⏰ Fecha:</strong> ${new Date(registroData.fechaRegistro).toLocaleString('es-ES')}</p>
            <p><strong>🆔 ID:</strong> ${registroData.id}</p>
        </div>
        
        <div class="acciones">
            <h3>🎯 ACCIONES REQUERIDAS:</h3>
            <ol>
                <li><strong>Accede a la consola:</strong> <a href="https://app.fixlytaller.com/admin">app.fixlytaller.com/admin</a></li>
                <li><strong>Ve a:</strong> Sección "Nuevos Registros"</li>
                <li><strong>Crear usuario:</strong> Genera credenciales para ${registroData.empresa}</li>
                <li><strong>Envío automático:</strong> El sistema enviará credenciales por email</li>
            </ol>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://app.fixlytaller.com/admin" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                🚀 IR A CONSOLA ADMIN
            </a>
        </p>
    </div>
</body>
</html>`;

    return await sendEmail(
      EMAIL_CONFIG_UPDATED.ADMIN_EMAIL, // admin@fixlytaller.com → grupocioacr@gmail.com
      `🚨 Nuevo registro: ${registroData.empresa}`,
      html,
      `Nuevo registro de ${registroData.empresa} - ${registroData.email}. Ve a app.fixlytaller.com/admin para procesar.`
    );
  } catch (error) {
    console.error('Error enviando email admin:', error);
    return false;
  }
}

// ==========================================
// AGREGAR ESTE ENDPOINT AL MAIN HANDLER
// ==========================================

// En tu export default, agrega esta línea:
/*
if (path === '/api/formulario-registro' && request.method === 'POST') {
  return handleFormularioRegistro(request, env);
}
*/

// ==========================================
// ENDPOINT: OBTENER REGISTROS PARA ADMIN
// ==========================================

async function handleGetRegistros(request, env) {
  try {
    // Obtener todos los registros del KV
    const { keys } = await env.FIXLY_KV.list({ prefix: 'registro_' });
    const registros = [];
    
    for (const key of keys) {
      const data = await env.FIXLY_KV.get(key.name, 'json');
      if (data) {
        registros.push(data);
      }
    }
    
    // Ordenar por fecha más reciente
    registros.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
    
    return new Response(JSON.stringify({
      success: true,
      registros: registros
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  } catch (error) {
    console.error('Error obteniendo registros:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error obteniendo registros'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
    });
  }
}

// Agregar al main handler:
/*
if (path === '/api/registros' && request.method === 'GET') {
  return handleGetRegistros(request, env);
}
*/