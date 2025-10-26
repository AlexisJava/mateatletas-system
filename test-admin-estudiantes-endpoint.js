const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testEndpoint() {
  try {
    console.log('🔍 Testing /admin/estudiantes endpoint...\n');

    // 1. Login como admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: 'alexis.figueroa@est.fi.uncoma.edu.ar',
        password: 'Admin2024!'
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000',
          'Referer': 'http://localhost:3000/login'
        }
      }
    );

    const cookies = loginResponse.headers['set-cookie'];
    console.log('✅ Login successful\n');

    // 2. Get estudiantes
    console.log('2. Fetching /admin/estudiantes...');
    const response = await axios.get(
      `${API_URL}/admin/estudiantes`,
      {
        withCredentials: true,
        headers: {
          Cookie: cookies ? cookies.join('; ') : ''
        }
      }
    );

    console.log('✅ Response received');
    console.log('Response type:', typeof response.data);
    console.log('Response structure:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data && response.data.data) {
      console.log('\n📊 Total estudiantes:', response.data.data.length);
      console.log('\nEstudiantes:');
      response.data.data.forEach((est, idx) => {
        console.log(`${idx + 1}. ${est.nombre} ${est.apellido} - Sector: ${est.sector?.nombre || 'Sin sector'} - nivelEscolar: ${est.nivelEscolar}`);
      });
    } else if (Array.isArray(response.data)) {
      console.log('\n📊 Total estudiantes:', response.data.length);
      console.log('\nEstudiantes:');
      response.data.forEach((est, idx) => {
        console.log(`${idx + 1}. ${est.nombre} ${est.apellido} - Sector: ${est.sector?.nombre || 'Sin sector'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEndpoint();
