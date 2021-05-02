const { snowflakeDate } = require('../util');

module.exports = class User {
    constructor(data) {
        this.verified = data.verified || false;
        this.name = data.username;
        this.mfaEnabled = data.mfa_enabled || false;
        this.id = data.id;
        this.flags = data.flags || 0;
        this.email = data.email || null;
        this.discriminator = data.discriminator || '0000';
        this.bot = data.bot || false;
        this.avatar = data.avatar || null;
    }
    
    avatarURL({ format, size }) {
        if (this.avatar) {
            if (format) format = format.toLowerCase().replace(/\./g, '');
            if (format && !['gif', 'png', 'jpeg', 'jpg', 'webp'].includes(format)) throw new TypeError(`Invalid format: ${format}`);
            if (format === 'gif' && !this.avatarAnimated) format = 'png';
    
            size = Number(size) || 4096;
            if (size & (size - 1) || (size < 16 || size > 4096)) throw new TypeError(`The size must be a power of two between 16 and 4096.`);
            return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${format || (this.avatarAnimated ? 'gif' : 'png')}?size=${size}`;
        }
        return `https://cdn.discordapp.com/embed/avatars/${Number(this.discriminator) % 5}.png`;
    }
    
    get avatarAnimated() {
        return this.avatar.startsWith('a_');
    }
    
    get createdAt() {
        return snowflakeDate(this.id);
    }
}