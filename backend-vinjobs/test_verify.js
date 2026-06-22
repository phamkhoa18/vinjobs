import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './src/models/Company.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vinjobs').then(async () => {
  try {
    const employer_id = new mongoose.Types.ObjectId();
    console.log('Testing findOneAndUpdate upsert...');
    const company = await Company.findOneAndUpdate(
      { employer_id },
      { 
        business_license: 'test.jpg', 
        taxCode: '123', 
        name: 'Test',
        status: 'PENDING'
      },
      { new: true, runValidators: true, upsert: true }
    );
    console.log('Success:', company);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
});
