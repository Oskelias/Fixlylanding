/**
 * MAILCHANNELS DIAGNOSTIC TOOL
 * Herramienta para diagnosticar problemas de email delivery con MailChannels
 */

const WORKER_URL = 'https://api.fixlytaller.com';

async function testMailChannelsDirect() {
  console.log('📧 TESTING MAILCHANNELS DIRECT API');
  console.log('=' .repeat(50));

  const emailData = {
    personalizations: [{
      to: [{ email: 'test@fixlytaller.com' }]
    }],
    from: {
      email: 'noreply@fixlytaller.com',
      name: 'Fixly Taller - Test Directo'
    },
    subject: '🧪 Test Directo MailChannels - ' + new Date().toISOString(),
    content: [
      {
        type: 'text/html',
        value: `
          <h1>Test Directo MailChannels</h1>
          <p>Este es un test directo de MailChannels API.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Source: Diagnostic Tool</p>
        `
      },
      {
        type: 'text/plain',
        value: `Test Directo MailChannels\n\nTimestamp: ${new Date().toISOString()}\nSource: Diagnostic Tool`
      }
    ]
  };

  try {
    console.log('🔄 Sending direct to MailChannels API...');
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    const responseText = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok ? '✅' : '❌'}`);
    console.log(`Response: ${responseText}`);

    if (!response.ok) {
      console.log('❌ MAILCHANNELS DIRECT API FAILED');
      console.log('   Possible causes:');
      console.log('   - SPF record not configured');
      console.log('   - Domain not verified with MailChannels');
      console.log('   - DKIM not set up');
    }

    return response.ok;
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function testWorkerEmailFunction() {
  console.log('\n🔧 TESTING WORKER EMAIL FUNCTION');
  console.log('=' .repeat(50));

  const testData = {
    empresa: 'Diagnostic Test Company',
    email: 'diagnostic@fixlytaller.com',
    telefono: '999888777',
    tipo: 'manual',
    duracion: 30,
    usuarioManual: `diagnostic_test_${Date.now()}`,
    passwordManual: `diagnostic_pass_${Date.now()}`
  };

  try {
    console.log('🔄 Testing Worker email via generate-code...');
    const response = await fetch(`${WORKER_URL}/api/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${response.ok ? '✅' : '❌'}`);
    console.log(`Email Status: ${data.notificaciones?.email || 'Not available'}`);
    console.log(`Telegram Status: ${data.notificaciones?.telegram || 'Not available'}`);

    if (data.notificaciones?.email === 'Error') {
      console.log('❌ WORKER EMAIL FUNCTION FAILING');
      console.log('   The Worker sendEmail function is returning false');
    }

    return response.ok && data.notificaciones?.email === 'Enviado';
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function checkDNSRecords() {
  console.log('\n🌐 DNS RECORDS ANALYSIS');
  console.log('=' .repeat(50));

  console.log('Required DNS records for MailChannels + fixlytaller.com:');
  console.log('');
  console.log('1️⃣ SPF Record (TXT):');
  console.log('   Name: fixlytaller.com');
  console.log('   Value: "v=spf1 include:relay.mailchannels.net ~all"');
  console.log('');
  console.log('2️⃣ DKIM Record (TXT) - Optional but recommended:');
  console.log('   Name: mailchannels._domainkey.fixlytaller.com');
  console.log('   Value: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."');
  console.log('');
  console.log('3️⃣ DMARC Record (TXT) - Optional:');
  console.log('   Name: _dmarc.fixlytaller.com');
  console.log('   Value: "v=DMARC1; p=none; rua=mailto:dmarc@fixlytaller.com"');
  console.log('');
  console.log('📋 Check these records in your Cloudflare DNS settings');
}

async function suggestFixes() {
  console.log('\n🔧 SUGGESTED FIXES');
  console.log('=' .repeat(50));

  console.log('Based on common MailChannels issues:');
  console.log('');
  console.log('1️⃣ IMMEDIATE FIXES:');
  console.log('   ✅ Add SPF record: "v=spf1 include:relay.mailchannels.net ~all"');
  console.log('   ✅ Ensure domain is added to MailChannels sender list');
  console.log('   ✅ Check Cloudflare Email Routing is not conflicting');
  console.log('');
  console.log('2️⃣ CODE FIXES:');
  console.log('   ✅ Add better error logging in sendEmail function');
  console.log('   ✅ Add retry mechanism for failed emails');
  console.log('   ✅ Implement fallback email method');
  console.log('');
  console.log('3️⃣ TESTING FIXES:');
  console.log('   ✅ Test with different email domains (@gmail.com, @hotmail.com)');
  console.log('   ✅ Check MailChannels logs (if accessible)');
  console.log('   ✅ Implement email queue for retries');
}

async function runDiagnostic() {
  console.log('🧪 MAILCHANNELS COMPREHENSIVE DIAGNOSTIC');
  console.log('=====================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Worker URL: ${WORKER_URL}`);

  const results = {};

  // Test 1: Direct MailChannels API
  results.directMailChannels = await testMailChannelsDirect();
  
  // Wait a bit between tests
  await new Promise(r => setTimeout(r, 2000));

  // Test 2: Worker Email Function
  results.workerEmail = await testWorkerEmailFunction();

  // Test 3: DNS Analysis
  checkDNSRecords();

  // Test 4: Suggestions
  suggestFixes();

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Direct MailChannels API: ${results.directMailChannels ? '✅ Working' : '❌ Failed'}`);
  console.log(`Worker Email Function: ${results.workerEmail ? '✅ Working' : '❌ Failed'}`);

  if (!results.directMailChannels && !results.workerEmail) {
    console.log('\n❌ BOTH TESTS FAILED - DNS/SPF Configuration Issue');
    console.log('   Priority: Configure SPF record in Cloudflare DNS');
  } else if (!results.workerEmail) {
    console.log('\n⚠️ WORKER ISSUE - MailChannels API works, Worker function fails');
    console.log('   Priority: Fix Worker sendEmail function');
  } else {
    console.log('\n✅ ALL TESTS PASSED - Email should be working');
  }

  return results;
}

// Export para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runDiagnostic };
}

// Auto-ejecutar
if (typeof window === 'undefined') {
  runDiagnostic().catch(console.error);
}