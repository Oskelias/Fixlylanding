# 🚀 Fixly Taller - Guía de Despliegue Final

## ✅ COMPLETADO:
- [x] **PASO 1**: Worker Backend desplegado en `api.fixlytaller.com`
- [ ] **PASO 2**: Nueva consola admin desplegada
- [ ] **PASO 3**: Configurar webhook MercadoPago
- [ ] **PASO 4**: Pruebas finales
- [ ] **PASO 5**: ¡LANZAMIENTO! 🎉

---

## 📋 PASO 2: Desplegar Admin Console

### Opción A: Manual (RECOMENDADO - 5 minutos)
1. Ve a: https://dash.cloudflare.com/pages
2. "Create a project" → "Upload assets"  
3. **Project name**: `fixly-admin-console`
4. Sube: `admin-console-enterprise.html` como `index.html`
5. **Custom domain**: `admin.fixlytaller.com`

### Opción B: Línea de comandos
```bash
# Necesita permisos adicionales en el token
npx wrangler pages deploy admin-pages --project-name=fixly-admin
```

---

## 📋 PASO 3: Webhook MercadoPago

### Configuración en MercadoPago:
1. Ve a: https://www.mercadopago.com.ar/developers/panel/webhooks
2. **URL**: `https://api.fixlytaller.com/webhook/mercadopago`
3. **Eventos**: `payment.created`, `payment.updated`

### Test del webhook:
```bash
curl -X POST https://api.fixlytaller.com/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","action":"payment.updated","data":{"id":"123"}}'
```

---

## 🔧 URLs del Sistema:

- **App Principal**: https://app.fixlytaller.com/
- **API Backend**: https://api.fixlytaller.com/
- **Admin Console**: https://admin.fixlytaller.com/ (próximamente)
- **Landing**: https://fixlytaller.com/

---

## 🎯 Credenciales Admin:
- **Usuario**: `admin`
- **Password**: [Tu password de admin]

## 💰 Planes Configurados:
- **Starter**: Gratis 15 días
- **Pro**: $14.999/mes 
- **Enterprise**: A medida

---

## 🚨 DESPUÉS DEL DESPLIEGUE:

1. **Verificar login admin** en nueva consola
2. **Crear usuario de prueba**
3. **Probar webhook MercadoPago**
4. **¡Sistema listo para producción!**