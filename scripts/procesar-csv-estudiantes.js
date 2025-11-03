const fs = require('fs');
const path = require('path');

// Leer el CSV
const csvPath = process.argv[2] || 'Horarios y estudiantes - Mateatletas® Club STEAM - DB.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const lines = csvContent.split('\n');
const estudiantes = [];

let grupoActual = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Parsear CSV simple (dividir por ,,)
  const campos = line.split(',,').map(c => c.trim());

  const rol = campos[0] || '';
  const nombreCompleto = campos[1] || '';
  const profesor = campos[2] || '';
  const dia = campos[3] || '';
  const horario = campos[4] || '';
  const grupo = campos[5] || '';
  const perfil = campos[6] || '';
  const tutor = campos[7] || '';

  // Detectar líneas de encabezado de grupo
  if (rol.includes('GRUPO') || rol.includes('CURSO') || rol.includes('Matemáticas Presencial') || rol.includes('Programación Presencial') || rol.includes('Curso')) {
    grupoActual = {
      nombre: rol,
      codigo: grupo || 'N/A',
      perfil: perfil || 'N/A'
    };
    continue;
  }

  // Solo procesar estudiantes
  if (rol === 'Estudiante' && nombreCompleto) {
    // Separar nombre y apellido
    const partes = nombreCompleto.trim().split(' ');
    let nombre, apellido;

    if (partes.length === 2) {
      nombre = partes[0];
      apellido = partes[1];
    } else if (partes.length === 3) {
      nombre = partes[0] + ' ' + partes[1];
      apellido = partes[2];
    } else if (partes.length > 3) {
      // Asumir que el último es apellido
      apellido = partes[partes.length - 1];
      nombre = partes.slice(0, -1).join(' ');
    } else {
      nombre = nombreCompleto;
      apellido = '';
    }

    // Buscar si el estudiante ya existe
    let estudiante = estudiantes.find(e =>
      e.nombre === nombre && e.apellido === apellido
    );

    if (!estudiante) {
      estudiante = {
        nombre: nombre,
        apellido: apellido,
        grupos: []
      };
      estudiantes.push(estudiante);
    }

    // Agregar el grupo
    if (grupo && dia && horario && profesor) {
      estudiante.grupos.push({
        nombre: grupoActual ? grupoActual.nombre : grupo,
        codigo: grupo,
        dia: dia,
        horario: horario,
        profesor: profesor,
        perfil: perfil
      });
    }
  }
}

// Ordenar estudiantes por apellido y nombre
estudiantes.sort((a, b) => {
  if (a.apellido < b.apellido) return -1;
  if (a.apellido > b.apellido) return 1;
  if (a.nombre < b.nombre) return -1;
  if (a.nombre > b.nombre) return 1;
  return 0;
});

// Guardar JSON
const outputPath = path.join(__dirname, 'estudiantes-completo.json');
fs.writeFileSync(outputPath, JSON.stringify(estudiantes, null, 2), 'utf-8');

console.log(`✅ JSON generado: ${outputPath}`);
console.log(`📊 Total estudiantes: ${estudiantes.length}`);
console.log(`📊 Total inscripciones: ${estudiantes.reduce((sum, e) => sum + e.grupos.length, 0)}`);

// Mostrar resumen por grupo
const resumenGrupos = {};
estudiantes.forEach(est => {
  est.grupos.forEach(g => {
    if (!resumenGrupos[g.codigo]) {
      resumenGrupos[g.codigo] = 0;
    }
    resumenGrupos[g.codigo]++;
  });
});

console.log('\n📋 Resumen por grupo:');
Object.entries(resumenGrupos)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([codigo, count]) => {
    console.log(`  ${codigo}: ${count} estudiantes`);
  });
