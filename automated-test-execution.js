/**
 * AUTOMATED TEST EXECUTION FOR FIXLY WORKER v4.1.0
 * Pruebas automáticas del deploy del Worker de Fixly
 */

const WORKER_URLS = [
  'https://fixly-backend.oscarellas.workers.dev',
  'https://api.fixlytaller.com'
];

async function makeRequest(url, endpoint, method = 'GET', body = null) {
  try {
    const config = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fixly-Test-Bot/1.0',
        'Origin': 'https://fixlytaller.com'
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    console.log(`🔄 Testing: ${method} ${url}${endpoint}`);
    
    const response = await fetch(url + endpoint, config);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      url: url + endpoint
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: { error: 'Network error: ' + error.message },
      url: url + endpoint
    };
  }
}

async function test1_HealthCheck(workerUrl) {
  console.log('\n🩺 TEST 1: HEALTH CHECK');
  console.log('=' .repeat(50));
  
  const result = await makeRequest(workerUrl, '/health');
  
  const success = result.success && result.data.version === '4.1.0-login-fixed';
  
  console.log(`Status: ${result.status}`);
  console.log(`Success: ${success ? '✅' : '❌'}`);
  console.log(`Version: ${result.data?.version || 'Not found'}`);
  console.log(`Features: ${result.data?.features?.join(', ') || 'Not available'}`);
  
  if (!success) {
    console.log('❌ PROBLEM: Expected version 4.1.0-login-fixed');
    if (result.data?.version) {
      console.log(`   Found version: ${result.data.version}`);
    }
  }
  
  return success;
}

async function test2_AdminLogin(workerUrl) {
  console.log('\n🔐 TEST 2: ADMIN LOGIN');
  console.log('=' .repeat(50));
  
  const result = await makeRequest(workerUrl, '/api/login', 'POST', {
    username: 'admin',
    password: 'fixly2024!'
  });
  
  const success = result.success && result.data.user?.role === 'admin';
  
  console.log(`Status: ${result.status}`);
  console.log(`Success: ${success ? '✅' : '❌'}`);
  console.log(`Role: ${result.data?.user?.role || 'Not found'}`);
  console.log(`Username: ${result.data?.user?.username || 'Not found'}`);
  
  if (!success) {
    console.log('❌ PROBLEM: Admin login failed');
    console.log(`   Error: ${result.data?.error || 'Unknown error'}`);
  }
  
  return success;
}

async function test3_CreateManualUser(workerUrl) {
  console.log('\n👤 TEST 3: CREATE MANUAL USER');
  console.log('=' .repeat(50));
  
  const timestamp = Date.now();
  const testData = {
    empresa: 'Automated Test Company',
    email: `test-${timestamp}@fixlytaller.com`,
    telefono: '123456789',
    tipo: 'manual',
    duracion: 30,
    usuarioManual: `auto_test_${timestamp}`,
    passwordManual: `fix_2025_AUTO_${timestamp}`
  };
  
  console.log(`Creating user: ${testData.usuarioManual}`);
  console.log(`Email: ${testData.email}`);
  
  const result = await makeRequest(workerUrl, '/api/generate-code', 'POST', testData);
  
  const success = result.success && result.data.username && result.data.password;
  
  console.log(`Status: ${result.status}`);
  console.log(`Success: ${success ? '✅' : '❌'}`);
  console.log(`Username: ${result.data?.username || 'Not created'}`);
  console.log(`Password: ${result.data?.password || 'Not created'}`);
  console.log(`Email sent: ${result.data?.notificaciones?.email || 'Unknown'}`);
  console.log(`Telegram sent: ${result.data?.notificaciones?.telegram || 'Unknown'}`);
  
  if (!success) {
    console.log('❌ PROBLEM: User creation failed');
    console.log(`   Error: ${result.data?.error || 'Unknown error'}`);
  }
  
  // Return user data for next test
  return {
    success,
    userData: success ? {
      username: result.data.username,
      password: result.data.password
    } : null
  };
}

async function test4_UserLogin(workerUrl, userData) {
  console.log('\n🔑 TEST 4: USER LOGIN');
  console.log('=' .repeat(50));
  
  if (!userData) {
    console.log('❌ SKIPPED: No user data from previous test');
    return false;
  }
  
  console.log(`Testing login for: ${userData.username}`);
  
  const result = await makeRequest(workerUrl, '/api/login', 'POST', {
    username: userData.username,
    password: userData.password
  });
  
  const success = result.success && result.data.user?.username === userData.username;
  
  console.log(`Status: ${result.status}`);
  console.log(`Success: ${success ? '✅' : '❌'}`);
  console.log(`Logged user: ${result.data?.user?.username || 'Not found'}`);
  console.log(`Role: ${result.data?.user?.role || 'Not found'}`);
  console.log(`Token: ${result.data?.token ? 'Generated' : 'Not generated'}`);
  
  if (!success) {
    console.log('❌ PROBLEM: User login failed');
    console.log(`   Error: ${result.data?.error || 'Unknown error'}`);
  }
  
  return success;
}

async function test5_Notifications(workerUrl) {
  console.log('\n📧 TEST 5: NOTIFICATIONS');
  console.log('=' .repeat(50));
  
  const timestamp = Date.now();
  const testData = {
    empresa: 'Notification Test Company',
    email: `notifications-${timestamp}@fixlytaller.com`,
    telefono: '987654321',
    tipo: 'manual',
    duracion: 30,
    usuarioManual: `notif_test_${timestamp}`,
    passwordManual: `notif_pass_${timestamp}`
  };
  
  console.log(`Testing notifications for: ${testData.email}`);
  
  const result = await makeRequest(workerUrl, '/api/generate-code', 'POST', testData);
  
  const emailSent = result.data?.notificaciones?.email === 'Enviado';
  const telegramSent = result.data?.notificaciones?.telegram === 'Enviado';
  const success = result.success && (emailSent || telegramSent);
  
  console.log(`Status: ${result.status}`);
  console.log(`Success: ${success ? '✅' : '❌'}`);
  console.log(`Email sent: ${emailSent ? '✅' : '❌'} (${result.data?.notificaciones?.email || 'Unknown'})`);
  console.log(`Telegram sent: ${telegramSent ? '✅' : '❌'} (${result.data?.notificaciones?.telegram || 'Unknown'})`);
  
  if (!success) {
    console.log('❌ PROBLEM: Notifications failed');
    console.log(`   Both email and telegram failed`);
  }
  
  return success;
}

async function runAllTests() {
  console.log('🚀 FIXLY WORKER AUTOMATED TEST SUITE');
  console.log('====================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Testing URLs: ${WORKER_URLS.join(', ')}`);
  
  const results = {};
  
  for (const workerUrl of WORKER_URLS) {
    console.log(`\n🌐 TESTING WORKER: ${workerUrl}`);
    console.log('=' .repeat(60));
    
    try {
      // Test 1: Health Check
      const test1 = await test1_HealthCheck(workerUrl);
      
      // Test 2: Admin Login
      const test2 = await test2_AdminLogin(workerUrl);
      
      // Test 3: Create Manual User
      const test3Result = await test3_CreateManualUser(workerUrl);
      const test3 = test3Result.success;
      
      // Test 4: User Login (depends on test 3)
      const test4 = await test4_UserLogin(workerUrl, test3Result.userData);
      
      // Test 5: Notifications
      const test5 = await test5_Notifications(workerUrl);
      
      const totalTests = 5;
      const passedTests = [test1, test2, test3, test4, test5].filter(t => t).length;
      
      results[workerUrl] = {
        totalTests,
        passedTests,
        success: passedTests >= 4, // 4 out of 5 is acceptable
        tests: {
          healthCheck: test1,
          adminLogin: test2,
          createUser: test3,
          userLogin: test4,
          notifications: test5
        }
      };
      
      console.log(`\n📊 SUMMARY FOR ${workerUrl}`);
      console.log(`Passed: ${passedTests}/${totalTests} tests`);
      console.log(`Overall: ${results[workerUrl].success ? '✅ SUCCESS' : '❌ FAILED'}`);
      
    } catch (error) {
      console.log(`❌ CRITICAL ERROR testing ${workerUrl}: ${error.message}`);
      results[workerUrl] = {
        totalTests: 5,
        passedTests: 0,
        success: false,
        error: error.message
      };
    }
  }
  
  // Final Summary
  console.log('\n' + '=' .repeat(80));
  console.log('🎯 FINAL RESULTS SUMMARY');
  console.log('=' .repeat(80));
  
  for (const [url, result] of Object.entries(results)) {
    console.log(`\n${url}:`);
    console.log(`  Status: ${result.success ? '✅ OPERATIONAL' : '❌ ISSUES DETECTED'}`);
    console.log(`  Tests: ${result.passedTests}/${result.totalTests} passed`);
    
    if (result.tests) {
      console.log(`  Details:`);
      console.log(`    Health Check: ${result.tests.healthCheck ? '✅' : '❌'}`);
      console.log(`    Admin Login: ${result.tests.adminLogin ? '✅' : '❌'}`);
      console.log(`    User Creation: ${result.tests.createUser ? '✅' : '❌'}`);
      console.log(`    User Login: ${result.tests.userLogin ? '✅' : '❌'}`);
      console.log(`    Notifications: ${result.tests.notifications ? '✅' : '❌'}`);
    }
    
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  }
  
  const workingUrls = Object.values(results).filter(r => r.success).length;
  console.log(`\n🎉 DEPLOYMENT STATUS: ${workingUrls}/${WORKER_URLS.length} URLs operational`);
  
  if (workingUrls > 0) {
    console.log('✅ DEPLOYMENT SUCCESSFUL - Worker is operational!');
  } else {
    console.log('❌ DEPLOYMENT FAILED - All URLs have issues');
  }
  
  return results;
}

// Export para uso en Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

// Auto-ejecutar si se ejecuta directamente
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}