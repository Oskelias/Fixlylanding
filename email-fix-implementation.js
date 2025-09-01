/**
 * EMAIL FIX IMPLEMENTATION
 * Implementar fixes para resolver el problema de delivery de emails
 */

// ==========================================
// WORKER CODE IMPROVEMENTS
// ==========================================

const IMPROVED_EMAIL_FUNCTION = `
/**
 * Función de email mejorada con mejor error handling y logging
 */
async function sendEmailImproved(to, subject, htmlContent, textContent) {
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(\`📧 Email attempt \${attempt}/\${maxRetries} to: \${to}\`);
      
      const emailData = {
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.FROM_NAME
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent
          },
          {
            type: 'text/plain', 
            value: textContent
          }
        ]
      };

      console.log(\`📤 Sending email via MailChannels...\`);
      console.log(\`From: \${EMAIL_CONFIG.FROM_EMAIL}\`);
      console.log(\`To: \${to}\`);
      console.log(\`Subject: \${subject}\`);

      const response = await fetch(EMAIL_CONFIG.MAILCHANNELS_API, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Fixly-Worker/4.1.0'
        },
        body: JSON.stringify(emailData)
      });

      const responseText = await response.text();
      
      console.log(\`📬 MailChannels Response - Status: \${response.status}\`);
      console.log(\`📬 MailChannels Response - Body: \${responseText}\`);

      if (response.ok) {
        console.log(\`✅ Email sent successfully on attempt \${attempt}\`);
        return true;
      } else {
        lastError = \`HTTP \${response.status}: \${responseText}\`;
        console.log(\`❌ Email failed on attempt \${attempt}: \${lastError}\`);
        
        // Si es 401, no reintentar (problema de configuración)
        if (response.status === 401) {
          console.log(\`🚫 401 Unauthorized - SPF/DNS configuration issue, not retrying\`);
          break;
        }
        
        // Esperar antes del siguiente intento
        if (attempt < maxRetries) {
          console.log(\`⏳ Waiting 2 seconds before retry...\`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      lastError = error.message;
      console.log(\`❌ Email network error on attempt \${attempt}: \${lastError}\`);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log(\`💥 All email attempts failed. Last error: \${lastError}\`);
  return false;
}`;

// ==========================================
// DNS CONFIGURATION GUIDE
// ==========================================

function generateDNSInstructions() {
  console.log('🌐 CLOUDFLARE DNS CONFIGURATION GUIDE');
  console.log('=====================================');
  console.log('');
  console.log('Go to Cloudflare Dashboard > DNS > Records');
  console.log('Add the following DNS records:');
  console.log('');
  
  console.log('1️⃣ SPF RECORD (CRITICAL):');
  console.log('   Type: TXT');
  console.log('   Name: fixlytaller.com (or @)');
  console.log('   Value: v=spf1 include:relay.mailchannels.net ~all');
  console.log('   TTL: Auto');
  console.log('   Proxy: DNS only (gray cloud)');
  console.log('');
  
  console.log('2️⃣ DKIM RECORD (OPTIONAL BUT RECOMMENDED):');
  console.log('   Type: TXT');
  console.log('   Name: mailchannels._domainkey');
  console.log('   Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYzM...');
  console.log('   TTL: Auto');
  console.log('   Proxy: DNS only (gray cloud)');
  console.log('');
  
  console.log('3️⃣ DMARC RECORD (OPTIONAL):');
  console.log('   Type: TXT');
  console.log('   Name: _dmarc');
  console.log('   Value: v=DMARC1; p=none; rua=mailto:dmarc@fixlytaller.com');
  console.log('   TTL: Auto');
  console.log('   Proxy: DNS only (gray cloud)');
  console.log('');
  
  console.log('⚠️ IMPORTANT NOTES:');
  console.log('- SPF record is MANDATORY for MailChannels');
  console.log('- Wait 5-10 minutes after DNS changes for propagation');
  console.log('- Test with dig command: dig TXT fixlytaller.com');
  console.log('- Ensure no conflicting SPF records exist');
}

// ==========================================
// ALTERNATIVE EMAIL SOLUTIONS
// ==========================================

const FALLBACK_EMAIL_SOLUTIONS = `
// OPCIÓN 1: Usar Resend como fallback
async function sendEmailWithFallback(to, subject, htmlContent, textContent) {
  // Intentar MailChannels primero
  const mailChannelsSuccess = await sendEmailImproved(to, subject, htmlContent, textContent);
  
  if (mailChannelsSuccess) {
    return { method: 'mailchannels', success: true };
  }
  
  // Fallback a Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@fixlytaller.com',
        to: [to],
        subject: subject,
        html: htmlContent
      })
    });
    
    return { method: 'resend', success: response.ok };
  } catch (error) {
    return { method: 'fallback_failed', success: false, error: error.message };
  }
}

// OPCIÓN 2: Queue para reintentos
async function queueEmailForRetry(emailData) {
  const retryKey = \`email_retry_\${Date.now()}\`;
  await env.FIXLY_KV.put(retryKey, JSON.stringify({
    ...emailData,
    attempts: 0,
    maxAttempts: 5,
    nextRetry: Date.now() + (5 * 60 * 1000) // 5 minutos
  }), { expirationTtl: 86400 }); // 24 horas
}`;

// ==========================================
// QUICK DNS CHECK FUNCTION
// ==========================================

async function checkCurrentDNS() {
  console.log('\n🔍 CHECKING CURRENT DNS CONFIGURATION');
  console.log('=====================================');
  
  try {
    // Intentar verificar el SPF record actual
    console.log('Checking SPF record for fixlytaller.com...');
    console.log('Note: DNS propagation may take 5-10 minutes after changes');
    console.log('');
    console.log('To manually check SPF record, run:');
    console.log('  dig TXT fixlytaller.com');
    console.log('  nslookup -type=TXT fixlytaller.com');
    console.log('');
    console.log('Expected result should include:');
    console.log('  "v=spf1 include:relay.mailchannels.net ~all"');
    
  } catch (error) {
    console.log(`Error checking DNS: ${error.message}`);
  }
}

// ==========================================
// UPDATED WORKER CODE GENERATOR
// ==========================================

function generateUpdatedWorkerCode() {
  console.log('\n📝 UPDATED WORKER CODE WITH EMAIL FIXES');
  console.log('=======================================');
  console.log('');
  console.log('Replace the sendEmail function in your Worker with this improved version:');
  console.log('');
  console.log(IMPROVED_EMAIL_FUNCTION);
  console.log('');
  console.log('Alternative solutions:');
  console.log(FALLBACK_EMAIL_SOLUTIONS);
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function implementEmailFix() {
  console.log('🔧 EMAIL FIX IMPLEMENTATION GUIDE');
  console.log('=================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Step 1: DNS Configuration
  generateDNSInstructions();
  
  // Step 2: Check current DNS
  await checkCurrentDNS();
  
  // Step 3: Updated Worker code
  generateUpdatedWorkerCode();
  
  // Step 4: Next steps
  console.log('\n📋 NEXT STEPS:');
  console.log('=============');
  console.log('1️⃣ Add SPF record in Cloudflare DNS (CRITICAL)');
  console.log('2️⃣ Wait 5-10 minutes for DNS propagation');
  console.log('3️⃣ Update Worker code with improved sendEmail function');
  console.log('4️⃣ Test email delivery again');
  console.log('5️⃣ If still failing, implement fallback solution');
  
  console.log('\n🎯 PRIORITY ACTION:');
  console.log('Add this SPF record in Cloudflare DNS:');
  console.log('Name: fixlytaller.com');
  console.log('Value: v=spf1 include:relay.mailchannels.net ~all');
}

// Export and run
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { implementEmailFix };
}

if (typeof window === 'undefined') {
  implementEmailFix().catch(console.error);
}