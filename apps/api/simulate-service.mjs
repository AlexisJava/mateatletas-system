import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const DUMMY_HASH =
  '$2b$12$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';

async function verifyWithTimingProtection(password, hashedPassword) {
  const hashToCompare = hashedPassword || DUMMY_HASH;
  const isValid = await bcrypt.compare(password, hashToCompare);

  if (!hashedPassword) {
    return { isValid: false, needsRehash: false, currentRounds: 0 };
  }

  const parts = hashedPassword.split('$');
  const currentRounds = parts.length >= 3 ? parseInt(parts[2], 10) : 0;
  const needsRehash = currentRounds > 0 && currentRounds < BCRYPT_ROUNDS;

  return { isValid, needsRehash, currentRounds };
}

async function simulateDocenteLogin(email, password) {
  console.log('=== Simulating DocenteAuthService.login() ===\n');

  // Step 1: Find docente
  console.log('Step 1: Finding docente by email');
  const docente = await prisma.docente.findUnique({
    where: { email },
  });
  console.log('   Found:', Boolean(docente));
  console.log('   password_hash:', docente?.password_hash);

  // Step 2: Verify password
  console.log('\nStep 2: Calling verifyWithTimingProtection');
  const verificationResult = await verifyWithTimingProtection(
    password,
    docente?.password_hash ?? null,
  );
  console.log('   Result:', verificationResult);

  // Step 3: Check condition
  console.log('\nStep 3: Checking failure condition');
  console.log('   !docente:', !docente);
  console.log('   !verificationResult.isValid:', !verificationResult.isValid);
  console.log('   Would fail:', !docente || !verificationResult.isValid);

  if (!docente || !verificationResult.isValid) {
    console.log('\n>>> LOGIN WOULD FAIL WITH 401 <<<');
  } else {
    console.log('\n>>> LOGIN WOULD SUCCEED <<<');
  }

  await prisma.$disconnect();
}

const email = 'figueroa.alexis93@gmail.com';
const password = 'z!YBcJX6&Lz&';

console.log('Input email:', email);
console.log('Input password:', password);
console.log('');

simulateDocenteLogin(email, password);
