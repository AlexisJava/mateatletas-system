import http from 'http';

const password = 'z!YBcJX6&Lz&';
const data = JSON.stringify({
  email: 'figueroa.alexis93@gmail.com',
  password: password,
});

console.log('Sending login request...');
console.log('Password being sent:', password);
console.log('JSON payload:', data);

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
    console.log('Response status:', res.statusCode);
    console.log('Response body:', body);
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.write(data);
req.end();
