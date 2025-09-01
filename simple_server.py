#!/usr/bin/env python3
import http.server
import socketserver
import sys
import os

# Cambiar al directorio del script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stdout.write(f"{self.log_date_time_string()} - {format%args}\n")
        sys.stdout.flush()

if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"Server running on port {PORT}")
        sys.stdout.flush()
        httpd.serve_forever()