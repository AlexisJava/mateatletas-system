/**
 * Script temporal para resetear contraseña de usuario
 * Uso: npx ts-node scripts/reset-password.ts
 */

import * as bcrypt from 'bcrypt';

async function main() {
  const email = 'alexis.figueroa@est.fi.uncoma.edu.ar';
  const newPassword = 'Alexis93$';

  // Hashear la contraseña con bcrypt (mismo algoritmo que usa NestJS)
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  console.log('Email:', email);
  console.log('Nueva contraseña hasheada:', hashedPassword);
  console.log('\nEjecuta este SQL en Railway:');
  console.log(`UPDATE "Usuario" SET password = '${hashedPassword}' WHERE email = '${email}';`);
}

main();
