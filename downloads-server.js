const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8081;
const DOWNLOADS_DIR = '/home/user/webapp/downloads';

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(DOWNLOADS_DIR, pathname);
    
    // Security check
    if (!filePath.startsWith(DOWNLOADS_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        // Set content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.gz': 'application/gzip',
            '.tar': 'application/x-tar',
            '.txt': 'text/plain'
        };
        
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        res.setHeader('Content-Type', contentType);
        
        // For downloads, set appropriate headers
        if (ext === '.gz' || ext === '.tar') {
            res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
        }
        
        res.writeHead(200);
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor de descargas funcionando en puerto ${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${DOWNLOADS_DIR}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor de descargas...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});