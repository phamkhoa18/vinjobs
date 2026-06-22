import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API = 'http://localhost:8000/api/v1';

async function run() {
  try {
    // 1. Register a test employer
    const email = `test_${Date.now()}@test.com`;
    console.log('Registering employer', email);
    const regRes = await axios.post(`${API}/auth/register`, {
      email,
      password: 'password123',
      passwordConfirm: 'password123',
      full_name: 'Test Employer',
      role: 'EMPLOYER'
    });
    
    const token = regRes.data.token;
    console.log('Got token:', token);
    
    // 2. Upload a file
    fs.writeFileSync('test.jpg', 'fake image content');
    const formData = new FormData();
    formData.append('image', fs.createReadStream('test.jpg'));
    
    console.log('Uploading file...');
    let business_license;
    try {
      const upRes = await axios.post(`${API}/upload/image`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Upload res:', upRes.data);
      business_license = upRes.data.data.url;
    } catch (e) {
      console.error('Upload Error:', e.response?.data || e.message);
      return;
    }

    // 3. Call verify
    console.log('Calling verify...');
    try {
      const verifyRes = await axios.put(`${API}/companies/verify`, {
        name: 'Test Company',
        taxCode: '123456789',
        business_license
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Verify res:', verifyRes.data);
    } catch (e) {
      console.error('Verify Error:', e.response?.data || e.message);
    }
  } catch (err) {
    console.error('Global Error:', err.response?.data || err.message);
  }
}
run();
