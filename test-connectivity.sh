#!/bin/bash

# Script de testing de conectividad Frontend ↔ Backend
# Mateatletas System

echo "🧪 TESTING CONECTIVIDAD FRONTEND-BACKEND"
echo "========================================"
echo ""

# URLs
BACKEND_URL="https://mateatletas-system-production.up.railway.app/api"
FRONTEND_URL="https://mateatletas-fybnyracj-alexis-figueroas-projects-d4fb75f1.vercel.app"

echo "📍 URLs Configuradas:"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo ""

# Test 1: Backend está vivo
echo "🔍 Test 1: Backend Health Check"
echo "   GET $BACKEND_URL"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend respondiendo: $BACKEND_STATUS OK"
else
    echo "   ❌ Backend error: $BACKEND_STATUS"
fi
echo ""

# Test 2: CORS - Verificar headers
echo "🔍 Test 2: CORS Headers"
echo "   Verificando Access-Control-Allow-Origin"
CORS_HEADER=$(curl -s -I -H "Origin: $FRONTEND_URL" "$BACKEND_URL/auth/profile" | grep -i "access-control-allow-origin" || echo "No CORS header")
echo "   $CORS_HEADER"
if [[ "$CORS_HEADER" == *"$FRONTEND_URL"* ]] || [[ "$CORS_HEADER" == *"*"* ]]; then
    echo "   ✅ CORS configurado correctamente"
else
    echo "   ⚠️  CORS puede estar bloqueando requests desde frontend"
fi
echo ""

# Test 3: Endpoint público (sin auth)
echo "🔍 Test 3: Endpoint Público"
echo "   GET $BACKEND_URL (root)"
ROOT_RESPONSE=$(curl -s $BACKEND_URL)
if [[ "$ROOT_RESPONSE" == *"Hello World"* ]]; then
    echo "   ✅ Endpoint público respondiendo"
else
    echo "   ⚠️  Respuesta inesperada: $ROOT_RESPONSE"
fi
echo ""

# Test 4: Endpoint protegido (debe retornar 401)
echo "🔍 Test 4: Endpoint Protegido (Auth)"
echo "   GET $BACKEND_URL/auth/profile"
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/auth/profile")
if [ "$AUTH_STATUS" = "401" ]; then
    echo "   ✅ Autenticación funcionando: 401 Unauthorized (esperado)"
else
    echo "   ❌ Error inesperado: $AUTH_STATUS"
fi
echo ""

# Test 5: Frontend está vivo
echo "🔍 Test 5: Frontend Health Check"
echo "   GET $FRONTEND_URL"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "401" ]; then
    echo "   ✅ Frontend respondiendo: $FRONTEND_STATUS"
else
    echo "   ❌ Frontend error: $FRONTEND_STATUS"
fi
echo ""

# Test 6: Verificar configuración de API en frontend (simulado)
echo "🔍 Test 6: Configuración de API en Frontend"
echo "   Debe tener: NEXT_PUBLIC_API_URL"
echo "   ⚠️  No se puede verificar desde aquí (se verifica en browser)"
echo ""

# Test 7: Test de latencia
echo "🔍 Test 7: Latencia Backend"
LATENCY=$(curl -s -o /dev/null -w "%{time_total}" $BACKEND_URL)
echo "   Tiempo de respuesta: ${LATENCY}s"
if (( $(echo "$LATENCY < 1" | bc -l) )); then
    echo "   ✅ Latencia aceptable"
else
    echo "   ⚠️  Latencia alta"
fi
echo ""

# Resumen
echo "📊 RESUMEN"
echo "=========="
echo "Backend Status:  $BACKEND_STATUS"
echo "Frontend Status: $FRONTEND_STATUS"
echo "Auth Status:     $AUTH_STATUS"
echo "Latency:         ${LATENCY}s"
echo ""
echo "✅ = Funcionando correctamente"
echo "⚠️  = Verificar configuración"
echo "❌ = Error crítico"
