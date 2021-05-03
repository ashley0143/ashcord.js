module.exports = class Message {
  constructor(bot, data) {
    this.content = data.content;
    this.id = data.id;
    this.tts = data.tts;
    this.mentionEveryone = data.mention_everyone;
    this.pinned = data.pinned;
    this.bot = bot;
  }

  async reply(payload) {
    const message = await this.bot.request('POST', `/channels/${this.channel_id}/messages`, {
      content: (typeof payload === 'string' ? payload : payload.content) || '',
      embed: payload.embed || {},
      message_reference: { message_id: this.id }
    });
            
    return new Message(this.bot, message);
  }
};
