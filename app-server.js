const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class FixlyAuthServer {
    constructor(port = 8080) {
        this.port = port;
        this.mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
        
        this.routes = {
            '/': 'app-index.html',
            '/login': 'app-login.html',
            '/dashboard': 'app-dashboard.html',
            '/admin': 'app-dashboard.html',
            '/taller': 'taller-login.html',
            '/taller-login': 'taller-login.html',
            '/taller-sistema': 'taller-sistema.html',
            '/sistema': 'taller-sistema.html',
            '/debug-email': 'email-debug-test.html'
        };
    }

    start() {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(this.port, '0.0.0.0', () => {
            console.log(`🚀 Fixly Complete System running on http://0.0.0.0:${this.port}`);
            console.log(`📱 URLs disponibles:`);
            console.log(`   🏠 Inicio: http://localhost:${this.port}/`);
            console.log(`   🔐 Admin: http://localhost:${this.port}/admin`);
            console.log(`   🔧 Taller: http://localhost:${this.port}/taller`);
            console.log(`🔐 Credenciales Admin:`);
            console.log(`   - admin / admin123`);
            console.log(`   - fixly-admin / admin2024`);
            console.log(`🛠️ Credenciales Taller: Usar las generadas por API`);
            console.log(`📡 API Backend: https://api.fixlytaller.com`);
        });

        return server;
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        // Handle root and specific routes
        if (this.routes[pathname]) {
            this.serveFile(this.routes[pathname], res);
            return;
        }

        // Handle static files
        let filePath = path.join(__dirname, pathname);
        
        // Security check - prevent directory traversal
        if (!filePath.startsWith(__dirname)) {
            this.send404(res);
            return;
        }

        // Check if file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                this.send404(res);
                return;
            }

            this.serveFile(filePath, res);
        });
    }

    serveFile(filePath, res) {
        // If filePath doesn't include full path, assume it's in current directory
        if (!path.isAbsolute(filePath)) {
            filePath = path.join(__dirname, filePath);
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.send500(res, err);
                return;
            }

            const ext = path.extname(filePath);
            const mimeType = this.mimeTypes[ext] || 'application/octet-stream';

            res.writeHead(200, { 
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(data);
        });
    }

    send404(res) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Página no encontrada</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #e74c3c; }
                    .home-link { color: #3498db; text-decoration: none; }
                </style>
            </head>
            <body>
                <h1 class="error">404 - Página no encontrada</h1>
                <p>La página que buscas no existe.</p>
                <a href="/" class="home-link">← Volver al inicio</a>
            </body>
            </html>
        `);
    }

    send500(res, error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>500 - Error interno del servidor</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #e74c3c; }
                </style>
            </head>
            <body>
                <h1 class="error">500 - Error interno del servidor</h1>
                <p>Ocurrió un error al procesar tu solicitud.</p>
                <pre>${error.message}</pre>
            </body>
            </html>
        `);
    }
}

// Start the server
if (require.main === module) {
    const server = new FixlyAuthServer(8080);
    server.start();
}

module.exports = FixlyAuthServer;