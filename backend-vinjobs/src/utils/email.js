import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Chưa cấu hình tài khoản Email SMTP (EMAIL_USER, EMAIL_PASS)');
  }

  // 2) Tạo transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 3) Khởi tạo email options
  const mailOptions = {
    from: `VinJobs <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 4) Gửi email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
