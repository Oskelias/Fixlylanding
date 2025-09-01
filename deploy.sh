#!/bin/bash

# 🚀 FIXLY TALLER - AUTO DEPLOYMENT SCRIPT
# Requiere: CLOUDFLARE_API_TOKEN configurado

echo "🚀 Fixly Taller - Deployment Script"
echo "=================================="

# Verificar que el token esté configurado
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ ERROR: CLOUDFLARE_API_TOKEN no está configurado"
    echo "💡 Configúralo con: export CLOUDFLARE_API_TOKEN='your-token-here'"
    exit 1
fi

echo "✅ Token de Cloudflare configurado"

# Ir al directorio de deployment
cd /home/user/webapp/deploy-production

echo "📦 Archivos preparados:"
echo "   - admin-panel-deploy.tar.gz"
echo "   - app-client-deploy.tar.gz" 

# Deploy Admin Panel
echo ""
echo "🔧 Deploying Admin Panel..."
cd admin
npx wrangler pages deploy . --project-name=admin-fixly-taller

if [ $? -eq 0 ]; then
    echo "✅ Admin Panel deployed successfully!"
    ADMIN_URL=$(npx wrangler pages deployment list --project-name=admin-fixly-taller --format=json | jq -r '.[0].url' 2>/dev/null || echo "Check Cloudflare Dashboard")
    echo "🔗 Admin URL: $ADMIN_URL"
else
    echo "❌ Admin Panel deployment failed"
    exit 1
fi

# Deploy Client App
echo ""
echo "👥 Deploying Client App..."
cd ../app
npx wrangler pages deploy . --project-name=app-fixly-taller

if [ $? -eq 0 ]; then
    echo "✅ Client App deployed successfully!"
    APP_URL=$(npx wrangler pages deployment list --project-name=app-fixly-taller --format=json | jq -r '.[0].url' 2>/dev/null || echo "Check Cloudflare Dashboard")
    echo "🔗 App URL: $APP_URL"
else
    echo "❌ Client App deployment failed"
    exit 1
fi

# Test API Health
echo ""
echo "🩺 Testing API Health..."
API_RESPONSE=$(curl -s https://api.fixlytaller.com/health)

if [ $? -eq 0 ]; then
    echo "✅ API is healthy: $API_RESPONSE"
else
    echo "⚠️  API health check failed"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================"
echo ""
echo "📋 URLs del Sistema:"
echo "   🔧 Admin Panel: https://admin.fixlytaller.com"
echo "   👥 Client App:  https://app.fixlytaller.com" 
echo "   🔌 API Backend: https://api.fixlytaller.com"
echo ""
echo "🔐 Credenciales Admin:"
echo "   Usuario: admin"
echo "   Password: fixly2024!"
echo ""
echo "✅ Next Steps:"
echo "1. Configurar dominios personalizados en Cloudflare Pages"
echo "2. Probar flujo completo: Admin → Create User → User Login"
echo "3. Verificar separación de datos por tenantId"
echo ""