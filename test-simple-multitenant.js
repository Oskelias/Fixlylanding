#!/usr/bin/env node

/**
 * 🧪 TEST SIMPLE SISTEMA MULTI-TENANT
 * 
 * Verifica el flujo actual disponible:
 * 1. API disponible
 * 2. Admin login
 * 3. Generar código (crear usuario)
 * 4. Validar código 
 * 5. Login multi-tenant
 */

const https = require('https');

const CONFIG = {
    API_BASE: 'https://api.fixlytaller.com',
    MUNDO_ELECTRONICO: 'https://app.fixlytaller.com',
    
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'fixly2024!'
    }
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
                'User-Agent': 'FixlyTest/1.0'
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
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsed,
                        rawBody: body
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: null,
                        rawBody: body
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function test(name, fn) {
    process.stdout.write(`🧪 ${name}... `);
    try {
        const result = await fn();
        console.log(result ? '✅ PASS' : '❌ FAIL');
        return result;
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 TEST SIMPLE SISTEMA MULTI-TENANT\n');
    
    let passed = 0;
    let total = 0;

    // 1. Test de conectividad básica
    total++;
    if (await test('API Backend disponible', async () => {
        const response = await makeRequest(`${CONFIG.API_BASE}/health`);
        return response.statusCode === 200;
    })) passed++;

    // 2. Test de Mundo Electrónico
    total++;  
    if (await test('Mundo Electrónico accesible', async () => {
        const response = await makeRequest(CONFIG.MUNDO_ELECTRONICO);
        return response.statusCode === 200;
    })) passed++;

    // 3. Test de admin login
    total++;
    let adminWorking = false;
    if (await test('Admin login funcional', async () => {
        const response = await makeRequest(
            `${CONFIG.API_BASE}/api/login`,
            'POST',
            CONFIG.ADMIN_CREDENTIALS
        );
        
        if (response.statusCode === 200 && response.data.success) {
            adminWorking = true;
            return true;
        }
        return false;
    })) passed++;

    // 4. Test de generar código (crear usuario temporal)
    total++;
    let testUser = null;
    if (await test('Generar código para usuario test', async () => {
        if (!adminWorking) {
            throw new Error('Admin login requerido');
        }

        const userData = {
            email: 'test@fixly.com',
            nombre: 'Usuario Test',
            empresa: 'Taller Test',
            telefono: '123456789'
        };

        const response = await makeRequest(
            `${CONFIG.API_BASE}/api/generate-code`,
            'POST',
            userData
        );
        
        if (response.statusCode === 200 && response.data.success) {
            testUser = {
                ...userData,
                code: response.data.codigoActivacion,
                username: response.data.username,
                password: response.data.password
            };
            return true;
        }
        return false;
    })) passed++;

    // 5. Test de validar código
    total++;
    if (await test('Validar código de activación', async () => {
        if (!testUser) {
            throw new Error('Usuario test requerido');
        }

        const response = await makeRequest(
            `${CONFIG.API_BASE}/api/validate-code`,
            'POST',
            {
                codigoActivacion: testUser.code,
                email: testUser.email
            }
        );
        
        return response.statusCode === 200 && response.data.success;
    })) passed++;

    // 6. Test de login del usuario
    total++;
    if (await test('Login usuario multi-tenant', async () => {
        if (!testUser) {
            throw new Error('Usuario test requerido');
        }

        const response = await makeRequest(
            `${CONFIG.API_BASE}/api/login`,
            'POST',
            {
                username: testUser.username,
                password: testUser.password
            }
        );
        
        if (response.statusCode === 200 && response.data.success && response.data.tenantId) {
            console.log(`\n   📋 Usuario: ${testUser.username}`);
            console.log(`   🏢 Tenant: ${response.data.tenantId}`);
            console.log(`   🔑 Token: ${response.data.token?.substring(0, 20)}...`);
            return true;
        }
        return false;
    })) passed++;

    // 7. Test de funcionalidad Mundo Electrónico
    total++;
    if (await test('Mundo Electrónico mantiene funcionalidad', async () => {
        const response = await makeRequest(CONFIG.MUNDO_ELECTRONICO);
        
        if (response.statusCode === 200 && response.rawBody) {
            const html = response.rawBody;
            const hasLogin = html.includes('login') || html.includes('Usuario');
            const hasBranding = html.includes('Mundo') || html.includes('Electrónico');
            return hasLogin && hasBranding;
        }
        return false;
    })) passed++;

    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN');
    console.log('='.repeat(50));
    console.log(`✅ Pasados: ${passed}`);
    console.log(`❌ Fallidos: ${total - passed}`);
    console.log(`📝 Total: ${total}`);
    
    if (passed === total) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
        console.log('✅ Sistema multi-tenant funcionando correctamente');
        console.log('✅ Mundo Electrónico convertido exitosamente');
        console.log('✅ Flujo completo: Admin → Generar usuario → Login multi-tenant');
    } else {
        console.log(`\n⚠️  ${total - passed} test(s) fallaron`);
    }
    
    return passed === total;
}

if (require.main === module) {
    main().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('💥 Error:', error.message);
        process.exit(1);
    });
}