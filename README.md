# ashcord.js
beta discord api lib (WIP)

**Current working example:**
```js
const qtClient = require('./index.js');
const qt = new qtClient();
const prefix = '!';

qt.on('ready', () => console.log('Bot is ready!'));
qt.on('messageCreate', async (message) => {
    switch (message.content.slice(prefix.length).toLowerCase()) {
        case 'ping':
            return await message.reply('pong! uwu');
    }
});

qt.connect('discord token here');
```