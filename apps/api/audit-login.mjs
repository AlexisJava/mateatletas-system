import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const email = 'figueroa.alexis93@gmail.com';
const password = 'z!YBcJX6&Lz&';

console.log('=== AUDIT: Login Docente ===\n');
console.log('1. Input data:');
console.log('   Email:', email);
console.log('   Password:', password);
console.log('   Password JSON:', JSON.stringify(password));

const docente = await prisma.docente.findUnique({
  where: { email },
});

console.log('\n2. Database query result:');
console.log('   Docente found:', Boolean(docente));

if (docente) {
  console.log('   Docente ID:', docente.id);
  console.log('   Hash value:', docente.password_hash);

  console.log('\n3. Password comparison:');
  const isValid = await bcrypt.compare(password, docente.password_hash);
  console.log('   bcrypt.compare result:', isValid);
}

await prisma.$disconnect();
