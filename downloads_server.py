#!/usr/bin/env python3

import http.server
import socketserver
import os
import sys

# Cambiar al directorio downloads
os.chdir('/home/user/webapp/downloads')

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

class CustomHandler(Handler):
    def log_message(self, format, *args):
        sys.stdout.write(f"{self.log_date_time_string()} - {format%args}\n")
        sys.stdout.flush()
    
    def end_headers(self):
        # Agregar headers CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
        print(f"🌐 Servidor de descarga iniciado en puerto {PORT}")
        print(f"📁 Sirviendo archivos desde: {os.getcwd()}")
        sys.stdout.flush()
        httpd.serve_forever()