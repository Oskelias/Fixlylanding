/**
 * TESTING SUITE - Worker v4.2.0 Deployment Verification
 * Prueba todas las funcionalidades críticas después del deploy
 */

const WORKER_URL = 'https://api.fixlytaller.com';

async function testWorkerDeployment() {
  console.log('🚀 INICIANDO TESTING SUITE - Worker v4.2.0');
  console.log('=' .repeat(60));

  const results = [];

  // ==========================================
  // TEST 1: HEALTH CHECK v4.2.0
  // ==========================================
  console.log('\n📊 TEST 1: Health Check v4.2.0');
  try {
    const response = await fetch(`${WORKER_URL}/health`);
    const data = await response.json();
    
    console.log('✅ Health Response:', JSON.stringify(data, null, 2));
    
    if (data.version === '4.2.0-email-fixed') {
      console.log('✅ VERSIÓN CORRECTA: 4.2.0-email-fixed');
      results.push({ test: 'Health Check', status: '✅ PASS', details: 'Version 4.2.0 confirmed' });
    } else {
      console.log('❌ VERSIÓN INCORRECTA:', data.version);
      results.push({ test: 'Health Check', status: '❌ FAIL', details: `Expected 4.2.0, got ${data.version}` });
    }
  } catch (error) {
    console.log('❌ Health Check Error:', error.message);
    results.push({ test: 'Health Check', status: '❌ ERROR', details: error.message });
  }

  // ==========================================
  // TEST 2: ADMIN LOGIN FIXED
  // ==========================================
  console.log('\n🔐 TEST 2: Admin Login (Fixed)');
  try {
    const response = await fetch(`${WORKER_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'fixly2024!'
      })
    });

    const data = await response.json();
    
    if (data.success && data.user.role === 'admin') {
      console.log('✅ ADMIN LOGIN SUCCESS:', data.message);
      console.log('   Usuario:', data.user.username);
      console.log('   Email:', data.user.email);
      results.push({ test: 'Admin Login', status: '✅ PASS', details: 'Admin authenticated successfully' });
    } else {
      console.log('❌ ADMIN LOGIN FAILED:', data.error || 'Unknown error');
      results.push({ test: 'Admin Login', status: '❌ FAIL', details: data.error || 'Login failed' });
    }
  } catch (error) {
    console.log('❌ Admin Login Error:', error.message);
    results.push({ test: 'Admin Login', status: '❌ ERROR', details: error.message });
  }

  // ==========================================
  // TEST 3: USER CREATION + EMAIL LOGGING
  // ==========================================
  console.log('\n👤 TEST 3: User Creation + Enhanced Email Logging');
  try {
    const testUser = {
      empresa: `Test Deploy v4.2.0 - ${Date.now()}`,
      email: 'oscar.ellas@gmail.com', // Email real para probar
      telefono: '+34666777888',
      tipo: 'prueba',
      duracion: 15
    };

    console.log('📤 Creando usuario de prueba...');
    console.log('   Empresa:', testUser.empresa);
    console.log('   Email:', testUser.email);

    const response = await fetch(`${WORKER_URL}/api/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ USUARIO CREADO EXITOSAMENTE');
      console.log('   Username:', data.username);
      console.log('   Password:', data.password);
      console.log('   Codigo:', data.codigo);
      console.log('   📱 Telegram:', data.notificaciones.telegram);
      console.log('   📧 Email:', data.notificaciones.email);
      console.log('   📧 Email Details:', data.notificaciones.emailDetails);
      
      results.push({ 
        test: 'User Creation', 
        status: '✅ PASS', 
        details: `User ${data.username} created. Email: ${data.notificaciones.email}` 
      });
    } else {
      console.log('❌ ERROR CREANDO USUARIO:', data.error);
      results.push({ test: 'User Creation', status: '❌ FAIL', details: data.error });
    }
  } catch (error) {
    console.log('❌ User Creation Error:', error.message);
    results.push({ test: 'User Creation', status: '❌ ERROR', details: error.message });
  }

  // ==========================================
  // TEST 4: USER LOGIN WITH NEW PASSWORD VALIDATION
  // ==========================================
  console.log('\n🔑 TEST 4: User Login (Enhanced Password Validation)');
  
  // Crear usuario específico para login test
  try {
    const loginTestUser = {
      empresa: 'Login Test Company',
      email: 'logintest@fixlytaller.com',
      usuarioManual: 'test_login_user',
      passwordManual: 'test_password_123',
      tipo: 'manual'
    };

    // Crear el usuario
    const createResponse = await fetch(`${WORKER_URL}/api/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginTestUser)
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      // Probar login
      const loginResponse = await fetch(`${WORKER_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginTestUser.usuarioManual,
          password: loginTestUser.passwordManual
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginData.success && loginData.user) {
        console.log('✅ USER LOGIN SUCCESS');
        console.log('   Usuario:', loginData.user.username);
        console.log('   Empresa:', loginData.user.empresa);
        console.log('   Token generado:', loginData.token ? 'Si' : 'No');
        results.push({ test: 'User Login', status: '✅ PASS', details: 'Enhanced password validation working' });
      } else {
        console.log('❌ USER LOGIN FAILED:', loginData.error);
        results.push({ test: 'User Login', status: '❌ FAIL', details: loginData.error });
      }
    }
  } catch (error) {
    console.log('❌ User Login Test Error:', error.message);
    results.push({ test: 'User Login', status: '❌ ERROR', details: error.message });
  }

  // ==========================================
  // RESUMEN FINAL
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE TESTING v4.2.0');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.status} ${result.test}`);
    console.log(`   Detalles: ${result.details}`);
  });

  const passCount = results.filter(r => r.status.includes('✅')).length;
  const totalTests = results.length;
  
  console.log('\n🎯 RESULTADO FINAL:');
  console.log(`   ✅ Exitosos: ${passCount}/${totalTests}`);
  console.log(`   ❌ Fallidos: ${totalTests - passCount}/${totalTests}`);
  
  if (passCount === totalTests) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON! Worker v4.2.0 está funcionando perfectamente.');
    console.log('🔧 Nota: Si emails fallan, revisar logs de Cloudflare para detalles de MailChannels');
  } else {
    console.log('\n⚠️ Algunos tests fallaron. Revisar detalles arriba.');
  }
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. Revisar logs de Cloudflare Workers para detalles de email');
  console.log('2. Verificar SPF record con: dig txt fixlytaller.com');
  console.log('3. Monitorear emails en grupocioacr@gmail.com');
  console.log('4. Usar admin panel: admin.fixlytaller.com (admin / fixly2024!)');
}

// Ejecutar testing
testWorkerDeployment().catch(console.error);