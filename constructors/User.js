const { snowflakeDate } = require('../util');

class User {
  constructor(data) {
    this.verified = !!data.verified;
    this.username = data.username;
    this.mfaEnabled = !!data.mfa_enabled;
    this.id = data.id;
    this.flags = data.flags || 0;
    this.email = data.email || null;
    this.discriminator = data.discriminator || '0000';
    this.bot = !!data.bot;
    this.avatar = data.avatar || null;
  }
    
  avatarURL({ format, size }) {
    if (this.avatar) {
      if (typeof format === 'string') {
        format = format.toLowerCase().replace(/\./g, '');
        if (!['gif', 'png', 'jpeg', 'jpg', 'webp'].includes(format)) throw new TypeError(`Invalid format: ${format} lol`);
        if (format === 'gif' && !this.avatarAnimated) format = 'png';
      } else format = 'png';

      size = Number.isInteger(size) ? size : 4096;

      if (size & (size - 1) || (size < 16 || size > 4096)) throw new TypeError('The size must be a power of two between 16 and 4096. bcz h');

      return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${format}?size=${size}`;
    }

    return `https://cdn.discordapp.com/embed/avatars/${Number(this.discriminator) % 5}.png`;
  }
    
  get avatarAnimated() {
    return this.avatar.startsWith('a_'); //a
  }
    
  get createdAt() {
    return snowflakeDate(this.id);
  }
}

class ClientUser extends User {
  constructor(bot, data) {
    super(data);
        
    this.changeName = async (username) => {
      if (typeof username !== 'string' || this.username === username) return this;
      await bot.request('PATCH', '/users/@me', { username });
      this.username = username;
      return this;
    };
  }
}

module.exports = { User, ClientUser };
