const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAdminEstudiantes() {
  try {
    console.log('🔍 Testing admin estudiantes endpoint...\n');

    // 1. Login como admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: 'admin@mateatletas.com',
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
    console.log('✅ Login successful');
    console.log('Cookies:', cookies ? cookies[0].substring(0, 50) + '...' : 'none');

    // 2. Get estudiantes
    console.log('\n2. Fetching estudiantes...');
    const estudiantesResponse = await axios.get(
      `${API_URL}/admin/estudiantes`,
      {
        withCredentials: true,
        headers: {
          Cookie: cookies ? cookies.join('; ') : ''
        }
      }
    );

    console.log('✅ Response received');
    console.log('Response type:', typeof estudiantesResponse.data);
    console.log('Is array?', Array.isArray(estudiantesResponse.data));
    console.log('Response structure:', JSON.stringify(estudiantesResponse.data, null, 2));

    if (estudiantesResponse.data && estudiantesResponse.data.data) {
      console.log('\n📊 Estudiantes found:', estudiantesResponse.data.data.length);
      estudiantesResponse.data.data.forEach((est, idx) => {
        console.log(`${idx + 1}. ${est.nombre} ${est.apellido} - Sector: ${est.sector?.nombre || 'Sin sector'}`);
      });
    } else if (Array.isArray(estudiantesResponse.data)) {
      console.log('\n📊 Estudiantes found:', estudiantesResponse.data.length);
      estudiantesResponse.data.forEach((est, idx) => {
        console.log(`${idx + 1}. ${est.nombre} ${est.apellido} - Sector: ${est.sector?.nombre || 'Sin sector'}`);
      });
    } else {
      console.log('\n❌ Unexpected response format');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAdminEstudiantes();
