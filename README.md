# ashcord.js
Beta discord api lib. (WIP)

**Current working example:**
```js
const qtClient = require('./index.js');
const qt = new qtClient();
const prefix = '!';

qt
.on('ready', () => console.log('Bot is ready!'))
.on('messageCreate', async (message) => {
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'ping':
      return await message.reply('pong! uwu');
    case 'say':
      return await message.reply(!args[0] ? 'What do you want me to say?' : args.join(' '));
  }
});

qt.connect('Your-Discord-token-goes-here');
```
