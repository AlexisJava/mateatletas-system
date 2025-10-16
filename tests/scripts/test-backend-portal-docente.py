#!/usr/bin/env python3
"""
TEST INTEGRAL DEL BACKEND - PORTAL DOCENTE
Testea TODOS los módulos y endpoints disponibles para docentes
Version corregida con URLs profesionales y precisas
"""

import requests
import json
import sys
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3001/api"

# Colores
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
CYAN = '\033[0;36m'
NC = '\033[0m'

passed = 0
failed = 0
results = []

def test(name, func):
    global passed, failed
    try:
        result = func()
        if result['success']:
            passed += 1
            print(f"{GREEN}✓{NC} {name}")
            if 'details' in result and result['details']:
                print(f"  └─ {result['details']}")
            results.append({'name': name, 'status': 'PASS', 'details': result.get('details', '')})
        else:
            failed += 1
            print(f"{RED}✗{NC} {name}")
            print(f"  └─ {result['error']}")
            results.append({'name': name, 'status': 'FAIL', 'error': result['error']})
    except Exception as e:
        failed += 1
        print(f"{RED}✗{NC} {name}")
        print(f"  └─ Exception: {str(e)}")
        results.append({'name': name, 'status': 'FAIL', 'error': str(e)})

print(f"{BLUE}{'='*60}{NC}")
print(f"{BLUE}  TEST INTEGRAL BACKEND - PORTAL DOCENTE{NC}")
print(f"{BLUE}{'='*60}{NC}\n")

# =========================================
# MÓDULO 1: AUTENTICACIÓN
# =========================================
print(f"{CYAN}═══ MÓDULO 1: AUTENTICACIÓN ══════════════════════════════{NC}\n")

def test_login():
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "docente@test.com",
        "password": "Test123!"
    })
    if r.status_code == 200:
        data = r.json()
        if 'access_token' in data and 'user' in data:
            global TOKEN, USER_ID, DOCENTE_ID
            TOKEN = data['access_token']
            USER_ID = data['user']['id']
            DOCENTE_ID = data['user']['id']  # Para docentes, user.id == docente.id
            return {'success': True, 'details': f"Token obtenido | User ID: {USER_ID}"}
        return {'success': False, 'error': 'Respuesta sin access_token o user'}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("Login con docente@test.com", test_login)

if failed > 0:
    print(f"\n{RED}No se pudo autenticar. Abortando tests.{NC}")
    sys.exit(1)

HEADERS = {'Authorization': f'Bearer {TOKEN}'}
print()

# =========================================
# MÓDULO 2: PERFIL DOCENTE
# =========================================
print(f"{CYAN}═══ MÓDULO 2: PERFIL DOCENTE ═════════════════════════════{NC}\n")

def test_get_profile():
    r = requests.get(f"{BASE_URL}/docentes/me", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Nombre: {data.get('nombre', 'N/A')} {data.get('apellido', 'N/A')}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_update_profile():
    r = requests.patch(f"{BASE_URL}/docentes/me", headers=HEADERS, json={
        "bio": "Bio actualizada en test automatizado"
    })
    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("GET /docentes/me", test_get_profile)
test("PATCH /docentes/me", test_update_profile)
print()

# =========================================
# MÓDULO 3: ESTUDIANTES
# =========================================
print(f"{CYAN}═══ MÓDULO 3: ESTUDIANTES ════════════════════════════════{NC}\n")

def test_get_estudiantes():
    r = requests.get(f"{BASE_URL}/estudiantes", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        if len(data) > 0:
            global ESTUDIANTE_ID
            ESTUDIANTE_ID = data[0]['id']
        return {'success': True, 'details': f"Total estudiantes: {len(data)}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_get_estudiante_detail():
    if 'ESTUDIANTE_ID' not in globals():
        return {'success': False, 'error': 'No hay estudiantes para testear'}

    r = requests.get(f"{BASE_URL}/estudiantes/{ESTUDIANTE_ID}", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Estudiante: {data.get('nombre', 'N/A')}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("GET /estudiantes", test_get_estudiantes)
test("GET /estudiantes/:id", test_get_estudiante_detail)
print()

# =========================================
# MÓDULO 4: RUTAS CURRICULARES
# =========================================
print(f"{CYAN}═══ MÓDULO 4: RUTAS CURRICULARES ════════════════════════{NC}\n")

def test_get_rutas():
    r = requests.get(f"{BASE_URL}/admin/rutas-curriculares", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        if len(data) > 0:
            global RUTA_ID
            RUTA_ID = data[0]['id']
        return {'success': True, 'details': f"Rutas disponibles: {len(data)}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_get_ruta_detail():
    if 'RUTA_ID' not in globals():
        return {'success': False, 'error': 'No hay rutas para testear'}

    r = requests.get(f"{BASE_URL}/admin/rutas-curriculares/{RUTA_ID}", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Ruta: {data.get('nombre', 'N/A')}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("GET /admin/rutas-curriculares", test_get_rutas)
test("GET /admin/rutas-curriculares/:id", test_get_ruta_detail)
print()

# =========================================
# MÓDULO 5: CLASES
# =========================================
print(f"{CYAN}═══ MÓDULO 5: CLASES ═════════════════════════════════════{NC}\n")

def test_get_mis_clases():
    r = requests.get(f"{BASE_URL}/clases/docente/mis-clases", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Mis clases: {len(data)}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_create_clase():
    if 'RUTA_ID' not in globals():
        return {'success': False, 'error': 'No hay rutas curriculares disponibles'}

    fecha_inicio = (datetime.now() + timedelta(days=2)).isoformat()
    fecha_fin = (datetime.now() + timedelta(days=2, hours=1)).isoformat()

    r = requests.post(f"{BASE_URL}/clases", headers=HEADERS, json={
        "titulo": "Clase de Test Automatizada",
        "descripcion": "Clase creada por test automatizado",
        "ruta_curricular_id": RUTA_ID,
        "docente_id": DOCENTE_ID,
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "cupo_maximo": 10,
        "modalidad": "PRESENCIAL"
    })

    if r.status_code == 201:
        global CLASE_ID
        CLASE_ID = r.json()['id']
        return {'success': True, 'details': f"Clase creada con ID: {CLASE_ID}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:300]}'}

def test_get_clase_detail():
    if 'CLASE_ID' not in globals():
        return {'success': False, 'error': 'No hay CLASE_ID (creación falló)'}

    r = requests.get(f"{BASE_URL}/clases/{CLASE_ID}", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Clase: {data.get('titulo', 'N/A')}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_cancel_clase():
    if 'CLASE_ID' not in globals():
        return {'success': False, 'error': 'No hay CLASE_ID (creación falló)'}

    r = requests.patch(f"{BASE_URL}/clases/{CLASE_ID}/cancelar", headers=HEADERS)

    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("GET /clases/docente/mis-clases", test_get_mis_clases)
test("POST /clases (crear clase)", test_create_clase)
test("GET /clases/:id", test_get_clase_detail)
test("PATCH /clases/:id/cancelar", test_cancel_clase)
print()

# =========================================
# MÓDULO 6: ASISTENCIA
# =========================================
print(f"{CYAN}═══ MÓDULO 6: ASISTENCIA ═════════════════════════════════{NC}\n")

def test_get_asistencia_clase():
    if 'CLASE_ID' not in globals():
        return {'success': False, 'error': 'No hay CLASE_ID (creación falló)'}

    r = requests.get(f"{BASE_URL}/asistencia/clase/{CLASE_ID}", headers=HEADERS)

    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Asistencias: {len(data)}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_registrar_asistencia():
    if 'CLASE_ID' not in globals():
        return {'success': False, 'error': 'No hay CLASE_ID'}

    if 'ESTUDIANTE_ID' not in globals():
        return {'success': False, 'error': 'No hay estudiantes para registrar asistencia'}

    r = requests.post(f"{BASE_URL}/asistencia", headers=HEADERS, json={
        "clase_id": CLASE_ID,
        "estudiante_id": ESTUDIANTE_ID,
        "presente": True,
        "observaciones": "Test automatizado"
    })

    if r.status_code == 201:
        global ASISTENCIA_ID
        ASISTENCIA_ID = r.json()['id']
        return {'success': True, 'details': f"Asistencia registrada ID: {ASISTENCIA_ID}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_update_asistencia():
    if 'ASISTENCIA_ID' not in globals():
        return {'success': False, 'error': 'No hay ASISTENCIA_ID'}

    r = requests.patch(f"{BASE_URL}/asistencia/{ASISTENCIA_ID}", headers=HEADERS, json={
        "observaciones": "Actualizado por test"
    })

    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("GET /asistencia/clase/:id", test_get_asistencia_clase)
test("POST /asistencia (registrar)", test_registrar_asistencia)
test("PATCH /asistencia/:id", test_update_asistencia)
print()

# =========================================
# MÓDULO 7: CALENDARIO/EVENTOS
# =========================================
print(f"{CYAN}═══ MÓDULO 7: CALENDARIO/EVENTOS ════════════════════════{NC}\n")

def test_create_tarea():
    r = requests.post(f"{BASE_URL}/eventos/tareas", headers=HEADERS, json={
        "titulo": "Tarea de Test",
        "tipo": "TAREA",
        "fecha_inicio": "2025-10-20T10:00:00.000Z",
        "fecha_fin": "2025-10-20T12:00:00.000Z",
        "estado": "PENDIENTE",
        "prioridad": "MEDIA"
    })
    if r.status_code == 201:
        global TAREA_ID
        TAREA_ID = r.json()['id']
        return {'success': True, 'details': f"Tarea ID: {TAREA_ID}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_create_recordatorio():
    r = requests.post(f"{BASE_URL}/eventos/recordatorios", headers=HEADERS, json={
        "titulo": "Recordatorio de Test",
        "tipo": "RECORDATORIO",
        "fecha_inicio": "2025-10-21T15:00:00.000Z",
        "fecha_fin": "2025-10-21T15:30:00.000Z",
        "completado": False
    })
    if r.status_code == 201:
        global RECORDATORIO_ID
        RECORDATORIO_ID = r.json()['id']
        return {'success': True, 'details': f"Recordatorio ID: {RECORDATORIO_ID}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_create_nota():
    r = requests.post(f"{BASE_URL}/eventos/notas", headers=HEADERS, json={
        "titulo": "Nota de Test",
        "tipo": "NOTA",
        "fecha_inicio": "2025-10-22T00:00:00.000Z",
        "fecha_fin": "2025-10-22T23:59:59.999Z",
        "contenido": "Contenido de nota de prueba"
    })
    if r.status_code == 201:
        global NOTA_ID
        NOTA_ID = r.json()['id']
        return {'success': True, 'details': f"Nota ID: {NOTA_ID}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_get_eventos():
    r = requests.get(f"{BASE_URL}/eventos", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Total eventos: {len(data)}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_vista_agenda():
    r = requests.get(f"{BASE_URL}/eventos/vista-agenda", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        keys = ['hoy', 'manana', 'proximos7Dias', 'masAdelante']
        missing = [k for k in keys if k not in data]
        if missing:
            return {'success': False, 'error': f'Faltan keys: {missing}'}
        return {'success': True, 'details': f"Hoy: {len(data['hoy'])}, Mañana: {len(data['manana'])}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_vista_semana():
    r = requests.get(f"{BASE_URL}/eventos/vista-semana", headers=HEADERS)
    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_estadisticas():
    r = requests.get(f"{BASE_URL}/eventos/estadisticas", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Keys: {list(data.keys())}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("POST /eventos/tareas", test_create_tarea)
test("POST /eventos/recordatorios", test_create_recordatorio)
test("POST /eventos/notas", test_create_nota)
test("GET /eventos", test_get_eventos)
test("GET /eventos/vista-agenda", test_vista_agenda)
test("GET /eventos/vista-semana", test_vista_semana)
test("GET /eventos/estadisticas", test_estadisticas)
print()

# =========================================
# MÓDULO 8: GAMIFICACIÓN
# =========================================
print(f"{CYAN}═══ MÓDULO 8: GAMIFICACIÓN ═══════════════════════════════{NC}\n")

def test_get_perfil_estudiante_gamificacion():
    if 'ESTUDIANTE_ID' not in globals():
        return {'success': False, 'error': 'No hay estudiantes'}

    r = requests.get(f"{BASE_URL}/gamificacion/perfil/{ESTUDIANTE_ID}", headers=HEADERS)

    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Nivel: {data.get('nivel', 'N/A')}, XP: {data.get('experiencia_total', 'N/A')}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_registrar_experiencia():
    if 'ESTUDIANTE_ID' not in globals():
        return {'success': False, 'error': 'No hay estudiantes'}

    r = requests.post(f"{BASE_URL}/gamificacion/experiencia", headers=HEADERS, json={
        "estudiante_id": ESTUDIANTE_ID,
        "puntos": 50,
        "razon": "Test automatizado",
        "tipo": "CLASE_COMPLETADA"
    })

    if r.status_code == 201:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_get_logros():
    if 'ESTUDIANTE_ID' not in globals():
        return {'success': False, 'error': 'No hay estudiantes'}

    r = requests.get(f"{BASE_URL}/gamificacion/logros/{ESTUDIANTE_ID}", headers=HEADERS)

    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Logros: {len(data)}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

test("GET /gamificacion/perfil/:estudianteId", test_get_perfil_estudiante_gamificacion)
test("POST /gamificacion/experiencia", test_registrar_experiencia)
test("GET /gamificacion/logros/:estudianteId", test_get_logros)
print()

# =========================================
# MÓDULO 9: CATÁLOGO/PRODUCTOS
# =========================================
print(f"{CYAN}═══ MÓDULO 9: CATÁLOGO/PRODUCTOS ════════════════════════{NC}\n")

def test_get_productos():
    r = requests.get(f"{BASE_URL}/productos", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Productos disponibles: {len(data)}"}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_get_producto_detail():
    r = requests.get(f"{BASE_URL}/productos", headers=HEADERS)
    if r.status_code != 200 or len(r.json()) == 0:
        return {'success': False, 'error': 'No hay productos'}

    producto_id = r.json()[0]['id']

    r2 = requests.get(f"{BASE_URL}/productos/{producto_id}", headers=HEADERS)

    if r2.status_code == 200:
        data = r2.json()
        return {'success': True, 'details': f"Producto: {data.get('nombre', 'N/A')}"}
    return {'success': False, 'error': f'HTTP {r2.status_code}: {r2.text[:200]}'}

test("GET /productos", test_get_productos)
test("GET /productos/:id", test_get_producto_detail)
print()

# =========================================
# MÓDULO 10: NOTIFICACIONES
# =========================================
print(f"{CYAN}═══ MÓDULO 10: NOTIFICACIONES ════════════════════════════{NC}\n")

def test_get_notificaciones():
    r = requests.get(f"{BASE_URL}/notificaciones", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        return {'success': True, 'details': f"Notificaciones: {len(data)}"}
    elif r.status_code == 404:
        return {'success': False, 'error': 'Endpoint no existe (404)'}
    return {'success': False, 'error': f'HTTP {r.status_code}: {r.text[:200]}'}

def test_marcar_leida():
    r = requests.get(f"{BASE_URL}/notificaciones", headers=HEADERS)
    if r.status_code != 200:
        return {'success': False, 'error': 'No se pueden obtener notificaciones'}

    data = r.json()
    if len(data) == 0:
        return {'success': False, 'error': 'No hay notificaciones para testear'}

    notif_id = data[0]['id']

    r2 = requests.patch(f"{BASE_URL}/notificaciones/{notif_id}/leida", headers=HEADERS)

    if r2.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r2.status_code}: {r2.text[:200]}'}

test("GET /notificaciones", test_get_notificaciones)
test("PATCH /notificaciones/:id/leida", test_marcar_leida)
print()

# =========================================
# LIMPIEZA: ELIMINAR DATOS DE PRUEBA
# =========================================
print(f"{CYAN}═══ LIMPIEZA DE DATOS DE PRUEBA ══════════════════════════{NC}\n")

def cleanup_tarea():
    if 'TAREA_ID' not in globals():
        return {'success': True, 'details': 'No hay tarea para eliminar'}
    r = requests.delete(f"{BASE_URL}/eventos/{TAREA_ID}", headers=HEADERS)
    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}'}

def cleanup_recordatorio():
    if 'RECORDATORIO_ID' not in globals():
        return {'success': True, 'details': 'No hay recordatorio para eliminar'}
    r = requests.delete(f"{BASE_URL}/eventos/{RECORDATORIO_ID}", headers=HEADERS)
    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}'}

def cleanup_nota():
    if 'NOTA_ID' not in globals():
        return {'success': True, 'details': 'No hay nota para eliminar'}
    r = requests.delete(f"{BASE_URL}/eventos/{NOTA_ID}", headers=HEADERS)
    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}'}

def cleanup_clase():
    if 'CLASE_ID' not in globals():
        return {'success': True, 'details': 'No hay clase para eliminar'}
    r = requests.delete(f"{BASE_URL}/clases/{CLASE_ID}", headers=HEADERS)
    if r.status_code == 200:
        return {'success': True}
    return {'success': False, 'error': f'HTTP {r.status_code}'}

test("Eliminar tarea de prueba", cleanup_tarea)
test("Eliminar recordatorio de prueba", cleanup_recordatorio)
test("Eliminar nota de prueba", cleanup_nota)
test("Eliminar clase de prueba", cleanup_clase)
print()

# =========================================
# RESUMEN FINAL
# =========================================
print(f"{BLUE}{'='*60}{NC}")
print(f"{BLUE}              RESUMEN FINAL{NC}")
print(f"{BLUE}{'='*60}{NC}")
print(f"{GREEN}✓ Tests exitosos: {passed}{NC}")
print(f"{RED}✗ Tests fallidos: {failed}{NC}")
print(f"  Total: {passed + failed}")
percentage = (passed / (passed + failed) * 100) if (passed + failed) > 0 else 0
print(f"  Porcentaje de éxito: {percentage:.1f}%")
print(f"{BLUE}{'='*60}{NC}\n")

if failed > 0:
    print(f"{RED}ENDPOINTS CON PROBLEMAS:{NC}\n")
    for r in results:
        if r['status'] == 'FAIL':
            print(f"  {RED}✗{NC} {r['name']}")
            if 'error' in r:
                error_lines = r['error'].split('\n')
                for line in error_lines[:3]:
                    if line.strip():
                        print(f"    └─ {line[:100]}")
    print()
else:
    print(f"{GREEN}🎉 TODOS LOS TESTS DEL BACKEND PASARON EXITOSAMENTE{NC}\n")

sys.exit(0 if failed == 0 else 1)
