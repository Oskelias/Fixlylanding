# 🔧 PASO 1: Desplegar Worker Backend

## 📂 Archivo a Usar
**`worker-v4.3.1-fixly-planes.js`** - 37,284 caracteres

## 🎯 Instrucciones de Despliegue

### **A. Acceder a Cloudflare Dashboard**
1. Ve a: https://dash.cloudflare.com
2. Navega a: **Workers & Pages**
3. Busca tu worker existente (ej: `fixly-backend`)
4. Haz click en **"Edit Code"** o **"Quick Edit"**

### **B. Reemplazar Código Completo**
1. **SELECCIONAR TODO** el código existente (Ctrl+A)
2. **BORRAR TODO** (Delete)
3. **COPIAR** todo el contenido de `worker-v4.3.1-fixly-planes.js`
4. **PEGAR** en el editor de Cloudflare (Ctrl+V)

### **C. Guardar y Desplegar**
1. Haz click en **"Save and Deploy"**
2. Espera la confirmación: "Deployment successful"
3. Anota la URL de tu worker: `https://tu-worker.workers.dev`

## ✅ Verificación de Despliegue

### **Probar Health Endpoint:**
```bash
# Abrir en navegador:
https://tu-worker.workers.dev/health

# Debe mostrar:
{
  "status": "OK",
  "version": "4.3.1",
  "features": ["user_management", "mercadopago_webhook", "plan_system"],
  "plans": ["starter", "pro", "enterprise", "trial"]
}
```

### **Si ves version: "4.3.1" = ✅ ÉXITO**

## 🚨 Problemas Comunes

### **Error: "Script too large"**
- El archivo es grande, pero debe caber
- Si hay error, usar el worker-v4.3.0-admin-complete.js (más pequeño)

### **Error: "Syntax error"**
- Asegurar que copiaste TODO el archivo completo
- Verificar que no quedaron caracteres raros al pegar

### **Error: "Environment variables"**
- No te preocupes por ahora
- El worker debe funcionar sin variables adicionales

## 🎯 Resultado Esperado
- ✅ Worker desplegado correctamente
- ✅ Health endpoint respondiendo con v4.3.1  
- ✅ Todos los endpoints de admin disponibles
- ✅ Webhook MercadoPago configurado para $14.999

## 📞 ¿Algún Problema?
- Copia el mensaje de error exacto
- Verifica que la URL del worker esté correcta
- Prueba con un navegador diferente

---

**🚀 Una vez completado este paso, continuamos con PASO 2: Admin Console**