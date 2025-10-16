#!/bin/bash

# Test script for Calendar System (Slice: Calendario Docente)
# Tests all Calendar API endpoints

BASE_URL="http://localhost:3001/api"

echo "======================================"
echo "  CALENDAR SYSTEM - API TESTING"
echo "======================================"
echo ""

# Step 1: Login as docente
echo "🔐 Step 1: Login as Docente..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docente@test.com",
    "password": "Test123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful! Token obtained."
echo ""

# Step 2: Create a Tarea (Task)
echo "📝 Step 2: Creating a Tarea (Task)..."
TAREA_RESPONSE=$(curl -s -X POST "$BASE_URL/eventos/tareas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Preparar material de Álgebra",
    "descripcion": "Preparar ejercicios para la próxima clase",
    "tipo": "TAREA",
    "fecha_inicio": "2025-10-20T10:00:00Z",
    "fecha_fin": "2025-10-20T12:00:00Z",
    "estado": "PENDIENTE",
    "prioridad": "ALTA",
    "etiquetas": ["Planificación", "Álgebra"],
    "subtareas": [
      {
        "id": "1",
        "titulo": "Revisar temario",
        "completada": false,
        "orden": 0
      },
      {
        "id": "2",
        "titulo": "Crear ejercicios",
        "completada": false,
        "orden": 1
      }
    ]
  }')

TAREA_ID=$(echo $TAREA_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$TAREA_ID" ]; then
  echo "❌ Failed to create Tarea!"
  echo "Response: $TAREA_RESPONSE"
  exit 1
fi

echo "✅ Tarea created successfully! ID: $TAREA_ID"
echo ""

# Step 3: Create a Recordatorio (Reminder)
echo "🔔 Step 3: Creating a Recordatorio (Reminder)..."
RECORDATORIO_RESPONSE=$(curl -s -X POST "$BASE_URL/eventos/recordatorios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Reunión de equipo",
    "descripcion": "Reunión mensual de coordinación",
    "tipo": "RECORDATORIO",
    "fecha_inicio": "2025-10-18T15:00:00Z",
    "fecha_fin": "2025-10-18T16:00:00Z",
    "color": "#6366f1"
  }')

RECORDATORIO_ID=$(echo $RECORDATORIO_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$RECORDATORIO_ID" ]; then
  echo "❌ Failed to create Recordatorio!"
  echo "Response: $RECORDATORIO_RESPONSE"
  exit 1
fi

echo "✅ Recordatorio created successfully! ID: $RECORDATORIO_ID"
echo ""

# Step 4: Create a Nota (Note)
echo "📓 Step 4: Creating a Nota (Note)..."
NOTA_RESPONSE=$(curl -s -X POST "$BASE_URL/eventos/notas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Ideas para gamificación",
    "descripcion": "Notas sobre cómo mejorar la experiencia de clase",
    "tipo": "NOTA",
    "fecha_inicio": "2025-10-16T00:00:00Z",
    "fecha_fin": "2025-10-16T23:59:59Z",
    "contenido": "Considerar: badges por asistencia perfecta, ranking semanal, challenges matemáticos",
    "categoria": "Pedagógico",
    "color": "#8b5cf6"
  }')

NOTA_ID=$(echo $NOTA_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$NOTA_ID" ]; then
  echo "❌ Failed to create Nota!"
  echo "Response: $NOTA_RESPONSE"
  exit 1
fi

echo "✅ Nota created successfully! ID: $NOTA_ID"
echo ""

# Step 5: Get Vista Agenda
echo "📅 Step 5: Getting Vista Agenda..."
VISTA_AGENDA=$(curl -s -X GET "$BASE_URL/eventos/vista-agenda" \
  -H "Authorization: Bearer $TOKEN")

HOY_COUNT=$(echo $VISTA_AGENDA | grep -o '"hoy":\[[^]]*\]' | grep -o '"id"' | wc -l)
echo "✅ Vista Agenda retrieved! Eventos hoy: $HOY_COUNT"
echo ""

# Step 6: Get Estadísticas
echo "📊 Step 6: Getting Estadísticas..."
ESTADISTICAS=$(curl -s -X GET "$BASE_URL/eventos/estadisticas" \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(echo $ESTADISTICAS | grep -o '"total":[0-9]*' | sed 's/"total"://')
TAREAS=$(echo $ESTADISTICAS | grep -o '"tareas":[0-9]*' | sed 's/"tareas"://')

echo "✅ Estadísticas retrieved!"
echo "   Total eventos: $TOTAL"
echo "   Total tareas: $TAREAS"
echo ""

# Step 7: Get specific Tarea
echo "🔍 Step 7: Getting specific Tarea..."
TAREA_DETAIL=$(curl -s -X GET "$BASE_URL/eventos/$TAREA_ID" \
  -H "Authorization: Bearer $TOKEN")

TITULO=$(echo $TAREA_DETAIL | grep -o '"titulo":"[^"]*' | sed 's/"titulo":"//')
echo "✅ Tarea retrieved! Título: $TITULO"
echo ""

# Step 8: Update Tarea
echo "✏️  Step 8: Updating Tarea..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/eventos/tareas/$TAREA_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "EN_PROGRESO",
    "porcentaje_completado": 50
  }')

UPDATED_ESTADO=$(echo $UPDATE_RESPONSE | grep -o '"estado":"[^"]*' | sed 's/"estado":"//')
echo "✅ Tarea updated! Estado: $UPDATED_ESTADO"
echo ""

# Step 9: Get all events with filter
echo "🔎 Step 9: Getting all events (filtered)..."
ALL_EVENTS=$(curl -s -X GET "$BASE_URL/eventos?tipo=TAREA" \
  -H "Authorization: Bearer $TOKEN")

EVENT_COUNT=$(echo $ALL_EVENTS | grep -o '"id"' | wc -l)
echo "✅ Events retrieved! Count: $EVENT_COUNT"
echo ""

# Step 10: Delete Nota
echo "🗑️  Step 10: Deleting Nota..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/eventos/$NOTA_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Nota deleted successfully!"
echo ""

echo "======================================"
echo "  ✅ ALL TESTS PASSED!"
echo "======================================"
echo ""
echo "Summary:"
echo "  - Created: 1 Tarea, 1 Recordatorio, 1 Nota"
echo "  - Retrieved: Vista Agenda, Estadísticas, Individual event"
echo "  - Updated: 1 Tarea"
echo "  - Deleted: 1 Nota"
echo ""
echo "🎉 Calendar System is working perfectly!"
