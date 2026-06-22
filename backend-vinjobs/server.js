import 'dotenv/config';
import app from './app.js';
import db from './src/config/database.js';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      console.log(`🚀 VinJobs API đang chạy tại http://localhost:${PORT}`);
      console.log(`📚 Môi trường: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API prefix: /api/v1`);
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Đóng server...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM (graceful shutdown)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM nhận được. Đóng server gracefully...');
  process.exit(0);
});

startServer();
