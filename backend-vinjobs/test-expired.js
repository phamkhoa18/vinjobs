import jwt from 'jsonwebtoken';
import 'dotenv/config';
const token = jwt.sign({ id: '60d21b4667d0d8992e610c85' }, process.env.JWT_SECRET || 'vinjobs-secret-key-2026', { expiresIn: '-1s' });
console.log(token);
