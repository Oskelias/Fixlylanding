# Guía de Despliegue - Fixly Taller

## 🚀 Opciones de Despliegue

### 1. Hosting Estático (Recomendado)

#### Netlify
1. Ir a [netlify.com](https://netlify.com)
2. Arrastrar la carpeta del proyecto
3. Configurar dominio personalizado (opcional)
4. ✅ Despliegue automático

#### Vercel
1. Instalar Vercel CLI: `npm i -g vercel`
2. En la carpeta del proyecto: `vercel`
3. Seguir configuración interactiva
4. ✅ Deploy con dominio automático

#### GitHub Pages
1. Subir código a repositorio GitHub
2. Ir a Settings > Pages
3. Seleccionar source branch
4. ✅ Disponible en username.github.io/repo

### 2. Servidor Web Tradicional

#### Apache
```apache
<VirtualHost *:80>
    DocumentRoot /var/www/fixly_taller_desarrollo_completo
    ServerName fixlytaller.local

    <Directory /var/www/fixly_taller_desarrollo_completo>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Nginx
```nginx
server {
    listen 80;
    server_name fixlytaller.local;
    root /var/www/fixly_taller_desarrollo_completo;

    location / {
        try_files $uri $uri/ /fixly_taller_FINAL.html;
    }

    # Optimización de archivos estáticos
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Desarrollo Local

#### Python HTTP Server
```bash
cd fixly_taller_desarrollo_completo
python -m http.server 8000
# Acceder en: http://localhost:8000
```

#### Node.js con serve
```bash
npm install -g serve
cd fixly_taller_desarrollo_completo
serve -p 8000
# Acceder en: http://localhost:8000
```

#### PHP Built-in Server
```bash
cd fixly_taller_desarrollo_completo
php -S localhost:8000
# Acceder en: http://localhost:8000
```

## ⚙️ Configuración Previa al Despliegue

### 1. Verificar Enlaces CDN
- ✅ Tailwind CSS CDN activo
- ✅ Font Awesome 6 CDN funcional  
- ✅ Google Fonts disponibles

### 2. Optimizaciones Recomendadas
```html
<!-- Agregar al <head> para mejor performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
```

### 3. Variables de Entorno (si aplicable)
```bash
# .env (para proyectos dinámicos)
SITE_URL=https://fixlytaller.com
CONTACT_EMAIL=contacto@fixlytaller.com
WHATSAPP_NUMBER=+56912345678
```

## 🔧 Personalización Post-Despliegue

### Cambiar Información de Contacto
1. Editar `recursos/json/fixly_config.json`
2. Actualizar números de teléfono y emails
3. Modificar enlaces de WhatsApp en HTML

### Actualizar Precios
1. Modificar `recursos/json/fixly_config.json`
2. Ajustar valores en HTML principal
3. Sincronizar con sistema de pagos (si aplicable)

### Analytics y Tracking
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

## 📊 Monitoreo y Mantenimiento

### Herramientas de Monitoreo
- **Google PageSpeed Insights**: Análisis de performance
- **GTmetrix**: Métricas de carga detalladas
- **Google Search Console**: SEO y indexación
- **Uptime Robot**: Monitoreo de disponibilidad

### Mantenimiento Periódico
- [ ] Verificar enlaces CDN (mensual)
- [ ] Actualizar información de contacto (según necesidad)
- [ ] Revisar compatibilidad de navegadores (trimestral)
- [ ] Backup de archivos (semanal)
- [ ] Análisis de métricas (mensual)

## 🛡️ Seguridad

### Headers de Seguridad Recomendados
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### SSL/HTTPS
- Usar Let's Encrypt para certificados gratuitos
- Configurar redirección HTTP → HTTPS
- Verificar certificado con SSL Labs

---

**¿Necesitas ayuda con el despliegue?**
📧 Contacto: contacto@fixlytaller.com
