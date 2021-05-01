const { Inflate } = require('pako');
const Message = require('./constructors/Message.js');

function camelCase(string) {
    string = string.split('_');
    return string[0].toLowerCase() + (string.length > 1 ? string.slice(1).map(x => `${x[0].toUpperCase()}${x.slice(1).toLowerCase()}`).join('') : '');
}

function evaluate(msg, flag) {
    if (!flag || typeof flag !== 'object') flag = {};
    if (!flag.binary) return JSON.parse(msg);
    const inflator = new Inflate();
    inflator.push(msg);
    if (inflator.err) throw new Error('An error occurred while decompressing data');
    return JSON.parse(inflator.toString());
}

module.exports = (bot, message, flag) => {
    const msg = evaluate(message, flag);
    bot.emit('debug', `Received a raw gateway event with the OP code of ${msg.op}.`);
    
    switch (msg.t) {
        case 'READY':
            if (!msg.d.user.bot) process.exit(1); // no selfbots allowed uwu
            bot.sessionID = msg.d.session_id;
            bot.user = msg.d.user;
            bot.emit('ready');
            break;
        case 'MESSAGE_CREATE':
            bot.emit('messageCreate', new Message(bot, msg.d));
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
        case 10: // heartbeat
            if (bot.hb) clearInterval(bot.hb);
            bot.hb = setInterval(() => {
                return bot.socket.send(JSON.stringify({
                    op: 1,
                    d: 1
                }));
            }, msg.d.heartbeat_interval);
    }
}