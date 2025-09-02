# 🔧 PASO 1: Deploy Backend MercadoPago

## 📂 **Archivo a Deployar**
- **Archivo:** `worker-v5.1.0-mercadopago-complete.js`
- **Ubicación:** Ya copiado en `functions/_middleware.js`
- **Status:** ✅ Listo para deployment

## 🚀 **Método de Deployment**

### **Opción A: Cloudflare Dashboard (RECOMENDADO)**

1. **Ve a Cloudflare Dashboard**
   - Entra a: https://dash.cloudflare.com
   - Selecciona tu cuenta
   - Ve a "Workers & Pages"

2. **Selecciona tu Worker**
   - Busca el worker "fixlytaller" 
   - O el worker que estés usando para la API

3. **Actualiza el Código**
   - Click en "Edit Code"
   - **REEMPLAZA TODO** el contenido actual con el contenido de `worker-v5.1.0-mercadopago-complete.js`
   - Click en "Save and Deploy"

### **Opción B: Usando Git (Cloudflare Pages)**

Si tu proyecto está conectado a GitHub:

1. **Merge el Pull Request**
   - Ve a: https://github.com/Oskelias/Fixlylanding/compare/main...multitenant-mundo-electronico
   - Haz merge del PR a main
   - Cloudflare Pages hará deploy automático

2. **Verificar Deploy**
   - Ve a Cloudflare Pages dashboard
   - Verifica que el deploy se complete exitosamente

## 🔑 **Variables de Entorno Requeridas**

Configura estas variables en Cloudflare Workers:

```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-your-test-token  # Para testing
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
```

**Para configurar variables:**
1. Ve a tu Worker en Cloudflare Dashboard
2. Tab "Settings" → "Variables"
3. Agrega las variables como "Environment Variables"

## ✅ **Verificación del Deploy**

Una vez deployado, verifica que funciona:

```bash
# Test básico del endpoint
curl https://api.fixlytaller.com/api/admin/payments \
  -H "X-Admin-Key: fixly-admin-2024-secure-key"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "payments": [],
  "statistics": {
    "totalTransactions": 0,
    "approvedPayments": 0,
    "totalRevenue": 0,
    "pendingPayments": 0
  }
}
```

## 🔍 **Troubleshooting**

### **Error 1: "Worker not found"**
- Verifica que el dominio api.fixlytaller.com esté configurado
- Asegúrate que el worker esté publicado

### **Error 2: "CORS Error"**
- El nuevo worker ya incluye CORS para consola.fixlytaller.com
- Verifica que estés usando el dominio correcto

### **Error 3: "Variables not found"**
- Configura las variables de entorno en Cloudflare
- Reinicia el worker después de agregar variables

## 📊 **Nuevos Endpoints Disponibles**

Después del deploy, estos endpoints estarán activos:

- `GET /api/admin/payments` - Lista de pagos
- `GET /api/admin/payment/{id}` - Detalles de pago
- `POST /api/admin/payment/process` - Procesar pago manual
- `GET /api/admin/reports/financial` - Reportes financieros
- `POST /webhook/mercadopago` - Webhook MercadoPago

---

## 🎯 **Resultado Esperado**

✅ Backend deployado con módulo MercadoPago completo
✅ Todos los endpoints de pagos funcionando
✅ Webhook listo para recibir notificaciones
✅ Admin API respondiendo correctamente

**Next:** Una vez completado este paso, procederemos con el deploy del frontend.