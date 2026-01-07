import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function traceAuthOrchestrator() {
  const email = 'figueroa.alexis93@gmail.com';
  const password = 'z!YBcJX6&Lz&';

  console.log('=== Tracing AuthOrchestratorService.login() ===\n');

  // Step 1: detectUserType
  console.log('1. detectUserType()');

  // Check tutor first
  const tutor = await prisma.tutor.findUnique({
    where: { email },
    select: { id: true },
  });
  console.log('   Tutor found:', Boolean(tutor));

  if (tutor) {
    console.log('   --> Would delegate to TutorAuthService');
    await prisma.$disconnect();
    return;
  }

  // Check docente
  const docente = await prisma.docente.findUnique({
    where: { email },
    select: { id: true },
  });
  console.log('   Docente found:', Boolean(docente));

  if (docente) {
    console.log('   --> Would delegate to DocenteAuthService');

    // Now simulate DocenteAuthService.login()
    console.log('\n2. DocenteAuthService.login()');

    // Get full docente
    const fullDocente = await prisma.docente.findUnique({
      where: { email },
    });

    console.log('   Email match:', fullDocente?.email === email);
    console.log('   Has password_hash:', Boolean(fullDocente?.password_hash));

    // Verify password
    const isValid = await bcrypt.compare(
      password,
      fullDocente?.password_hash || '',
    );
    console.log('   bcrypt.compare result:', isValid);

    if (!fullDocente || !isValid) {
      console.log('\n   >>> WOULD FAIL WITH 401 <<<');
    } else {
      console.log('\n   >>> WOULD SUCCEED <<<');
    }

    await prisma.$disconnect();
    return;
  }

  // Check admin
  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { id: true },
  });
  console.log('   Admin found:', Boolean(admin));

  if (!tutor && !docente && !admin) {
    console.log('   --> User not found, would fail with 401');
  }

  await prisma.$disconnect();
}

traceAuthOrchestrator();
