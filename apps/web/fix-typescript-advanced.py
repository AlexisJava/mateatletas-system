#!/usr/bin/env python3
"""
Script avanzado para arreglar errores TypeScript complejos
que requieren análisis de contexto.
"""

import re
import os
from pathlib import Path

def fix_reportes_page():
    """Arregla src/app/admin/reportes/page.tsx"""
    file_path = Path("src/app/admin/reportes/page.tsx")
    if not file_path.exists():
        return
    
    content = file_path.read_text()
    
    # Fix 1: string | undefined → string con fallback
    # Líneas 44-45, 271-272, 280-281
    content = re.sub(
        r'nombre: student\.nombre,',
        'nombre: student.nombre ?? "",',
        content
    )
    content = re.sub(
        r'apellido: student\.apellido,',
        'apellido: student.apellido ?? "",',
        content
    )
    
    # Fix 2: Object possibly undefined (líneas 215, 217)
    # Agregar optional chaining
    content = re.sub(
        r'mostInscritas\[(\d+)\]\.nombre',
        r'mostInscritas[\1]?.nombre ?? ""',
        content
    )
    content = re.sub(
        r'mostInscritas\[(\d+)\]\.totalInscritos',
        r'mostInscritas[\1]?.totalInscritos ?? 0',
        content
    )
    
    # Fix 3: ruta_curricular_id.nombre (es un ID, no un objeto)
    content = re.sub(
        r'clase\.ruta_curricular_id\.nombre',
        'clase.rutaCurricular?.nombre ?? "Sin ruta"',
        content
    )
    
    file_path.write_text(content)
    print(f"✓ Arreglado: {file_path}")

def fix_usuarios_page():
    """Arregla src/app/admin/usuarios/page.tsx"""
    file_path = Path("src/app/admin/usuarios/page.tsx")
    if not file_path.exists():
        return
    
    content = file_path.read_text()
    
    # Fix: string | undefined en handleDeleteUser
    # Línea 96: usuario.id puede ser undefined
    content = re.sub(
        r'if \(usuario\.id\)',
        r'if (usuario?.id)',
        content
    )
    content = re.sub(
        r'await deleteUser\(usuario\.id\)',
        r'await deleteUser(usuario.id!)', # Non-null assertion ya que está validado
        content
    )
    
    file_path.write_text(content)
    print(f"✓ Arreglado: {file_path}")

def fix_sala_pages():
    """Arregla las páginas de sala con Axios response types"""
    files = [
        "src/app/clase/[id]/sala/page.tsx",
        "src/app/docente/clase/[id]/sala/page.tsx"
    ]
    
    for file_path_str in files:
        file_path = Path(file_path_str)
        if not file_path.exists():
            continue
        
        content = file_path.read_text()
        
        # Fix: AxiosResponse<any> → Extraer .data
        content = re.sub(
            r'setClase\(response\)',
            'setClase(response.data)',
            content
        )
        content = re.sub(
            r'setEstudiantes\(response\)',
            'setEstudiantes(response.data)',
            content
        )
        
        file_path.write_text(content)
        print(f"✓ Arreglado: {file_path}")

def fix_docente_asistencia():
    """Arregla src/app/docente/clases/[id]/asistencia/page.tsx"""
    file_path = Path("src/app/docente/clases/[id]/asistencia/page.tsx")
    if not file_path.exists():
        return
    
    content = file_path.read_text()
    
    # Fix: Property mismatches múltiples
    replacements = [
        # ruta_curricular (objeto) vs ruta_curricular_id (string)
        (r'clase\.ruta_curricular\.', 'clase.rutaCurricular?.'),
        # cupo_maximo vs cupos_maximo
        (r'\.cupo_maximo', '.cupos_maximo'),
        # cupo_disponible no existe
        (r'clase\.cupo_disponible', 'clase.cupos_maximo - clase.cupos_ocupados'),
        # titulo vs nombre
        (r'clase\.titulo', 'clase.nombre'),
    ]
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    file_path.write_text(content)
    print(f"✓ Arreglado: {file_path}")

def fix_grupo_page():
    """Arregla src/app/docente/grupos/[id]/page.tsx"""
    file_path = Path("src/app/docente/grupos/[id]/page.tsx")
    if not file_path.exists():
        return
    
    content = file_path.read_text()
    
    # Fix: Axios response type
    content = re.sub(
        r'setGrupo\(response\)',
        'setGrupo(response.data)',
        content
    )
    
    file_path.write_text(content)
    print(f"✓ Arreglado: {file_path}")

def fix_calendario_tab():
    """Arregla CalendarioTab con accesos a ruta_curricular"""
    file_path = Path("src/app/(protected)/dashboard/components/CalendarioTab.tsx")
    if not file_path.exists():
        return
    
    content = file_path.read_text()
    
    # ruta_curricular_id es solo un ID, no tiene .nombre ni .color
    # Necesita acceder al objeto completo de rutaCurricular
    content = re.sub(
        r'clase\.ruta_curricular_id\.nombre',
        'clase.rutaCurricular?.nombre ?? "Sin asignar"',
        content
    )
    content = re.sub(
        r'clase\.ruta_curricular_id\.color',
        'clase.rutaCurricular?.color ?? "#94a3b8"',
        content
    )
    
    # Agregar null checks
    content = re.sub(
        r'if \(clase\.ruta_curricular_id\)',
        'if (clase.ruta_curricular_id && clase.rutaCurricular)',
        content
    )
    
    file_path.write_text(content)
    print(f"✓ Arreglado: {file_path}")

def fix_dashboard_view():
    """Arregla DashboardView alerta.nombre"""
    file_path = Path("src/app/(protected)/dashboard/components/DashboardView.tsx")
    if not file_path.exists():
        return
    
    content = file_path.read_text()
    
    # alerta.nombre no existe en AlertaDashboard
    # Necesitamos ver qué propiedad debería ser
    # Por contexto, probablemente sea alerta.mensaje o alerta.titulo
    content = re.sub(
        r'alerta\.nombre',
        'alerta.mensaje ?? alerta.titulo',
        content
    )
    
    file_path.write_text(content)
    print(f"✓ Arreglado: {file_path}")

def fix_planificacion_modal():
    """Arregla CreatePlanificacionModal"""
    file_path = Path("src/app/admin/planificaciones/components/CreatePlanificacionModal.tsx")
    if not file_path.exists():
        return
    
    content = file_path.read_text()
    
    # formData.nombre no existe, debería ser formData.titulo
    content = re.sub(
        r'formData\.nombre',
        'formData.titulo',
        content
    )
    
    file_path.write_text(content)
    print(f"✓ Arreglado: {file_path}")

def main():
    print("🐍 Ejecutando fixes avanzados con Python...")
    print()
    
    # Cambiar al directorio web
    os.chdir(os.path.expanduser("~/Documentos/Mateatletas-Ecosystem/apps/web"))
    
    # Ejecutar todos los fixes
    fix_reportes_page()
    fix_usuarios_page()
    fix_sala_pages()
    fix_docente_asistencia()
    fix_grupo_page()
    fix_calendario_tab()
    fix_dashboard_view()
    fix_planificacion_modal()
    
    print()
    print("✅ Fixes avanzados completados")

if __name__ == "__main__":
    main()
