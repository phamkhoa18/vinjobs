// Javascript không có Interface, ta dùng Class ném lỗi để giả lập
class MessageSender {
  async sendMessage(to, title, body) {
    throw new Error('Method "sendMessage" must be implemented.');
  }

  getSenderType() {
    throw new Error('Method "getSenderType" must be implemented.');
  }
}

export default MessageSender;
