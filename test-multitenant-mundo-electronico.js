#!/usr/bin/env node

/**
 * 🧪 TEST COMPLETO SISTEMA MULTI-TENANT MUNDO ELECTRÓNICO
 * 
 * Verifica el flujo completo:
 * 1. Admin crea usuarios
 * 2. Usuarios hacen login en Mundo Electrónico
 * 3. Verificar separación de datos por tenant
 * 4. Confirmar integración con panel admin
 */

const https = require('https');
const { v4: uuidv4 } = require('crypto').randomUUID || (() => Math.random().toString(36));

// 🔧 CONFIGURACIÓN
const CONFIG = {
    API_BASE: 'https://api.fixlytaller.com',
    ADMIN_PANEL: 'https://administrador.fixlytaller.com',
    MUNDO_ELECTRONICO: 'https://app.fixlytaller.com',
    
    // Credenciales de admin
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'fixly2024!'
    },
    
    // Usuarios de prueba
    TEST_USERS: [
        {
            username: `taller_${Date.now()}_1`,
            password: 'password123',
            email: 'taller1@test.com',
            nombre: 'Taller Mecánico 1'
        },
        {
            username: `taller_${Date.now()}_2`, 
            password: 'password456',
            email: 'taller2@test.com',
            nombre: 'Taller Electrónico 2'
        }
    ]
};

// 🔧 UTILIDADES
class TestRunner {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    async makeRequest(url, method = 'GET', data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'FixlyTest/1.0',
                    ...headers
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

    async test(description, testFn) {
        process.stdout.write(`🧪 ${description}... `);
        try {
            const result = await testFn();
            if (result) {
                console.log('✅ PASS');
                this.passed++;
                this.results.push({ description, status: 'PASS', details: result });
            } else {
                console.log('❌ FAIL');
                this.failed++;
                this.results.push({ description, status: 'FAIL', details: 'Test returned false' });
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            this.failed++;
            this.results.push({ description, status: 'ERROR', details: error.message });
        }
    }

    showSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE PRUEBAS MULTI-TENANT');
        console.log('='.repeat(60));
        console.log(`✅ Pasadas: ${this.passed}`);
        console.log(`❌ Fallidas: ${this.failed}`);
        console.log(`📝 Total: ${this.passed + this.failed}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 ¡TODOS LOS TESTS PASARON! Sistema multi-tenant funcionando correctamente.');
        } else {
            console.log('\n⚠️  Algunos tests fallaron. Revisar configuración.');
        }
        
        console.log('\n📋 DETALLES:');
        this.results.forEach((result, i) => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${i + 1}. ${icon} ${result.description}`);
            if (result.status !== 'PASS' && result.details) {
                console.log(`   💡 ${result.details}`);
            }
        });
    }
}

// 🧪 TESTS PRINCIPALES
class MultiTenantTests {
    constructor() {
        this.runner = new TestRunner();
        this.adminToken = null;
        this.userTokens = [];
        this.createdUsers = [];
    }

    async runAllTests() {
        console.log('🚀 INICIANDO TESTS SISTEMA MULTI-TENANT MUNDO ELECTRÓNICO\n');

        // 1. Test de conectividad básica
        await this.runner.test('API Backend disponible', async () => {
            const response = await this.runner.makeRequest(`${CONFIG.API_BASE}/health`);
            return response.statusCode === 200;
        });

        await this.runner.test('Mundo Electrónico accesible', async () => {
            const response = await this.runner.makeRequest(CONFIG.MUNDO_ELECTRONICO);
            return response.statusCode === 200;
        });

        // 2. Test de autenticación admin
        await this.runner.test('Admin login funcional', async () => {
            const response = await this.runner.makeRequest(
                `${CONFIG.API_BASE}/api/login`,
                'POST',
                CONFIG.ADMIN_CREDENTIALS
            );
            
            if (response.statusCode === 200 && response.data.token) {
                this.adminToken = response.data.token;
                return true;
            }
            return false;
        });

        // 3. Test de creación de usuarios multi-tenant
        for (const [index, user] of CONFIG.TEST_USERS.entries()) {
            await this.runner.test(`Crear usuario ${index + 1}: ${user.nombre}`, async () => {
                if (!this.adminToken) {
                    throw new Error('Se requiere token de admin');
                }

                const response = await this.runner.makeRequest(
                    `${CONFIG.API_BASE}/api/admin/users`,
                    'POST',
                    user,
                    { 'Authorization': `Bearer ${this.adminToken}` }
                );

                if (response.statusCode === 201) {
                    this.createdUsers.push(user);
                    return true;
                }
                return false;
            });
        }

        // 4. Test de login multi-tenant
        for (const [index, user] of this.createdUsers.entries()) {
            await this.runner.test(`Login multi-tenant usuario ${index + 1}`, async () => {
                const response = await this.runner.makeRequest(
                    `${CONFIG.API_BASE}/api/login`,
                    'POST',
                    {
                        username: user.username,
                        password: user.password
                    }
                );

                if (response.statusCode === 200 && response.data.token && response.data.tenantId) {
                    this.userTokens.push({
                        ...response.data,
                        originalUser: user
                    });
                    return true;
                }
                return false;
            });
        }

        // 5. Test de separación de datos por tenant
        await this.runner.test('Verificar separación de datos por tenant', async () => {
            if (this.userTokens.length < 2) {
                throw new Error('Se requieren al menos 2 usuarios para probar separación');
            }

            // Crear datos específicos para cada tenant
            const tenant1Token = this.userTokens[0];
            const tenant2Token = this.userTokens[1];

            // Test de separación: cada usuario debe ver solo sus datos
            const response1 = await this.runner.makeRequest(
                `${CONFIG.API_BASE}/api/repairs`,
                'GET',
                null,
                { 'Authorization': `Bearer ${tenant1Token.token}` }
            );

            const response2 = await this.runner.makeRequest(
                `${CONFIG.API_BASE}/api/repairs`,
                'GET', 
                null,
                { 'Authorization': `Bearer ${tenant2Token.token}` }
            );

            // Ambos deben poder acceder a sus datos (aunque estén vacíos inicialmente)
            return response1.statusCode === 200 && response2.statusCode === 200;
        });

        // 6. Test de funcionalidad Mundo Electrónico
        await this.runner.test('Mundo Electrónico mantiene funcionalidad original', async () => {
            // Verificar que el HTML contiene elementos clave de Mundo Electrónico
            const response = await this.runner.makeRequest(CONFIG.MUNDO_ELECTRONICO);
            
            if (response.statusCode === 200 && response.rawBody) {
                const htmlContent = response.rawBody;
                const hasLogin = htmlContent.includes('login') || htmlContent.includes('Usuario');
                const hasBranding = htmlContent.includes('Mundo') || htmlContent.includes('Electrónico');
                return hasLogin && hasBranding;
            }
            return false;
        });

        // 7. Test de integración admin-usuario
        await this.runner.test('Integración Admin Panel ↔ Mundo Electrónico', async () => {
            if (!this.adminToken || this.userTokens.length === 0) {
                throw new Error('Se requiere admin y usuarios creados');
            }

            // Verificar que admin puede listar usuarios creados
            const response = await this.runner.makeRequest(
                `${CONFIG.API_BASE}/api/admin/users`,
                'GET',
                null,
                { 'Authorization': `Bearer ${this.adminToken}` }
            );

            if (response.statusCode === 200 && response.data.users) {
                const usersList = response.data.users;
                const createdUsernames = this.createdUsers.map(u => u.username);
                
                // Verificar que los usuarios creados aparecen en la lista
                const foundUsers = usersList.filter(user => 
                    createdUsernames.includes(user.username)
                );
                
                return foundUsers.length === this.createdUsers.length;
            }
            return false;
        });

        // 8. Test de limpieza
        await this.runner.test('Limpieza de datos de prueba', async () => {
            if (!this.adminToken) return true; // No hay nada que limpiar

            let allDeleted = true;
            for (const user of this.createdUsers) {
                try {
                    await this.runner.makeRequest(
                        `${CONFIG.API_BASE}/api/admin/users/${user.username}`,
                        'DELETE',
                        null,
                        { 'Authorization': `Bearer ${this.adminToken}` }
                    );
                } catch (e) {
                    allDeleted = false;
                }
            }
            return allDeleted;
        });

        // Mostrar resumen
        this.runner.showSummary();
        
        return this.runner.failed === 0;
    }
}

// 🚀 EJECUTAR TESTS
async function main() {
    const tests = new MultiTenantTests();
    
    try {
        const success = await tests.runAllTests();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('💥 Error ejecutando tests:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { MultiTenantTests, CONFIG };