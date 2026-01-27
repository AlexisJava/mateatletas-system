import {
  PrismaClient,
  TierNombre,
  EstadoSuscripcionFamiliar,
  EstadoInscripcionActividad,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Suscripciones Familiares 2026 - Edge Cases Completos
 *
 * Crea múltiples tutores con diferentes escenarios:
 *
 * 1. Familia García (3 hijos, todos STEAM_SINCRONICO) - AUTHORIZED
 *    - Prueba descuento 10% en producto más barato
 *
 * 2. Familia López (2 hijos, diferentes tiers) - AUTHORIZED
 *    - Un hijo STEAM_LIBROS, otro STEAM_ASINCRONICO
 *
 * 3. Familia Rodríguez (1 hijo, múltiples actividades) - AUTHORIZED
 *    - Un estudiante inscrito en 3 clubs diferentes
 *
 * 4. Familia Fernández (4 hijos, tier mixto) - PENDING
 *    - Suscripción pendiente de autorización
 *
 * 5. Familia Pérez (2 hijos) - PAUSED
 *    - Suscripción pausada por fallo de pago
 *
 * 6. Familia Torres (1 hijo) - CANCELLED
 *    - Suscripción cancelada
 *
 * Precios Tiers 2026:
 * - STEAM_LIBROS: $40,000
 * - STEAM_ASINCRONICO: $65,000
 * - STEAM_SINCRONICO: $95,000
 *
 * Descuento: 10% en el producto de MENOR valor cuando hay 2+ inscripciones
 */
export async function seedSuscripcionesFamiliares(prisma: PrismaClient) {
  console.log('\n👨‍👩‍👧‍👦 Creando Suscripciones Familiares 2026 (edge cases)...\n');

  // Obtener tiers para precios
  const tiers = await prisma.tier.findMany();
  const tierLibros = tiers.find((t) => t.nombre === TierNombre.STEAM_LIBROS);
  const tierAsincronico = tiers.find(
    (t) => t.nombre === TierNombre.STEAM_ASINCRONICO,
  );
  const tierSincronico = tiers.find(
    (t) => t.nombre === TierNombre.STEAM_SINCRONICO,
  );

  if (!tierLibros || !tierAsincronico || !tierSincronico) {
    console.log('⚠️  Tiers no encontrados. Ejecutar seed de tiers primero.');
    return;
  }

  // Obtener casas
  const casas = await prisma.casa.findMany();
  const casaQuantum = casas.find((c) => c.nombre.toUpperCase() === 'QUANTUM');
  const casaVertex = casas.find((c) => c.nombre.toUpperCase() === 'VERTEX');
  const casaPulsar = casas.find((c) => c.nombre.toUpperCase() === 'PULSAR');

  if (!casaQuantum || !casaVertex || !casaPulsar) {
    console.log('⚠️  Casas no encontradas. Ejecutar seed de casas primero.');
    return;
  }

  // Obtener productos Club para inscripciones
  const clubsQuantum = await prisma.producto.findMany({
    where: { casa: 'QUANTUM', tipo: 'Club', activo: true },
    take: 3,
  });
  const clubsVertex = await prisma.producto.findMany({
    where: { casa: 'VERTEX', tipo: 'Club', activo: true },
    take: 3,
  });
  const clubsPulsar = await prisma.producto.findMany({
    where: { casa: 'PULSAR', tipo: 'Club', activo: true },
    take: 3,
  });

  // Obtener ClaseGrupos para cada club
  const claseGruposMap = new Map<string, string[]>();
  const allClubs = [...clubsQuantum, ...clubsVertex, ...clubsPulsar];
  for (const club of allClubs) {
    const claseGrupos = await prisma.claseGrupo.findMany({
      where: { productoId: club.id, activo: true },
      take: 1,
    });
    if (claseGrupos.length > 0) {
      claseGruposMap.set(
        club.id,
        claseGrupos.map((cg) => cg.id),
      );
    }
  }

  const password = 'Tutor2026!';
  const passwordHash = await bcrypt.hash(password, 10);
  const studentPassword = 'Estudiante2026!';
  const studentPasswordHash = await bcrypt.hash(studentPassword, 10);

  // ============================================================================
  // FAMILIA 1: García - 3 hijos STEAM_SINCRONICO (prueba descuento)
  // ============================================================================
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   👨‍👩‍👧‍👦 FAMILIA GARCÍA (3 hijos, todos STEAM_SINCRONICO)');
  console.log('   ═══════════════════════════════════════════════════════════');

  const tutorGarcia = await prisma.tutor.upsert({
    where: { email: 'maria.garcia@suscripcion.test' },
    update: { passwordHash: passwordHash },
    create: {
      email: 'maria.garcia@suscripcion.test',
      passwordHash: passwordHash,
      nombre: 'María',
      apellido: 'García',
      telefono: '+54911234567',
      dni: '30111222',
      cuil: '27-30111222-3',
    },
  });

  const hijosGarcia = [
    { nombre: 'Sofía', edad: 8, casa: casaQuantum, username: 'sofia.garcia' },
    { nombre: 'Lucas', edad: 11, casa: casaVertex, username: 'lucas.garcia' },
    { nombre: 'Emma', edad: 14, casa: casaPulsar, username: 'emma.garcia' },
  ];

  // Calcular monto: 3 x $95,000 con descuento 10% en el más barato
  // Como todos son iguales ($95k), el descuento se aplica a uno
  const montoGarcia = 95000 * 2 + 95000 * 0.9; // $285,000 - $9,500 = $275,500

  const suscripcionGarcia = await prisma.suscripcionFamiliar.upsert({
    where: { tutorId: tutorGarcia.id },
    update: {
      estado: EstadoSuscripcionFamiliar.AUTHORIZED,
      tier: TierNombre.STEAM_SINCRONICO,
      monto_mensual: Math.round(montoGarcia),
      fecha_proximo_cobro: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    create: {
      tutorId: tutorGarcia.id,
      estado: EstadoSuscripcionFamiliar.AUTHORIZED,
      tier: TierNombre.STEAM_SINCRONICO,
      monto_mensual: Math.round(montoGarcia),
      fecha_proximo_cobro: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      preapproval_id: 'seed-mp-garcia-001',
    },
  });

  for (const [index, hijo] of hijosGarcia.entries()) {
    const estudiante = await prisma.estudiante.upsert({
      where: { email: `${hijo.username}@estudiante.test` },
      update: { tutorId: tutorGarcia.id, casaId: hijo.casa.id },
      create: {
        username: hijo.username,
        nombre: hijo.nombre,
        apellido: 'García',
        edad: hijo.edad,
        nivelEscolar: hijo.edad < 12 ? 'Primaria' : 'Secundaria',
        email: `${hijo.username}@estudiante.test`,
        passwordHash: studentPasswordHash,
        tutorId: tutorGarcia.id,
        casaId: hijo.casa.id,
      },
    });

    // Inscribir en un club de su casa
    const clubs =
      hijo.casa === casaQuantum
        ? clubsQuantum
        : hijo.casa === casaVertex
          ? clubsVertex
          : clubsPulsar;
    const club = clubs[index % clubs.length];
    if (club) {
      const claseGrupoId = claseGruposMap.get(club.id)?.[0];

      await prisma.inscripcionActividad.upsert({
        where: {
          estudianteId_productoId_claseGrupoId: {
            estudianteId: estudiante.id,
            productoId: club.id,
            claseGrupoId: claseGrupoId ?? '',
          },
        },
        update: { estado: EstadoInscripcionActividad.ACTIVA },
        create: {
          suscripcionFamiliarId: suscripcionGarcia.id,
          estudianteId: estudiante.id,
          productoId: club.id,
          claseGrupoId: claseGrupoId,
          tier: TierNombre.STEAM_SINCRONICO,
          estado: EstadoInscripcionActividad.ACTIVA,
        },
      });
    }

    console.log(
      `      ✅ ${hijo.nombre} (${hijo.edad} años) - ${hijo.casa.nombre}`,
    );
  }

  console.log(
    `   💰 Monto mensual: $${Math.round(montoGarcia).toLocaleString()}`,
  );
  console.log(`   📊 Estado: AUTHORIZED`);
  console.log(`   🎯 Descuento aplicado: 10% en 1 inscripción`);
  console.log(
    `   📧 Login tutor: maria.garcia@suscripcion.test / ${password}\n`,
  );

  // ============================================================================
  // FAMILIA 2: López - 2 hijos con diferentes tiers
  // ============================================================================
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   👨‍👩‍👧‍👦 FAMILIA LÓPEZ (2 hijos, diferentes tiers)');
  console.log('   ═══════════════════════════════════════════════════════════');

  const tutorLopez = await prisma.tutor.upsert({
    where: { email: 'carlos.lopez@suscripcion.test' },
    update: { passwordHash: passwordHash },
    create: {
      email: 'carlos.lopez@suscripcion.test',
      passwordHash: passwordHash,
      nombre: 'Carlos',
      apellido: 'López',
      telefono: '+5491198765',
      dni: '31222333',
      cuil: '20-31222333-5',
    },
  });

  const hijosLopez = [
    {
      nombre: 'Martín',
      edad: 9,
      casa: casaQuantum,
      username: 'martin.lopez',
      tier: TierNombre.STEAM_LIBROS,
      precio: 40000,
    },
    {
      nombre: 'Valentina',
      edad: 12,
      casa: casaVertex,
      username: 'valentina.lopez',
      tier: TierNombre.STEAM_ASINCRONICO,
      precio: 65000,
    },
  ];

  // Descuento 10% en el más barato ($40k)
  const montoLopez = 65000 + 40000 * 0.9; // $65,000 + $36,000 = $101,000

  const suscripcionLopez = await prisma.suscripcionFamiliar.upsert({
    where: { tutorId: tutorLopez.id },
    update: {
      estado: EstadoSuscripcionFamiliar.AUTHORIZED,
      tier: TierNombre.STEAM_ASINCRONICO,
      monto_mensual: Math.round(montoLopez),
      fecha_proximo_cobro: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    create: {
      tutorId: tutorLopez.id,
      estado: EstadoSuscripcionFamiliar.AUTHORIZED,
      tier: TierNombre.STEAM_ASINCRONICO,
      monto_mensual: Math.round(montoLopez),
      fecha_proximo_cobro: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      preapproval_id: 'seed-mp-lopez-002',
    },
  });

  for (const hijo of hijosLopez) {
    const estudiante = await prisma.estudiante.upsert({
      where: { email: `${hijo.username}@estudiante.test` },
      update: { tutorId: tutorLopez.id, casaId: hijo.casa.id },
      create: {
        username: hijo.username,
        nombre: hijo.nombre,
        apellido: 'López',
        edad: hijo.edad,
        nivelEscolar: hijo.edad < 12 ? 'Primaria' : 'Secundaria',
        email: `${hijo.username}@estudiante.test`,
        passwordHash: studentPasswordHash,
        tutorId: tutorLopez.id,
        casaId: hijo.casa.id,
      },
    });

    const clubs = hijo.casa === casaQuantum ? clubsQuantum : clubsVertex;
    const club = clubs[0];
    if (club) {
      const claseGrupoId = claseGruposMap.get(club.id)?.[0];

      await prisma.inscripcionActividad.upsert({
        where: {
          estudianteId_productoId_claseGrupoId: {
            estudianteId: estudiante.id,
            productoId: club.id,
            claseGrupoId: claseGrupoId ?? '',
          },
        },
        update: { estado: EstadoInscripcionActividad.ACTIVA, tier: hijo.tier },
        create: {
          suscripcionFamiliarId: suscripcionLopez.id,
          estudianteId: estudiante.id,
          productoId: club.id,
          claseGrupoId: claseGrupoId,
          tier: hijo.tier,
          estado: EstadoInscripcionActividad.ACTIVA,
        },
      });
    }

    console.log(
      `      ✅ ${hijo.nombre} (${hijo.edad} años) - ${hijo.tier} - $${hijo.precio.toLocaleString()}`,
    );
  }

  console.log(
    `   💰 Monto mensual: $${Math.round(montoLopez).toLocaleString()}`,
  );
  console.log(`   📊 Estado: AUTHORIZED`);
  console.log(`   🎯 Descuento: 10% sobre STEAM_LIBROS ($40k → $36k)`);
  console.log(
    `   📧 Login tutor: carlos.lopez@suscripcion.test / ${password}\n`,
  );

  // ============================================================================
  // FAMILIA 3: Rodríguez - 1 hijo con múltiples actividades (3 clubs)
  // ============================================================================
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   👨‍👩‍👧‍👦 FAMILIA RODRÍGUEZ (1 hijo, 3 actividades)');
  console.log('   ═══════════════════════════════════════════════════════════');

  const tutorRodriguez = await prisma.tutor.upsert({
    where: { email: 'ana.rodriguez@suscripcion.test' },
    update: { passwordHash: passwordHash },
    create: {
      email: 'ana.rodriguez@suscripcion.test',
      passwordHash: passwordHash,
      nombre: 'Ana',
      apellido: 'Rodríguez',
      telefono: '+5491155667788',
      dni: '32333444',
      cuil: '27-32333444-7',
    },
  });

  // Mismo estudiante en 3 clubs (STEAM_SINCRONICO x 3)
  // Descuento: 10% en el más barato de los 3 (todos iguales, así que uno)
  const montoRodriguez = 95000 * 2 + 95000 * 0.9; // $275,500

  const suscripcionRodriguez = await prisma.suscripcionFamiliar.upsert({
    where: { tutorId: tutorRodriguez.id },
    update: {
      estado: EstadoSuscripcionFamiliar.AUTHORIZED,
      tier: TierNombre.STEAM_SINCRONICO,
      monto_mensual: Math.round(montoRodriguez),
      fecha_proximo_cobro: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    create: {
      tutorId: tutorRodriguez.id,
      estado: EstadoSuscripcionFamiliar.AUTHORIZED,
      tier: TierNombre.STEAM_SINCRONICO,
      monto_mensual: Math.round(montoRodriguez),
      fecha_proximo_cobro: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      preapproval_id: 'seed-mp-rodriguez-003',
    },
  });

  const estudianteRodriguez = await prisma.estudiante.upsert({
    where: { email: 'nicolas.rodriguez@estudiante.test' },
    update: { tutorId: tutorRodriguez.id, casaId: casaVertex.id },
    create: {
      username: 'nicolas.rodriguez',
      nombre: 'Nicolás',
      apellido: 'Rodríguez',
      edad: 11,
      nivelEscolar: 'Primaria - 6to grado',
      email: 'nicolas.rodriguez@estudiante.test',
      passwordHash: studentPasswordHash,
      tutorId: tutorRodriguez.id,
      casaId: casaVertex.id,
    },
  });

  // Inscribir en 3 clubs de VERTEX
  const clubsNames: string[] = [];
  for (let i = 0; i < Math.min(3, clubsVertex.length); i++) {
    const club = clubsVertex[i];
    if (!club) continue;
    const claseGrupoId = claseGruposMap.get(club.id)?.[0];

    await prisma.inscripcionActividad.upsert({
      where: {
        estudianteId_productoId_claseGrupoId: {
          estudianteId: estudianteRodriguez.id,
          productoId: club.id,
          claseGrupoId: claseGrupoId ?? '',
        },
      },
      update: { estado: EstadoInscripcionActividad.ACTIVA },
      create: {
        suscripcionFamiliarId: suscripcionRodriguez.id,
        estudianteId: estudianteRodriguez.id,
        productoId: club.id,
        claseGrupoId: claseGrupoId,
        tier: TierNombre.STEAM_SINCRONICO,
        estado: EstadoInscripcionActividad.ACTIVA,
      },
    });
    clubsNames.push(club.nombre);
  }

  console.log(`      ✅ Nicolás (11 años) - VERTEX`);
  console.log(`         📚 Clubs inscritos:`);
  clubsNames.forEach((name) => console.log(`            • ${name}`));
  console.log(
    `   💰 Monto mensual: $${Math.round(montoRodriguez).toLocaleString()}`,
  );
  console.log(`   📊 Estado: AUTHORIZED`);
  console.log(`   🎯 Descuento: 10% en 1 actividad (3 actividades total)`);
  console.log(
    `   📧 Login tutor: ana.rodriguez@suscripcion.test / ${password}\n`,
  );

  // ============================================================================
  // FAMILIA 4: Fernández - 4 hijos (PENDING)
  // ============================================================================
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   👨‍👩‍👧‍👦 FAMILIA FERNÁNDEZ (4 hijos, PENDING)');
  console.log('   ═══════════════════════════════════════════════════════════');

  const tutorFernandez = await prisma.tutor.upsert({
    where: { email: 'jorge.fernandez@suscripcion.test' },
    update: { passwordHash: passwordHash },
    create: {
      email: 'jorge.fernandez@suscripcion.test',
      passwordHash: passwordHash,
      nombre: 'Jorge',
      apellido: 'Fernández',
      telefono: '+5491144556677',
      dni: '33444555',
      cuil: '20-33444555-9',
    },
  });

  const hijosFernandez = [
    { nombre: 'Tomás', edad: 7, tier: TierNombre.STEAM_LIBROS, precio: 40000 },
    {
      nombre: 'Lucía',
      edad: 10,
      tier: TierNombre.STEAM_ASINCRONICO,
      precio: 65000,
    },
    {
      nombre: 'Matías',
      edad: 13,
      tier: TierNombre.STEAM_SINCRONICO,
      precio: 95000,
    },
    {
      nombre: 'Camila',
      edad: 15,
      tier: TierNombre.STEAM_SINCRONICO,
      precio: 95000,
    },
  ];

  // Descuento 10% en el más barato ($40k)
  const montoFernandez = 95000 + 95000 + 65000 + 40000 * 0.9; // $291,000

  const suscripcionFernandez = await prisma.suscripcionFamiliar.upsert({
    where: { tutorId: tutorFernandez.id },
    update: {
      estado: EstadoSuscripcionFamiliar.PENDING,
      tier: TierNombre.STEAM_SINCRONICO,
      monto_mensual: Math.round(montoFernandez),
    },
    create: {
      tutorId: tutorFernandez.id,
      estado: EstadoSuscripcionFamiliar.PENDING,
      tier: TierNombre.STEAM_SINCRONICO,
      monto_mensual: Math.round(montoFernandez),
    },
  });

  for (const hijo of hijosFernandez) {
    const casa =
      hijo.edad < 10 ? casaQuantum : hijo.edad < 13 ? casaVertex : casaPulsar;
    const username = `${hijo.nombre.toLowerCase()}.fernandez`;

    const estudiante = await prisma.estudiante.upsert({
      where: { email: `${username}@estudiante.test` },
      update: { tutorId: tutorFernandez.id, casaId: casa.id },
      create: {
        username,
        nombre: hijo.nombre,
        apellido: 'Fernández',
        edad: hijo.edad,
        nivelEscolar: hijo.edad < 12 ? 'Primaria' : 'Secundaria',
        email: `${username}@estudiante.test`,
        passwordHash: studentPasswordHash,
        tutorId: tutorFernandez.id,
        casaId: casa.id,
      },
    });

    const clubs =
      casa === casaQuantum
        ? clubsQuantum
        : casa === casaVertex
          ? clubsVertex
          : clubsPulsar;
    const club = clubs[0];
    if (club) {
      const claseGrupoId = claseGruposMap.get(club.id)?.[0];

      await prisma.inscripcionActividad.upsert({
        where: {
          estudianteId_productoId_claseGrupoId: {
            estudianteId: estudiante.id,
            productoId: club.id,
            claseGrupoId: claseGrupoId ?? '',
          },
        },
        update: { estado: EstadoInscripcionActividad.ACTIVA, tier: hijo.tier },
        create: {
          suscripcionFamiliarId: suscripcionFernandez.id,
          estudianteId: estudiante.id,
          productoId: club.id,
          claseGrupoId: claseGrupoId,
          tier: hijo.tier,
          estado: EstadoInscripcionActividad.ACTIVA,
        },
      });
    }

    console.log(
      `      ✅ ${hijo.nombre} (${hijo.edad} años) - ${hijo.tier} - $${hijo.precio.toLocaleString()}`,
    );
  }

  console.log(
    `   💰 Monto mensual: $${Math.round(montoFernandez).toLocaleString()}`,
  );
  console.log(`   📊 Estado: PENDING (esperando autorización MP)`);
  console.log(`   🎯 Descuento: 10% sobre STEAM_LIBROS ($40k → $36k)`);
  console.log(
    `   📧 Login tutor: jorge.fernandez@suscripcion.test / ${password}\n`,
  );

  // ============================================================================
  // FAMILIA 5: Pérez - 2 hijos (PAUSED por fallo de pago)
  // ============================================================================
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   👨‍👩‍👧‍👦 FAMILIA PÉREZ (2 hijos, PAUSED)');
  console.log('   ═══════════════════════════════════════════════════════════');

  const tutorPerez = await prisma.tutor.upsert({
    where: { email: 'laura.perez@suscripcion.test' },
    update: { passwordHash: passwordHash },
    create: {
      email: 'laura.perez@suscripcion.test',
      passwordHash: passwordHash,
      nombre: 'Laura',
      apellido: 'Pérez',
      telefono: '+5491133445566',
      dni: '34555666',
      cuil: '27-34555666-1',
    },
  });

  const hijosPerez = [
    {
      nombre: 'Diego',
      edad: 8,
      tier: TierNombre.STEAM_ASINCRONICO,
      precio: 65000,
    },
    {
      nombre: 'Mía',
      edad: 10,
      tier: TierNombre.STEAM_ASINCRONICO,
      precio: 65000,
    },
  ];

  // Descuento 10% en uno ($65k * 0.9 = $58.5k)
  const montoPerez = 65000 + 65000 * 0.9; // $123,500

  const suscripcionPerez = await prisma.suscripcionFamiliar.upsert({
    where: { tutorId: tutorPerez.id },
    update: {
      estado: EstadoSuscripcionFamiliar.PAUSED,
      tier: TierNombre.STEAM_ASINCRONICO,
      monto_mensual: Math.round(montoPerez),
      fecha_gracia: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    create: {
      tutorId: tutorPerez.id,
      estado: EstadoSuscripcionFamiliar.PAUSED,
      tier: TierNombre.STEAM_ASINCRONICO,
      monto_mensual: Math.round(montoPerez),
      fecha_gracia: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      preapproval_id: 'seed-mp-perez-005',
    },
  });

  for (const hijo of hijosPerez) {
    const casa = hijo.edad < 10 ? casaQuantum : casaVertex;
    const username = `${hijo.nombre.toLowerCase()}.perez`;

    const estudiante = await prisma.estudiante.upsert({
      where: { email: `${username}@estudiante.test` },
      update: { tutorId: tutorPerez.id, casaId: casa.id },
      create: {
        username,
        nombre: hijo.nombre,
        apellido: 'Pérez',
        edad: hijo.edad,
        nivelEscolar: 'Primaria',
        email: `${username}@estudiante.test`,
        passwordHash: studentPasswordHash,
        tutorId: tutorPerez.id,
        casaId: casa.id,
      },
    });

    const clubs = casa === casaQuantum ? clubsQuantum : clubsVertex;
    const club = clubs[0];
    if (club) {
      const claseGrupoId = claseGruposMap.get(club.id)?.[0];

      await prisma.inscripcionActividad.upsert({
        where: {
          estudianteId_productoId_claseGrupoId: {
            estudianteId: estudiante.id,
            productoId: club.id,
            claseGrupoId: claseGrupoId ?? '',
          },
        },
        update: { estado: EstadoInscripcionActividad.PAUSADA, tier: hijo.tier },
        create: {
          suscripcionFamiliarId: suscripcionPerez.id,
          estudianteId: estudiante.id,
          productoId: club.id,
          claseGrupoId: claseGrupoId,
          tier: hijo.tier,
          estado: EstadoInscripcionActividad.PAUSADA,
        },
      });
    }

    console.log(
      `      ⏸️  ${hijo.nombre} (${hijo.edad} años) - ${hijo.tier} - PAUSADA`,
    );
  }

  console.log(
    `   💰 Monto mensual: $${Math.round(montoPerez).toLocaleString()}`,
  );
  console.log(`   📊 Estado: PAUSED (fallo de pago)`);
  console.log(`   ⚠️  Período de gracia: 7 días`);
  console.log(
    `   📧 Login tutor: laura.perez@suscripcion.test / ${password}\n`,
  );

  // ============================================================================
  // FAMILIA 6: Torres - 1 hijo (CANCELLED)
  // ============================================================================
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   👨‍👩‍👧‍👦 FAMILIA TORRES (1 hijo, CANCELLED)');
  console.log('   ═══════════════════════════════════════════════════════════');

  const tutorTorres = await prisma.tutor.upsert({
    where: { email: 'pablo.torres@suscripcion.test' },
    update: { passwordHash: passwordHash },
    create: {
      email: 'pablo.torres@suscripcion.test',
      passwordHash: passwordHash,
      nombre: 'Pablo',
      apellido: 'Torres',
      telefono: '+5491122334455',
      dni: '35666777',
      cuil: '20-35666777-3',
    },
  });

  const suscripcionTorres = await prisma.suscripcionFamiliar.upsert({
    where: { tutorId: tutorTorres.id },
    update: {
      estado: EstadoSuscripcionFamiliar.CANCELLED,
      tier: TierNombre.STEAM_LIBROS,
      monto_mensual: 40000,
    },
    create: {
      tutorId: tutorTorres.id,
      estado: EstadoSuscripcionFamiliar.CANCELLED,
      tier: TierNombre.STEAM_LIBROS,
      monto_mensual: 40000,
      preapproval_id: 'seed-mp-torres-006',
    },
  });

  const estudianteTorres = await prisma.estudiante.upsert({
    where: { email: 'julian.torres@estudiante.test' },
    update: { tutorId: tutorTorres.id, casaId: casaPulsar.id },
    create: {
      username: 'julian.torres',
      nombre: 'Julián',
      apellido: 'Torres',
      edad: 14,
      nivelEscolar: 'Secundaria - 2do año',
      email: 'julian.torres@estudiante.test',
      passwordHash: studentPasswordHash,
      tutorId: tutorTorres.id,
      casaId: casaPulsar.id,
    },
  });

  const clubTorres = clubsPulsar[0];
  if (clubTorres) {
    const claseGrupoId = claseGruposMap.get(clubTorres.id)?.[0];

    await prisma.inscripcionActividad.upsert({
      where: {
        estudianteId_productoId_claseGrupoId: {
          estudianteId: estudianteTorres.id,
          productoId: clubTorres.id,
          claseGrupoId: claseGrupoId ?? '',
        },
      },
      update: {
        estado: EstadoInscripcionActividad.CANCELADA,
        tier: TierNombre.STEAM_LIBROS,
      },
      create: {
        suscripcionFamiliarId: suscripcionTorres.id,
        estudianteId: estudianteTorres.id,
        productoId: clubTorres.id,
        claseGrupoId: claseGrupoId,
        tier: TierNombre.STEAM_LIBROS,
        estado: EstadoInscripcionActividad.CANCELADA,
        fechaFin: new Date(),
      },
    });
  }

  console.log(`      ❌ Julián (14 años) - STEAM_LIBROS - CANCELADA`);
  console.log(`   💰 Monto mensual: $40,000 (sin descuento - hijo único)`);
  console.log(`   📊 Estado: CANCELLED`);
  console.log(
    `   📧 Login tutor: pablo.torres@suscripcion.test / ${password}\n`,
  );

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   📊 RESUMEN SUSCRIPCIONES FAMILIARES 2026');
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('   | Familia    | Hijos | Estado     | Monto Mensual |');
  console.log('   |------------|-------|------------|---------------|');
  console.log('   | García     | 3     | AUTHORIZED | $275,500      |');
  console.log('   | López      | 2     | AUTHORIZED | $101,000      |');
  console.log('   | Rodríguez  | 1 (3) | AUTHORIZED | $275,500      |');
  console.log('   | Fernández  | 4     | PENDING    | $291,000      |');
  console.log('   | Pérez      | 2     | PAUSED     | $123,500      |');
  console.log('   | Torres     | 1     | CANCELLED  | $40,000       |');
  console.log('');
  console.log('   📋 EDGE CASES CUBIERTOS:');
  console.log(
    '   ─────────────────────────────────────────────────────────────',
  );
  console.log('   ✓ Múltiples hijos mismo tier (García - 3 SINCRONICO)');
  console.log('   ✓ Hijos con diferentes tiers (López - LIBROS + ASINCRONICO)');
  console.log('   ✓ 1 hijo con múltiples actividades (Rodríguez - 3 clubs)');
  console.log('   ✓ Familia numerosa 4+ hijos (Fernández)');
  console.log('   ✓ Estado AUTHORIZED (García, López, Rodríguez)');
  console.log('   ✓ Estado PENDING (Fernández)');
  console.log('   ✓ Estado PAUSED con período de gracia (Pérez)');
  console.log('   ✓ Estado CANCELLED (Torres)');
  console.log(
    '   ✓ Descuento 10% en producto más barato (todas las familias 2+)',
  );
  console.log('   ✓ Sin descuento hijo único (Torres)');
  console.log('   ✓ Todas las casas: QUANTUM, VERTEX, PULSAR');
  console.log('   ✓ Todos los tiers: LIBROS, ASINCRONICO, SINCRONICO');
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('   🔐 CREDENCIALES:');
  console.log(
    '   ─────────────────────────────────────────────────────────────',
  );
  console.log(`   Tutores: <email>@suscripcion.test / ${password}`);
  console.log(
    `   Estudiantes: <username>@estudiante.test / ${studentPassword}`,
  );
  console.log(
    '   ═══════════════════════════════════════════════════════════\n',
  );

  console.log('✅ Suscripciones Familiares 2026 creadas exitosamente!\n');
}
