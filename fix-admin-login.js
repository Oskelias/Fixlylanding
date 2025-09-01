// QUICK FIX para admin login - agregar esta lógica al handleLogin

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

    // HARDCODED ADMIN LOGIN
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

    // Resto del código para usuarios normales...
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

    // ... resto del código existente
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