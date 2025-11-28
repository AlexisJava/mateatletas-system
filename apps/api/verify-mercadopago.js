/**
 * Verificación Completa de Configuración de MercadoPago
 *
 * Este script valida:
 * 1. Credenciales configuradas correctamente
 * 2. No están en modo MOCK
 * 3. SDK se inicializa correctamente
 * 4. Conectividad con API de MercadoPago
 */

require('dotenv').config({ path: './.env' });

const CHECKS = {
  credentials: false,
  notMock: false,
  sdkInit: false,
  apiConnectivity: false,
};

const RESULTS = [];

function log(emoji, message, details = '') {
  const msg = `${emoji} ${message}`;
  console.log(msg);
  if (details) console.log(`   ${details}`);
  RESULTS.push({ message: msg, details });
}

// CHECK 1: Verificar que las credenciales estén configuradas
function checkCredentials() {
  log('🔍', 'CHECK 1: Verificando credenciales en .env');

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!accessToken) {
    log('❌', 'MERCADOPAGO_ACCESS_TOKEN no configurado');
    return false;
  }

  if (!publicKey) {
    log('❌', 'MERCADOPAGO_PUBLIC_KEY no configurado');
    return false;
  }

  if (!webhookSecret) {
    log(
      '⚠️',
      'MERCADOPAGO_WEBHOOK_SECRET no configurado (opcional para desarrollo)',
    );
  }

  log('✅', 'Credenciales encontradas en .env');
  log('   ', `Access Token: ${accessToken.substring(0, 20)}...`);
  log('   ', `Public Key: ${publicKey.substring(0, 20)}...`);

  CHECKS.credentials = true;
  return true;
}

// CHECK 2: Verificar que NO estén en modo MOCK
function checkNotMock() {
  log('🔍', 'CHECK 2: Verificando que NO esté en modo MOCK');

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  // Detectar placeholders comunes
  const mockIndicators = [
    'XXXXXXXX',
    'TEST-XXXX',
    'YOUR_ACCESS_TOKEN',
    'placeholder',
  ];

  for (const indicator of mockIndicators) {
    if (accessToken.includes(indicator)) {
      log(
        '❌',
        `Token contiene placeholder "${indicator}" - MODO MOCK detectado`,
      );
      return false;
    }
  }

  // Verificar formato de token real
  // Tokens de TEST: TEST-XXXX-...
  // Tokens de PRODUCCIÓN: APP_USR-XXXX-...

  if (accessToken.startsWith('APP_USR-')) {
    log('✅', 'Token de PRODUCCIÓN detectado (APP_USR-...)');
    log('⚠️', 'IMPORTANTE: Estás usando credenciales de PRODUCCIÓN');
    log('   ', 'Los pagos serán REALES. Asegúrate de que sea intencional.');
  } else if (accessToken.startsWith('TEST-')) {
    log('✅', 'Token de TEST/SANDBOX detectado (TEST-...)');
    log('   ', 'Los pagos serán simulados (modo sandbox)');
  } else {
    log(
      '⚠️',
      'Formato de token no reconocido (esperado: APP_USR-... o TEST-...)',
    );
    log('   ', `Token comienza con: ${accessToken.substring(0, 10)}...`);
  }

  CHECKS.notMock = true;
  return true;
}

// CHECK 3: Verificar que el SDK se inicialice correctamente
async function checkSDKInit() {
  log('🔍', 'CHECK 3: Inicializando SDK de MercadoPago');

  try {
    // Importar SDK dinámicamente
    const { MercadoPagoConfig, Payment } = require('mercadopago');

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    // Inicializar cliente
    const client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000,
      },
    });

    log('✅', 'SDK de MercadoPago inicializado correctamente');
    log('   ', 'Cliente configurado con timeout de 5 segundos');

    CHECKS.sdkInit = true;
    return client;
  } catch (error) {
    log('❌', 'Error inicializando SDK de MercadoPago', error.message);
    return null;
  }
}

// CHECK 4: Verificar conectividad con API de MercadoPago
async function checkAPIConnectivity(client) {
  log('🔍', 'CHECK 4: Verificando conectividad con API de MercadoPago');

  if (!client) {
    log('❌', 'No se puede verificar conectividad sin cliente SDK');
    return false;
  }

  try {
    const { Payment } = require('mercadopago');
    const paymentClient = new Payment(client);

    // Intentar obtener un pago inexistente (esperamos 404, pero confirma conectividad)
    try {
      await paymentClient.get({ id: '999999999999' });
    } catch (error) {
      // Si recibimos error 404, significa que la API respondió correctamente
      if (error.status === 404) {
        log('✅', 'API de MercadoPago responde correctamente');
        log(
          '   ',
          'Conexión verificada (recibido 404 esperado para pago inexistente)',
        );
        CHECKS.apiConnectivity = true;
        return true;
      }

      // Si recibimos error 401, las credenciales son inválidas
      if (error.status === 401) {
        log('❌', 'Credenciales INVÁLIDAS - API retorna 401 Unauthorized');
        log('   ', 'Verifica que el ACCESS_TOKEN sea correcto');
        return false;
      }

      // Cualquier otro error de API
      log('⚠️', `API retornó error ${error.status}: ${error.message}`);
      return false;
    }

    // Si llegamos aquí, el pago existía (improbable con ID 999999999999)
    log('✅', 'API de MercadoPago responde correctamente');
    CHECKS.apiConnectivity = true;
    return true;
  } catch (error) {
    log('❌', 'Error verificando conectividad con API', error.message);
    return false;
  }
}

// Ejecutar todas las verificaciones
async function runVerification() {
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('🔐 VERIFICACIÓN DE CONFIGURACIÓN DE MERCADOPAGO');
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  // CHECK 1
  const step1 = checkCredentials();
  console.log('');

  // CHECK 2
  const step2 = step1 ? checkNotMock() : false;
  console.log('');

  // CHECK 3
  const client = step2 ? await checkSDKInit() : null;
  console.log('');

  // CHECK 4
  const step4 = client ? await checkAPIConnectivity(client) : false;
  console.log('');

  // RESUMEN
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  const allPassed = Object.values(CHECKS).every((check) => check === true);

  console.log(
    `✅ Credenciales configuradas: ${CHECKS.credentials ? 'SÍ' : 'NO'}`,
  );
  console.log(`✅ No está en modo MOCK: ${CHECKS.notMock ? 'SÍ' : 'NO'}`);
  console.log(`✅ SDK inicializado: ${CHECKS.sdkInit ? 'SÍ' : 'NO'}`);
  console.log(`✅ API conectada: ${CHECKS.apiConnectivity ? 'SÍ' : 'NO'}`);
  console.log('');

  if (allPassed) {
    console.log('🎉 ¡TODAS LAS VERIFICACIONES PASARON!');
    console.log('');
    console.log(
      '✅ El sistema está configurado correctamente para usar MercadoPago',
    );
    console.log('✅ Puedes proceder con el deployment a producción');
    console.log('');
    console.log(
      '⚠️  RECORDATORIO: Si estás usando credenciales de PRODUCCIÓN (APP_USR-),',
    );
    console.log(
      '   los pagos serán REALES y se procesarán transacciones monetarias.',
    );
    console.log('');
  } else {
    console.log('❌ ALGUNAS VERIFICACIONES FALLARON');
    console.log('');
    console.log(
      'Por favor revisa los errores arriba antes de deployar a producción.',
    );
    console.log('');
  }

  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  process.exit(allPassed ? 0 : 1);
}

// Ejecutar
runVerification().catch((error) => {
  console.error('💥 Error fatal en verificación:', error);
  process.exit(1);
});
