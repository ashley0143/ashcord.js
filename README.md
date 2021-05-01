# ashcord.js
beta discord api lib (WIP)

**Current working example:**
```js
const qtClient = require('./index.js');
const qt = new qtClient();

qt.on('ready', () => console.log('Bot is ready!'));
qt.on('messageCreate', message => {
    console.log(message);
});

qt.connect('discord token here');
```