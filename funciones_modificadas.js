// ==========================================
// FUNCIONES MODIFICADAS PARA EL FORMULARIO
// ==========================================

// 1. FUNCIÓN PROCESARREGISTRO - CONECTADA A API REAL
async function procesarRegistro() {
    // Obtener datos del formulario
    const nombreTaller = document.getElementById('nombreTaller').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const propietario = document.getElementById('propietario').value;
    const direccion = document.getElementById('direccion').value;
    
    // Mostrar loading
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando solicitud...';
    submitBtn.disabled = true;
    
    try {
        // Enviar datos al API real para notificación
        const response = await fetch('https://api.fixlytaller.com/api/lead-registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                empresa: nombreTaller,
                email: email,
                telefono: telefono,
                propietario: propietario,
                direccion: direccion,
                tipo: 'registro_landing'
            })
        });

        const resultado = await response.json();
        
        if (resultado.success) {
            // Mostrar confirmación de envío exitoso
            mostrarConfirmacionEnvio();
        } else {
            throw new Error(resultado.error || 'Error al enviar solicitud');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al enviar tu solicitud. Por favor intenta nuevamente.');
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// 2. FUNCIÓN MOSTRAR CONFIRMACIÓN - SIN CREDENCIALES AUTOMÁTICAS
function mostrarConfirmacionEnvio() {
    // Ocultar formulario y mostrar confirmación
    document.getElementById('registroForm').classList.add('hidden');
    document.getElementById('confirmacion').classList.remove('hidden');
    
    // Cambiar el contenido de confirmación
    const confirmacionDiv = document.getElementById('confirmacion');
    confirmacionDiv.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
            <div class="text-center mb-6">
                <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-green-600 text-3xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">¡Solicitud Enviada Exitosamente!</h2>
                <p class="text-gray-600">Hemos recibido tu información correctamente.</p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 class="text-blue-800 font-semibold mb-3">
                    <i class="fas fa-info-circle mr-2"></i>
                    ¿Qué sigue ahora?
                </h3>
                <div class="space-y-2 text-blue-700">
                    <p><i class="fas fa-clock mr-2"></i><strong>En las próximas 24 horas</strong> nuestro equipo revisará tu solicitud</p>
                    <p><i class="fas fa-envelope mr-2"></i>Te contactaremos por <strong>email o WhatsApp</strong> con tus credenciales de acceso</p>
                    <p><i class="fas fa-gift mr-2"></i>Tendrás <strong>15 días gratuitos</strong> para probar todas las funcionalidades</p>
                </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-gray-800 mb-2">Datos enviados:</h4>
                <div class="text-sm text-gray-600 space-y-1">
                    <p><strong>Taller:</strong> ${document.getElementById('nombreTaller').value}</p>
                    <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
                    <p><strong>Teléfono:</strong> ${document.getElementById('telefono').value || 'No proporcionado'}</p>
                </div>
            </div>

            <div class="flex gap-4">
                <button onclick="window.location.href='https://fixlytaller.com'" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Volver al Inicio
                </button>
                
                <button onclick="window.open('https://wa.me/1234567890?text=Hola, acabo de enviar mi solicitud de registro para Fixly Taller', '_blank')" 
                        class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                    <i class="fab fa-whatsapp mr-2"></i>
                    Contactar por WhatsApp
                </button>
            </div>
        </div>
    `;
}

// 3. FUNCIÓN PARA BACKEND - NUEVO ENDPOINT /api/lead-registro
// (Esta función va en el Worker de Cloudflare)

async function handleLeadRegistro(request, env) {
    try {
        const data = await request.json();
        const { empresa, email, telefono, propietario, direccion, tipo } = data;

        if (!empresa || !email) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Empresa y email son requeridos'
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
            });
        }

        // Guardar lead en KV (sin generar credenciales automáticas)
        const leadId = 'lead_' + Date.now();
        const leadData = {
            id: leadId,
            empresa,
            email,
            telefono: telefono || '',
            propietario: propietario || '',
            direccion: direccion || '',
            tipo,
            fechaRegistro: new Date().toISOString(),
            estado: 'pendiente', // pendiente, procesado, rechazado
            procesadoPor: null,
            fechaProcesado: null
        };

        await env.FIXLY_KV.put(leadId, JSON.stringify(leadData));

        // 🚀 ENVIAR NOTIFICACIÓN TELEGRAM (A TI)
        const telegramMessage = `🎯 *NUEVA SOLICITUD DE REGISTRO*

👤 *Empresa:* ${empresa}
👨‍💼 *Propietario:* ${propietario || 'No especificado'}
📧 *Email:* ${email}
📱 *Teléfono:* ${telefono || 'No proporcionado'}
📍 *Dirección:* ${direccion || 'No especificada'}

⏰ *Fecha:* ${new Date().toLocaleString('es-ES')}
🆔 *Lead ID:* ${leadId}

🔗 *Admin Panel:* admin.fixlytaller.com
💼 *Acción requerida:* Crear credenciales manualmente`;

        const telegramSent = await sendTelegramNotification(telegramMessage);

        // 📧 EMAIL DE NOTIFICACIÓN (A TI)
        const emailSent = await sendEmail(
            'tu-email@fixlytaller.com', // Tu email
            '🎯 Nueva solicitud de registro - Fixly Taller',
            `<h2>Nueva solicitud de registro</h2>
             <p><strong>Empresa:</strong> ${empresa}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Teléfono:</strong> ${telefono}</p>
             <p><strong>Lead ID:</strong> ${leadId}</p>
             <p><a href="https://admin.fixlytaller.com">Ir al panel admin</a></p>`,
            `Nueva solicitud: ${empresa} - ${email} - Lead ID: ${leadId}`
        );

        return new Response(JSON.stringify({
            success: true,
            mensaje: 'Solicitud recibida correctamente',
            leadId: leadId,
            notificaciones: {
                telegram: telegramSent ? 'Enviado' : 'Error',
                email: emailSent ? 'Enviado' : 'Error'
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
        });

    } catch (error) {
        console.error('Error en lead-registro:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error interno del servidor'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...handleCORS(request) }
        });
    }
}