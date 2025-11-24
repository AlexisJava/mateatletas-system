#!/bin/bash

# Script para verificar el estado de un pago en Railway
# Uso: ./scripts/verificar-pago.sh

INSCRIPCION_ID="cmic7o7b60002n001ophc5lxe"

echo "🔍 Verificando estado del pago..."
echo "📋 Inscripción ID: $INSCRIPCION_ID"
echo ""

echo "📊 Consultando logs de Railway para webhooks de MercadoPago..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway logs --tail 100 2>&1 | grep -E "webhook|payment|pago|approved|rejected" | tail -20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Cómo verificar el pago:"
echo ""
echo "1️⃣  En MercadoPago Dashboard:"
echo "   https://www.mercadopago.com.ar/activities"
echo ""
echo "2️⃣  Ver logs en tiempo real:"
echo "   railway logs"
echo ""
echo "3️⃣  Cuando veas un webhook exitoso, busca:"
echo "   - 'Webhook recibido'"
echo "   - 'Payment status: approved'"
echo "   - 'Inscripción actualizada'"
echo ""
echo "📝 Para hacer el pago de prueba:"
echo "   URL: https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=2903097924-20a62448-ee83-4bca-b711-44598ad4fc44"
echo ""
echo "💳 Tarjeta de prueba (aprobada):"
echo "   Número: 5031 7557 3453 0604"
echo "   CVV: 123"
echo "   Vencimiento: 11/25"
echo "   Nombre: APRO (o cualquier nombre)"
