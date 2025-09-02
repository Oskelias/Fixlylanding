# 🔗 PASO 3: Configuración Webhook MercadoPago

## 🎯 **Objetivo**
Configurar el webhook para que MercadoPago notifique automáticamente sobre pagos a tu sistema.

## 🔧 **Configuración en MercadoPago Dashboard**

### **1. Acceso al Dashboard**
1. **Ve a MercadoPago Developers**
   - URL: https://www.mercadopago.com.ar/developers
   - Inicia sesión con tu cuenta MercadoPago

2. **Selecciona tu aplicación**
   - Ve a "Tus integraciones"
   - Selecciona tu aplicación existente (o crea una nueva)

### **2. Configurar Webhook**

1. **Ve a la sección Webhooks**
   - En el menú lateral: "Webhooks"
   - Click en "Configurar webhooks" o "Agregar webhook"

2. **Configuración del Webhook**
   ```
   URL del webhook: https://api.fixlytaller.com/webhook/mercadopago
   Eventos a notificar:
   ✅ payment (Pagos)
   ✅ merchant_order (Órdenes)
   ```

3. **Eventos específicos**
   - ✅ `payment.created` - Pago creado
   - ✅ `payment.updated` - Pago actualizado (IMPORTANTE)
   - ✅ `payment.cancelled` - Pago cancelado

### **3. Obtener Credenciales**

Anota estas credenciales (las necesitarás):

```bash
# Credenciales de producción
PUBLIC_KEY=APP_USR-xxxxxxxx
ACCESS_TOKEN=APP_USR-xxxxxxxx

# Credenciales de testing (para pruebas)  
PUBLIC_KEY_TEST=TEST-xxxxxxxx
ACCESS_TOKEN_TEST=TEST-xxxxxxxx
```

## ⚙️ **Configuración en Cloudflare Workers**

### **Agregar Variables de Entorno**

1. **Ve a tu Worker en Cloudflare**
   - Dashboard → Workers & Pages
   - Selecciona tu worker

2. **Agrega Variables**
   - Tab "Settings" → "Variables"
   - Agrega estas variables:

```bash
# Para PRODUCCIÓN
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-produccion
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret

# Para TESTING  
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-testing
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret-testing
```

## 🧪 **Testing del Webhook**

### **1. Test Manual**

```bash
# Test básico del endpoint webhook
curl -X POST https://api.fixlytaller.com/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test123",
    "type": "payment", 
    "action": "payment.updated",
    "data": {
      "id": "test_payment_123"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "processed": true
}
```

### **2. Test desde MercadoPago**

1. **Ve a tu webhook en MercadoPago dashboard**
2. **Click en "Probar webhook"**
3. **Envía un evento de prueba**
4. **Verifica que llegue a tu endpoint**

### **3. Verificar en Admin Console**

1. **Ve a `consola.fixlytaller.com`**
2. **Sección "Pagos MercadoPago"**  
3. **Debería mostrar el webhook de prueba recibido**

## 🔄 **Flujo Completo de Pago**

Una vez configurado, este será el flujo:

```
1. Usuario hace pago en MercadoPago
     ↓
2. MercadoPago procesa el pago
     ↓  
3. MercadoPago envía webhook a tu API
     ↓
4. Tu backend procesa el webhook
     ↓
5. Si pago aprobado → Usuario activado automáticamente
     ↓
6. Email de confirmación enviado
     ↓
7. Pago aparece en admin dashboard
```

## 🔍 **Troubleshooting**

### **Error: "Webhook URL no responde"**
- Verifica que `api.fixlytaller.com` esté accesible
- Checa que el worker esté deployado correctamente
- Prueba el endpoint manualmente con curl

### **Error: "Invalid signature"**
- Verifica el MERCADOPAGO_WEBHOOK_SECRET
- Asegúrate que coincida con MercadoPago
- Revisa que no haya espacios extra en la variable

### **Error: "Payment not found"**
- Verifica el ACCESS_TOKEN de MercadoPago
- Checa que tengas permisos para leer pagos
- Asegúrate de usar el token correcto (test vs prod)

## 📊 **Monitoreo del Webhook**

### **En Admin Console**
- Ve a "Pagos MercadoPago"
- Sección "Estado Webhook MercadoPago"
- Verás logs de webhooks recibidos

### **En Cloudflare**
- Ve a tu Worker → "Logs"
- Filtra por "/webhook/mercadopago"
- Verás todos los webhooks procesados

## 🔐 **Seguridad**

El webhook implementa:
- ✅ **Verificación de firma** MercadoPago
- ✅ **Rate limiting** para prevenir spam
- ✅ **Validación de estructura** de datos
- ✅ **Logging completo** para auditoría

---

## 🎯 **Resultado Esperado**

✅ Webhook configurado en MercadoPago dashboard
✅ URL apuntando a `api.fixlytaller.com/webhook/mercadopago`
✅ Variables de entorno configuradas en Cloudflare
✅ Webhook responde correctamente a tests
✅ Pagos se procesan automáticamente
✅ Admin console muestra webhooks recibidos

**Next:** Haremos testing completo de la integración end-to-end.