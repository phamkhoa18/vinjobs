import 'dotenv/config';
import mongoose from 'mongoose';
import { fakerVI as faker } from '@faker-js/faker'; 
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import User from './src/models/User.js';
import Company from './src/models/Company.js';
import Job from './src/models/Job.js';
import Category from './src/models/Category.js';

// Configuration
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/vinjobs';
const NUM_EMPLOYERS = 15;
const NUM_CANDIDATES = 20;
const JOBS_PER_COMPANY_MAX = 8;

const __dirname = path.resolve();
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const downloadImage = async (url, subDir, prefix) => {
  try {
    const dir = path.join(UPLOADS_DIR, subDir);
    ensureDirectoryExists(dir);

    const ext = 'jpg';
    const filename = `${prefix}-${uuidv4()}.${ext}`;
    const filepath = path.join(dir, filename);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(`/uploads/${subDir}/${filename}`);
        }
      });
    });
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
    return ''; // fallback to empty string
  }
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing old data...');
    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({ role: { $ne: 'ADMIN' } }); 
    await Category.deleteMany({});
    console.log('Old data cleared.');

    // 1. Categories
    console.log('Creating categories...');
    const categoryData = [
      { name: 'Công nghệ thông tin', icon: '💻', icon_color: '#3b82f6', bg_color: '#dbeafe' },
      { name: 'Marketing', icon: '📈', icon_color: '#10b981', bg_color: '#d1fae5' },
      { name: 'Kinh doanh / Bán hàng', icon: '🛒', icon_color: '#f59e0b', bg_color: '#fef3c7' },
      { name: 'Tài chính / Kế toán', icon: '💰', icon_color: '#8b5cf6', bg_color: '#ede9fe' },
      { name: 'Nhân sự', icon: '👥', icon_color: '#ec4899', bg_color: '#fce7f3' },
      { name: 'Thiết kế', icon: '🎨', icon_color: '#f43f5e', bg_color: '#ffe4e6' },
      { name: 'Xây dựng', icon: '🏗️', icon_color: '#f97316', bg_color: '#ffedd5' },
      { name: 'Giáo dục', icon: '📚', icon_color: '#6366f1', bg_color: '#e0e7ff' },
      { name: 'Y tế', icon: '🏥', icon_color: '#14b8a6', bg_color: '#ccfbf1' },
      { name: 'Du lịch / Nhà hàng', icon: '✈️', icon_color: '#06b6d4', bg_color: '#cffafe' },
      { name: 'Luật / Pháp lý', icon: '⚖️', icon_color: '#64748b', bg_color: '#f1f5f9' },
      { name: 'Cơ khí / Ô tô', icon: '⚙️', icon_color: '#84cc16', bg_color: '#ecfccb' },
      { name: 'Nông lâm nghiệp', icon: '🌱', icon_color: '#22c55e', bg_color: '#dcfce7' },
      { name: 'Bất động sản', icon: '🏢', icon_color: '#a855f7', bg_color: '#f3e8ff' }
    ];
    const categoryNames = categoryData.map(c => c.name);
    
    const categories = [];
    for (const data of categoryData) {
      const category = await Category.create({
        name: data.name,
        description: `Việc làm thuộc lĩnh vực ${data.name}`,
        icon: data.icon,
        icon_color: data.icon_color,
        bg_color: data.bg_color,
        is_active: true
      });
      categories.push(category);
    }

    // 2. Users (Employers and Candidates)
    console.log('Creating employers and candidates (Downloading avatars)...');
    const employers = [];
    for (let i = 0; i < NUM_EMPLOYERS; i++) {
      const avatarUrl = await downloadImage('https://picsum.photos/200/200?random=' + Math.random(), 'users', 'avatar');
      const employer = await User.create({
        name: faker.person.fullName(),
        email: `employer${i + 1}@vinjobs.com`,
        password: 'password123',
        phone: faker.helpers.fromRegExp(/0[3|5|7|8|9][0-9]{8}/),
        avatar: avatarUrl,
        role: 'EMPLOYER',
        status: 'ACTIVE',
      });
      employers.push(employer);
    }

    const candidates = [];
    for (let i = 0; i < NUM_CANDIDATES; i++) {
      const avatarUrl = await downloadImage('https://picsum.photos/200/200?random=' + Math.random(), 'users', 'avatar');
      const candidate = await User.create({
        name: faker.person.fullName(),
        email: `candidate${i + 1}@vinjobs.com`,
        password: 'password123',
        phone: faker.helpers.fromRegExp(/0[3|5|7|8|9][0-9]{8}/),
        avatar: avatarUrl,
        role: 'CANDIDATE',
        status: 'ACTIVE',
        profile: {
          gender: faker.helpers.arrayElement(['Nam', 'Nữ']),
          address: faker.location.city(),
          intro: faker.lorem.paragraph(),
          currentJob: faker.person.jobTitle(),
          experience: faker.helpers.arrayElement(['Chưa có kinh nghiệm', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '5 năm']),
        }
      });
      candidates.push(candidate);
    }

    // 3. Companies
    console.log('Creating companies (Downloading logos and covers)...');
    const companies = [];
    for (const employer of employers) {
      const logoUrl = await downloadImage('https://picsum.photos/300/300?random=' + Math.random(), 'companies', 'logo');
      const coverUrl = await downloadImage('https://picsum.photos/1200/400?random=' + Math.random(), 'companies', 'cover');
      
      const companyName = faker.company.name();
      const company = await Company.create({
        name: companyName,
        description: `<p>${faker.lorem.paragraphs(2)}</p><p>${faker.lorem.paragraphs(2)}</p>`,
        logo: logoUrl,
        cover: coverUrl,
        website: faker.internet.url(),
        address: faker.location.streetAddress() + ', ' + faker.location.city(),
        industry: faker.helpers.arrayElement(categoryNames),
        size: faker.helpers.arrayElement(['1-9 nhân viên', '10-24 nhân viên', '25-99 nhân viên', '100-499 nhân viên', '500+ nhân viên']),
        founded: faker.date.past({ years: 20 }).getFullYear().toString(),
        companyType: faker.helpers.arrayElement(['Trách nhiệm hữu hạn', 'Cổ phần', 'Liên doanh', 'Nước ngoài']),
        province: faker.location.city(),
        contact_email: faker.internet.email(),
        contact_phone: faker.helpers.fromRegExp(/0[3|5|7|8|9][0-9]{8}/),
        benefits: [faker.lorem.words(3), faker.lorem.words(4), faker.lorem.words(2)],
        status: 'ACTIVE',
        employer_id: employer._id
      });
      companies.push(company);
    }

    // 4. Jobs
    console.log('Creating jobs...');
    let jobCount = 0;
    for (const company of companies) {
      const numJobs = faker.number.int({ min: 4, max: JOBS_PER_COMPANY_MAX });
      for (let i = 0; i < numJobs; i++) {
        const minSalary = faker.number.int({ min: 5, max: 15 }) * 1000000; 
        const maxSalary = minSalary + faker.number.int({ min: 2, max: 10 }) * 1000000;
        
        const category = faker.helpers.arrayElement(categories);
        
        await Job.create({
          title: faker.person.jobTitle() + ' - ' + faker.helpers.arrayElement(['Senior', 'Junior', 'Middle', 'Intern', 'Fresher']),
          description: `<h4>Mô tả chi tiết</h4><p>${faker.lorem.paragraphs(2)}</p><h4>Cơ hội phát triển</h4><p>${faker.lorem.paragraphs(1)}</p>`,
          requirements: `<h4>Yêu cầu kỹ năng</h4><ul><li>${faker.lorem.sentence()}</li><li>${faker.lorem.sentence()}</li><li>${faker.lorem.sentence()}</li><li>${faker.lorem.sentence()}</li></ul>`,
          location: faker.location.city(),
          category_id: category._id,
          slots: faker.number.int({ min: 1, max: 10 }),
          salary_min: minSalary,
          salary_max: maxSalary,
          salary_negotiable: faker.datatype.boolean(),
          benefits: [faker.lorem.words(3), faker.lorem.words(2), faker.lorem.words(4)],
          working_days: ['Thứ 2 - Thứ 6'],
          working_hours: ['08:00 - 17:00'],
          experience: faker.helpers.arrayElement(['Không yêu cầu', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '5 năm']),
          education: faker.helpers.arrayElement(['Không yêu cầu', 'Trung học', 'Trung cấp', 'Cao đẳng', 'Đại học']),
          gender: faker.helpers.arrayElement(['Không yêu cầu', 'Nam', 'Nữ']),
          type: faker.helpers.arrayElement(['FULL_TIME', 'PART_TIME', 'REMOTE', 'INTERNSHIP']),
          level: faker.helpers.arrayElement(['Thực tập sinh', 'Nhân viên', 'Trưởng nhóm', 'Trưởng phòng']),
          status: 'APPROVED',
          company_id: company._id,
          employer_id: company.employer_id,
          deadline: faker.date.future()
        });
        jobCount++;
      }
    }

    console.log(`Database seeded successfully!`);
    console.log(`Created ${categories.length} Categories`);
    console.log(`Created ${employers.length} Employers`);
    console.log(`Created ${candidates.length} Candidates`);
    console.log(`Created ${companies.length} Companies`);
    console.log(`Created ${jobCount} Jobs`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
