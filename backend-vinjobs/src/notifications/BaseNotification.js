class BaseNotification {
  /**
   * @param {import('../MessageSender.js').default} sender - Kênh gửi (Bridge)
   */
  constructor(sender) {
    if (!sender) {
      throw new Error('Notification must have a MessageSender');
    }
    this.sender = sender;
    this.title = '';
    this.message = '';
    this.userId = null;
  }

  async send() {
    throw new Error('Method "send" must be implemented by concrete Notification.');
  }
}

export default BaseNotification;
