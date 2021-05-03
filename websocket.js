const { Inflate } = require('pako');
const { camelCase, evaluate } = require('./Util');
const Message = require('./constructors/Message');
const Guild = require('./constructors/Guild');
const { ClientUser } = require('./constructors/User');

module.exports = function websocket(bot, message, flag) {
  const msg = evaluate(message, flag);
  bot.emit('raw', {
    event: msg.t || 'UNKNOWN',
    opCode: msg.op || 0,
    data: msg.d || {}
  });
    
  switch (msg.t) {
    case 'READY':
      if (!msg.d.user.bot) process.exit(1); // no selfbots allowed uwu
      bot.sessionID = msg.d.session_id;
      bot.user = new ClientUser(bot, msg.d.user);
      bot.guilds = new Map();
      bot.emit('ready');
      bot.emit('debug', '[PAYLOAD: READY] Successfully connected to the Discord gateway.');
      break;
    case 'MESSAGE_CREATE':
      bot.emit('messageCreate', new Message(bot, msg.d));
      break;
    case 'GUILD_CREATE':
      const guild = new Guild(msg.d);
      bot.guilds.set(msg.d.id, guild);
      bot.emit('guildCreate', guild);
      break;
    default:
      if (msg.t && msg.d)
        bot.emit(camelCase(msg.t), msg.d);
  }
    
  switch (msg.op) {
    case 7: // reconnect
      return bot.socket.send(JSON.stringify({
        op: 6,
        d: {
          session_id: bot.sessionID,
          token: bot.token,
          seq: bot.seqNum
        }
      }));
      break;
    case 10: // heartbeat
      if (bot.hb) clearInterval(bot.hb);
      bot.hb = setInterval(() => {
        return bot.socket.send(JSON.stringify({ op: 1, d: 1 }));
      }, msg.d.heartbeat_interval);
  }
};
