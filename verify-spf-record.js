/**
 * VERIFICACIÓN SPF RECORD - DIAGNÓSTICO COMPLETO
 * Verificar el estado actual del SPF record de fixlytaller.com
 */

const dns = require('dns').promises;

async function verificarSPF() {
  console.log('🔍 VERIFICANDO SPF RECORD DE fixlytaller.com');
  console.log('=' .repeat(50));

  try {
    // Resolver TXT records
    const txtRecords = await dns.resolveTxt('fixlytaller.com');
    
    console.log('\n📋 TODOS LOS TXT RECORDS ENCONTRADOS:');
    txtRecords.forEach((record, index) => {
      const recordText = record.join('');
      console.log(`${index + 1}. ${recordText}`);
    });

    // Buscar SPF records específicamente
    console.log('\n🔍 ANÁLISIS SPF:');
    const spfRecords = txtRecords.filter(record => 
      record.join('').startsWith('v=spf1')
    );

    if (spfRecords.length === 0) {
      console.log('❌ NO SE ENCONTRÓ NINGÚN SPF RECORD');
      return;
    }

    console.log(`\n📊 SPF RECORDS ENCONTRADOS: ${spfRecords.length}`);
    
    spfRecords.forEach((spf, index) => {
      const spfText = spf.join('');
      console.log(`\nSPF ${index + 1}: ${spfText}`);
      
      // Verificar componentes
      console.log('  🔧 Componentes:');
      
      if (spfText.includes('include:spf.mx.cloudflare.net')) {
        console.log('    ✅ Cloudflare Email Routing: include:spf.mx.cloudflare.net');
      } else {
        console.log('    ❌ Cloudflare Email Routing: FALTA include:spf.mx.cloudflare.net');
      }
      
      if (spfText.includes('include:relay.mailchannels.net')) {
        console.log('    ✅ MailChannels: include:relay.mailchannels.net');
      } else {
        console.log('    ❌ MailChannels: FALTA include:relay.mailchannels.net');
      }
      
      if (spfText.includes('~all') || spfText.includes('-all') || spfText.includes('+all')) {
        console.log('    ✅ Política final encontrada');
      } else {
        console.log('    ⚠️ Política final no clara');
      }
    });

    // Verificar SPF ideal
    console.log('\n🎯 SPF RECORD REQUERIDO:');
    console.log('v=spf1 include:spf.mx.cloudflare.net include:relay.mailchannels.net ~all');
    
    const idealSPF = 'v=spf1 include:spf.mx.cloudflare.net include:relay.mailchannels.net ~all';
    const currentSPF = spfRecords.length > 0 ? spfRecords[0].join('') : '';
    
    if (currentSPF === idealSPF) {
      console.log('\n🎉 ¡SPF RECORD PERFECTO! El problema debe ser propagación DNS.');
      console.log('⏰ Esperar 5-15 minutos más para propagación completa.');
    } else {
      console.log('\n⚠️ SPF RECORD NECESITA AJUSTES');
      console.log(`Actual: ${currentSPF}`);
      console.log(`Ideal:  ${idealSPF}`);
    }

  } catch (error) {
    console.error('❌ Error verificando DNS:', error.message);
  }
}

async function verificarPropagacion() {
  console.log('\n🌍 VERIFICANDO PROPAGACIÓN GLOBAL DNS...');
  
  // Servidores DNS públicos para verificar propagación
  const dnsServers = [
    { name: 'Cloudflare', ip: '1.1.1.1' },
    { name: 'Google', ip: '8.8.8.8' },
    { name: 'Quad9', ip: '9.9.9.9' }
  ];
  
  for (const server of dnsServers) {
    try {
      console.log(`\n📡 Consultando ${server.name} (${server.ip}):`);
      
      // Nota: En Node.js no podemos especificar servidor DNS directamente
      // pero podemos simular verificando desde múltiples ubicaciones
      const txtRecords = await dns.resolveTxt('fixlytaller.com');
      const spfRecords = txtRecords.filter(record => 
        record.join('').startsWith('v=spf1')
      );
      
      if (spfRecords.length > 0) {
        const spf = spfRecords[0].join('');
        if (spf.includes('relay.mailchannels.net')) {
          console.log(`   ✅ MailChannels incluido`);
        } else {
          console.log(`   ❌ MailChannels NO incluido`);
        }
      } else {
        console.log(`   ❌ Sin SPF record`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function main() {
  await verificarSPF();
  await verificarPropagacion();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('1. Si SPF es correcto → Esperar propagación DNS (15-30 min)');
  console.log('2. Si SPF está mal → Corregir en Cloudflare DNS');
  console.log('3. Probar emails cada 10 minutos hasta que funcione');
  console.log('4. MailChannels puede tardar en actualizar su caché');
}

main().catch(console.error);