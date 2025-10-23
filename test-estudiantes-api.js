/**
 * Script de prueba manual para los endpoints de estudiantes
 */

const { PrismaClient } = require('./apps/api/dist/node_modules/@prisma/client');
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🔍 Obteniendo sector de prueba...');
    const sector = await prisma.sector.findFirst({
      where: { nombre: 'Matemática' }
    });

    if (!sector) {
      console.error('❌ No se encontró el sector Matemática. Ejecuta npm run db:seed primero.');
      return;
    }

    console.log(`✅ Sector encontrado: ${sector.nombre} (${sector.id})\n`);

    // TEST 1: Crear estudiante con tutor
    console.log('📝 TEST 1: Crear un estudiante con tutor nuevo');
    const crearEstudiantePayload = {
      estudiantes: [
        {
          nombre: 'Juan',
          apellido: 'Pérez',
          edad: 10,
          nivel_escolar: '5to grado',
          email: 'juan.perez@test.com'
        }
      ],
      tutor: {
        nombre: 'María',
        apellido: 'Pérez',
        email: 'maria.perez@test.com',
        telefono: '+5491112345678'
      },
      sectorId: sector.id
    };

    console.log('Request:', JSON.stringify(crearEstudiantePayload, null, 2));

    try {
      const response1 = await axios.post(`${API_URL}/estudiantes/crear-con-tutor`, crearEstudiantePayload);
      console.log('\n✅ TEST 1 PASÓ');
      console.log('Response:',  JSON.stringify(response1.data, null, 2));

      const estudianteCreado = response1.data.estudiantes[0];
      const credenciales = response1.data.credenciales;

      console.log('\n🔑 Credenciales generadas:');
      console.log('Tutor:', credenciales.tutor);
      console.log('Estudiante:', credenciales.estudiantes[0]);

      // TEST 2: Obtener clases disponibles
      console.log('\n\n📝 TEST 2: Obtener clases disponibles para el estudiante');

      const response2 = await axios.get(`${API_URL}/estudiantes/${estudianteCreado.id}/clases-disponibles`);
      console.log('✅ TEST 2 PASÓ');
      console.log(`Clases disponibles: ${response2.data.length}`);
      if (response2.data.length > 0) {
        console.log('Primera clase:', JSON.stringify(response2.data[0], null, 2));
      }

      // TEST 3: Asignar clases (si hay disponibles)
      if (response2.data.length > 0) {
        console.log('\n\n📝 TEST 3: Asignar clases al estudiante');
        const clasesDisponibles = response2.data;
        const asignarClasesPayload = {
          clasesIds: [clasesDisponibles[0].id]
        };

        const response3 = await axios.post(
          `${API_URL}/estudiantes/${estudianteCreado.id}/asignar-clases`,
          asignarClasesPayload
        );
        console.log('✅ TEST 3 PASÓ');
        console.log('Inscripciones creadas:', JSON.stringify(response3.data, null, 2));
      } else {
        console.log('\n⚠️  TEST 3 OMITIDO: No hay clases disponibles');
      }

      // TEST 4: Copiar estudiante a otro sector
      const sectorProgramacion = await prisma.sector.findFirst({
        where: { nombre: 'Programación' }
      });

      if (sectorProgramacion) {
        console.log('\n\n📝 TEST 4: Copiar estudiante a sector Programación');
        const response4 = await axios.patch(
          `${API_URL}/estudiantes/${estudianteCreado.id}/copiar-a-sector`,
          { sectorId: sectorProgramacion.id }
        );
        console.log('✅ TEST 4 PASÓ');
        console.log('Estudiante copiado:', JSON.stringify({
          id: response4.data.id,
          nombre: response4.data.nombre,
          sector_anterior: sector.nombre,
          sector_nuevo: sectorProgramacion.nombre
        }, null, 2));
      } else {
        console.log('\n⚠️  TEST 4 OMITIDO: No existe sector Programación');
      }

      console.log('\n\n🎉 TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');

    } catch (error) {
      if (error.response) {
        console.error('\n❌ Error en la petición:');
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('\n❌ Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
