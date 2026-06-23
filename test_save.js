const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: './backend-vinjobs/.env'});

(async () => {
  const token = jwt.sign({ id: '6a37bdebf146ff255c47227c', role: 'CANDIDATE' }, process.env.JWT_SECRET || 'vinjobs-secret-key-development', { expiresIn: '1h' });
  const res = await fetch('http://localhost:3000/api/v1/saved-jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ jobId: '6a37bdebf146ff255c47227c' })
  });
  const data = await res.json();
  console.log(res.status, data);
})();
