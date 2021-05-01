const qtClient = require('./index.js');
const qt = new qtClient();

qt.on('debug', console.log);
qt.on('ready', () => console.log('HELLO!'));
qt.on('messageCreate', message => {
	console.log(message);
});

console.log('working')
qt.connect('ODI4MTI4MDYyMTg4NDIxMTUx.YGlEWw.-R4nW4mb_YMULzNqWUtiRPjfBxg');