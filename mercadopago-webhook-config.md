# 💳 MercadoPago Webhook Configuration

## 🎯 PASO 3: Configurar Webhook de MercadoPago

### 1. Acceder al Panel de Desarrolladores
- URL: https://www.mercadopago.com.ar/developers/panel/webhooks
- Inicia sesión con tu cuenta de MercadoPago

### 2. Crear Nuevo Webhook
- **URL del Webhook**: `https://api.fixlytaller.com/webhook/mercadopago`
- **Eventos a escuchar**:
  - ✅ `payment.created`
  - ✅ `payment.updated` 
  - ✅ `payment.approved`

### 3. Configuración del Webhook

```
Nombre: Fixly Taller Payments
URL: https://api.fixlytaller.com/webhook/mercadopago
Eventos: payment.created, payment.updated, payment.approved
Método: POST
```

### 4. Verificar Configuración

El webhook está configurado para:
- ✅ Detectar pagos de $14.999 (plan Pro)
- ✅ Activar automáticamente usuarios
- ✅ Enviar email de confirmación
- ✅ Extender suscripción por 30 días

### 5. Test del Webhook (Opcional)

```bash
curl -X POST https://api.fixlytaller.com/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.updated", 
    "data": {
      "id": "123456789"
    }
  }'
```

---

## 🔧 Flujo de Pago Completo:

1. **Cliente paga** $14.999 por MercadoPago
2. **MercadoPago envía webhook** → `api.fixlytaller.com`
3. **Sistema verifica pago** y obtiene detalles
4. **Sistema identifica usuario** por email/referencia
5. **Sistema activa/extiende** suscripción automáticamente
6. **Sistema envía email** de confirmación
7. **Usuario accede** inmediatamente al sistema

---

## ⚠️ IMPORTANTE:

- El webhook debe estar **activo** antes de procesar pagos
- Verificar que la URL `api.fixlytaller.com` esté accesible
- El sistema detecta automáticamente pagos de $14.999
- Los usuarios se identifican por email en la transacción