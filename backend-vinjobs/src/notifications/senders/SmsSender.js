import MessageSender from '../MessageSender.js';

class SmsSender extends MessageSender {
  async sendMessage(to, title, body) {
    // Thực tế sẽ dùng Twilio hoặc SMS gateway
    console.log(`\n[SMS SENDER]`);
    console.log(`Phone: ${to}`);
    console.log(`Message: [${title}] - ${body}\n`);
    return true;
  }

  getSenderType() {
    return 'SMS';
  }
}

export default SmsSender;
