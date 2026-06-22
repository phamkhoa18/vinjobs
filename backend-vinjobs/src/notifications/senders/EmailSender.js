import MessageSender from '../MessageSender.js';

import sendEmail from '../../utils/email.js';

class EmailSender extends MessageSender {
  async sendMessage(to, title, body) {
    try {
      await sendEmail({
        email: to,
        subject: title,
        message: body
      });
      return true;
    } catch (err) {
      console.error(`[EMAIL SENDER] Error sending email to ${to}:`, err);
      // We return false or throw error depending on strictness. Returning true/false is fine for now.
      return false;
    }
  }

  getSenderType() {
    return 'EMAIL';
  }
}

export default EmailSender;
