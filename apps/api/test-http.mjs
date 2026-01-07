import http from 'http';

const password = 'z!YBcJX6&Lz&';
const data = JSON.stringify({
  email: 'figueroa.alexis93@gmail.com',
  password: password,
});

console.log('=== HTTP Request Audit ===\n');
console.log('1. Original password:', password);
console.log('   Length:', password.length);
console.log(
  '   Char codes:',
  [...password].map((c) => c.charCodeAt(0)),
);
console.log('\n2. JSON stringified payload:', data);
console.log('   Payload length:', data.length);

// Verify the JSON is valid and can be parsed back
const parsed = JSON.parse(data);
console.log('\n3. Parsed back:');
console.log('   Email:', parsed.email);
console.log('   Password:', parsed.password);
console.log('   Password matches original:', parsed.password === password);

console.log('\n4. Sending HTTP request...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    Origin: 'http://localhost:3000',
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('\n5. Response:');
    console.log('   Status:', res.statusCode);
    try {
      const json = JSON.parse(body);
      console.log('   Body:', JSON.stringify(json, null, 2));
    } catch {
      console.log('   Body:', body);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
