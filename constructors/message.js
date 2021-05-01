module.exports = class Message {
    constructor(bot, data) {
        this.content = data.content;
        this.id = data.id;
        this.tts = data.tts;
        this.mentionEveryone = data.mention_everyone;
        this.pinned = data.pinned;
        
        this.reply = async (payload) => {
            const content = (typeof payload === 'string' ? payload : payload.content) || '';
            const msg = await bot.request(`POST`, `/channels/${data.channel_id}/messages`, {
                content,
                embed: payload.embed || {},
                message_reference: { message_id: data.id }
            });
            
            return new Message(bot, msg);
        };
    }
}