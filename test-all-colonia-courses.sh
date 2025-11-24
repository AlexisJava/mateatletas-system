#!/bin/bash

# Test de todos los cursos de Colonia de Verano en producción
API_URL="https://mateatletas-system-production.up.railway.app/api/colonia/inscripcion"

echo "================================================"
echo "PROBANDO TODOS LOS CURSOS DE COLONIA DE VERANO"
echo "================================================"
echo ""

# Contador
TOTAL=0
SUCCESS=0
FAILED=0

# Función para testear un curso
test_course() {
    local course_id=$1
    local course_name=$2
    local age=$3
    local area=$4
    local instructor=$5
    local day=$6
    local time=$7
    local color=$8
    local icon=$9

    TOTAL=$((TOTAL + 1))

    echo "[$TOTAL] Probando: $course_name (edad $age)..."

    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"nombre\":\"Test $course_name\",\"email\":\"test.$course_id@example.com\",\"telefono\":\"1122334455\",\"password\":\"TestPassword123\",\"estudiantes\":[{\"nombre\":\"Estudiante Test\",\"edad\":$age,\"cursosSeleccionados\":[{\"id\":\"$course_id\",\"name\":\"$course_name\",\"area\":\"$area\",\"instructor\":\"$instructor\",\"dayOfWeek\":\"$day\",\"timeSlot\":\"$time\",\"color\":\"$color\",\"icon\":\"$icon\"}]}]}")

    if echo "$response" | grep -q "Inscripción creada exitosamente"; then
        mp_url=$(echo "$response" | grep -o '"mercadoPagoUrl":"[^"]*' | cut -d'"' -f4)
        echo "   ✅ ÉXITO - URL MercadoPago generada"
        SUCCESS=$((SUCCESS + 1))
    else
        error=$(echo "$response" | grep -o '"message":\[[^]]*\]' || echo "$response" | grep -o '"error":"[^"]*' || echo "Error desconocido")
        echo "   ❌ FALLÓ - $error"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

echo "=== MATEMÁTICA (6 cursos) ==="
echo ""

test_course "mat-juegos-desafios" "Matemática con Juegos y Desafíos" 8 "Matemática" "Gimena" "Lunes" "10:30-12:00" "#10b981" "🎯"

test_course "mat-proyectos-reales" "Matemática en Acción: Proyectos Reales" 11 "Matemática" "Gimena" "Martes" "10:30-12:00" "#10b981" "🎨"

test_course "mat-superheroes" "Superhéroes de los Números" 7 "Matemática" "Gimena" "Miércoles" "10:30-12:00" "#10b981" "🦸"

test_course "mat-olimpico" "Iniciación a las Olimpiadas de Matemática" 12 "Matemática" "Fabricio" "Jueves" "10:30-12:00" "#10b981" "🏆"

test_course "mat-iniciacion-lunes" "Iniciación de las Matemáticas" 5 "Didáctica de la Matemática" "Ayelen" "Lunes" "15:00-16:00" "#10b981" "🌟"

test_course "mat-dominio-operaciones" "Dominio de las Operaciones" 9 "Matemática" "Fabricio" "Viernes" "10:30-12:00" "#10b981" "➗"

echo "=== PROGRAMACIÓN (4 cursos) ==="
echo ""

test_course "prog-scratch" "Programación con Scratch" 9 "Programación" "Mauro" "Martes" "10:30-12:00" "#f59e0b" "💻"

test_course "prog-robotica" "Robótica con Arduino" 11 "Programación" "Mauro" "Miércoles" "10:30-12:00" "#f59e0b" "🤖"

test_course "prog-roblox" "Creación de Juegos en Roblox" 10 "Programación" "Alexis" "Lunes" "14:30-16:00" "#f59e0b" "🎮"

test_course "prog-godot" "Desarrollo de Videojuegos con Godot Engine" 15 "Programación" "Alexis" "Martes" "14:30-16:00" "#f43f5e" "🕹️"

echo "=== CIENCIAS (2 cursos) ==="
echo ""

test_course "cienc-dinosaurios" "Ciencia con Dinosaurios" 8 "Ciencias" "Valentina" "Miércoles" "10:30-12:00" "#8b5cf6" "🦕"

test_course "cienc-tierra" "Ciencia de la Tierra" 10 "Ciencias" "Valentina" "Jueves" "10:30-12:00" "#8b5cf6" "🌍"

echo "================================================"
echo "RESUMEN DE TESTS"
echo "================================================"
echo "Total de cursos probados: $TOTAL"
echo "✅ Exitosos: $SUCCESS"
echo "❌ Fallidos: $FAILED"
echo "================================================"

if [ $FAILED -eq 0 ]; then
    echo "🎉 ¡TODOS LOS CURSOS FUNCIONAN CORRECTAMENTE!"
    exit 0
else
    echo "⚠️  Algunos cursos tienen problemas"
    exit 1
fi
