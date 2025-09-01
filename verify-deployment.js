#!/usr/bin/env node

/**
 * 🔍 VERIFICACIÓN POST-DEPLOYMENT
 * 
 * Script para verificar que el sistema multi-tenant 
 * está funcionando correctamente después del deployment
 */

const https = require('https');

const CONFIG = {
    APP_URL: 'https://app.fixlytaller.com',
    API_URL: 'https://api.fixlytaller.com',
    ADMIN_URL: 'https://administrador.fixlytaller.com'
};

async function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'FixlyVerification/1.0'
            }
        };

        if (data && method !== 'GET') {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', reject);
        
        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function checkEndpoint(name, url, expectedContent = null) {
    process.stdout.write(`🔍 ${name}... `);
    
    try {
        const response = await makeRequest(url);
        
        if (response.statusCode === 200) {
            if (expectedContent && !response.body.includes(expectedContent)) {
                console.log(`❌ FAIL (content missing: ${expectedContent})`);
                return false;
            }
            console.log('✅ OK');
            return true;
        } else {
            console.log(`❌ FAIL (${response.statusCode})`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function checkMundoElectronicoUI() {
    process.stdout.write('🎨 Mundo Electrónico UI... ');
    
    try {
        const response = await makeRequest(CONFIG.APP_URL);
        
        if (response.statusCode !== 200) {
            console.log(`❌ FAIL (${response.statusCode})`);
            return false;
        }
        
        const html = response.body;
        const checks = [
            { name: 'Mundo Electrónico branding', pattern: /mundo.*electr[oó]nico/i },
            { name: 'Login form', pattern: /input.*type.*text|usuario/i },
            { name: 'Password field', pattern: /input.*type.*password|contraseña/i },
            { name: 'Multi-tenant API call', pattern: /api\/login/ }
        ];
        
        const failed = checks.filter(check => !check.pattern.test(html));
        
        if (failed.length === 0) {
            console.log('✅ OK (UI completa)');
            return true;
        } else {
            console.log(`❌ FAIL (missing: ${failed.map(f => f.name).join(', ')})`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function checkLoginFlow() {
    process.stdout.write('🔐 Login flow multi-tenant... ');
    
    try {
        // Test con credenciales de admin (debe funcionar)
        const response = await makeRequest(
            `${CONFIG.API_URL}/api/login`,
            'POST',
            { username: 'admin', password: 'fixly2024!' }
        );
        
        if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            if (data.success) {
                console.log('✅ OK (login API functional)');
                return true;
            }
        }
        
        console.log(`❌ FAIL (login not working)`);
        return false;
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function checkRouting() {
    process.stdout.write('🔄 SPA Routing... ');
    
    try {
        // Test rutas que deben redirigir a index.html
        const routes = ['/login', '/dashboard', '/taller'];
        let allWorking = true;
        
        for (const route of routes) {
            const response = await makeRequest(CONFIG.APP_URL + route);
            if (response.statusCode !== 200) {
                allWorking = false;
                break;
            }
        }
        
        if (allWorking) {
            console.log('✅ OK (all routes work)');
            return true;
        } else {
            console.log('❌ FAIL (some routes broken)');
            return false;
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🔍 VERIFICANDO DEPLOYMENT MUNDO ELECTRÓNICO MULTI-TENANT\n');
    
    let passed = 0;
    let total = 0;
    
    // 1. Verificaciones básicas de conectividad
    const basicChecks = [
        ['API Backend', CONFIG.API_URL + '/health', 'healthy'],
        ['App Frontend', CONFIG.APP_URL, null],
        ['Admin Panel', CONFIG.ADMIN_URL, null]
    ];
    
    for (const [name, url, content] of basicChecks) {
        total++;
        if (await checkEndpoint(name, url, content)) passed++;
    }
    
    // 2. Verificación de UI específica
    total++;
    if (await checkMundoElectronicoUI()) passed++;
    
    // 3. Verificación de login
    total++;
    if (await checkLoginFlow()) passed++;
    
    // 4. Verificación de routing
    total++;
    if (await checkRouting()) passed++;
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN POST-DEPLOYMENT');
    console.log('='.repeat(60));
    console.log(`✅ Verificaciones pasadas: ${passed}`);
    console.log(`❌ Verificaciones fallidas: ${total - passed}`);
    console.log(`📝 Total: ${total}`);
    
    if (passed === total) {
        console.log('\n🎉 ¡DEPLOYMENT EXITOSO!');
        console.log('✅ Sistema multi-tenant funcionando correctamente');
        console.log('✅ Mundo Electrónico UI preservada');
        console.log('✅ Routing SPA configurado');
        console.log('✅ API integration working');
        
        console.log('\n🚀 SISTEMA LISTO PARA USAR:');
        console.log(`   🌐 App: ${CONFIG.APP_URL}`);
        console.log(`   👨‍💼 Admin: ${CONFIG.ADMIN_URL}`);
        console.log(`   🔧 API: ${CONFIG.API_URL}`);
    } else {
        console.log(`\n⚠️ ${total - passed} verificación(es) fallaron`);
        console.log('🔧 Revisar configuración y deployment');
        
        if (passed >= 4) {
            console.log('\n💡 NOTA: Las funciones básicas están trabajando.');
            console.log('   Los errores pueden ser menores y no afectar funcionalidad.');
        }
    }
    
    return passed === total;
}

if (require.main === module) {
    main().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('💥 Error en verificación:', error.message);
        process.exit(1);
    });
}

module.exports = { main };