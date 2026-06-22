import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Sử dụng Design Pattern Singleton cho Database Connection
// Mặc dù trong Node.js, module caching tự nó đã là Singleton
// Nhưng ta viết tường minh để phù hợp với triết lý thiết kế dự án
class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect() {
    if (this.connection) {
      console.log('✅ Đã kết nối MongoDB từ trước');
      return this.connection;
    }

    try {
      const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/vinjobs';
      
      this.connection = await mongoose.connect(dbUrl, {
        // Mongoose 6+ không cần useNewUrlParser và useUnifiedTopology nữa
      });
      
      console.log('🚀 Kết nối MongoDB thành công!');
      return this.connection;
    } catch (error) {
      console.error('❌ Lỗi kết nối MongoDB:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('🔌 Đã ngắt kết nối MongoDB');
      this.connection = null;
    }
  }
}

export default DatabaseConnection.getInstance();
