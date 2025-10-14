// Script rápido para crear estudiante
const https = require('http');

const data = JSON.stringify({
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan@estudiante.com",
  password: "Estudiante123!",
  telefono: "1234567890",
  fecha_nacimiento: "2010-01-15"
});

// Primero login como admin para obtener token
const loginData = JSON.stringify({
  email: "admin@mateatletas.com",
  password: "admin123"
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔑 Obteniendo token de admin...');

const loginReq = https.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const loginResponse = JSON.parse(body);
    const token = loginResponse.access_token;
    
    console.log('✅ Token obtenido');
    console.log('👤 Creando estudiante...');
    
    // Ahora crear estudiante
    const createOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/estudiantes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${token}`
      }
    };
    
    const createReq = https.request(createOptions, (createRes) => {
      let createBody = '';
      createRes.on('data', (chunk) => createBody += chunk);
      createRes.on('end', () => {
        console.log('');
        console.log('========================================');
        if (createRes.statusCode === 201) {
          console.log('✅ ESTUDIANTE CREADO EXITOSAMENTE!');
          console.log('========================================');
          console.log('📧 Email:    juan@estudiante.com');
          console.log('🔑 Password: Estudiante123!');
          console.log('========================================');
          console.log('');
          console.log('🎯 Ahora puedes:');
          console.log('1. Ir a: http://localhost:3000/login');
          console.log('2. Usar esas credenciales');
          console.log('3. Acceder al portal de estudiante');
          console.log('');
        } else {
          console.log('❌ Error al crear estudiante:');
          console.log(createBody);
        }
      });
    });
    
    createReq.on('error', (e) => {
      console.error('❌ Error:', e.message);
    });
    
    createReq.write(data);
    createReq.end();
  });
});

loginReq.on('error', (e) => {
  console.error('❌ Error en login:', e.message);
});

loginReq.write(loginData);
loginReq.end();
