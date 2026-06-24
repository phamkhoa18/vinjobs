import db from './src/config/database.js';

// Test import toàn bộ các models để đảm bảo không lỗi cú pháp
import User from './src/models/User.js';
import Company from './src/models/Company.js';
import Job from './src/models/Job.js';
import Application from './src/models/Application.js';
import CV from './src/models/CV.js';
import SavedJob from './src/models/SavedJob.js';

import Category from './src/models/Category.js';
import Post from './src/models/Post.js';
import Notification from './src/models/Notification.js';

console.log('✅ Khởi tạo thành công 9 Models!');

// Test kết nối
const run = async () => {
  await db.connect();
  console.log('Sẵn sàng cho các module khác.');
  process.exit(0);
};

run();
