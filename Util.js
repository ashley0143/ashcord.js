const { Inflate } = require('pako');

module.exports = {
    snowflakeDate: (snowflake) => {
        // definitely not copied from discord.js
        let bin = '';
        let high = parseInt(snowflake.slice(0, -10)) || 0;
        let low = parseInt(snowflake.slice(-10));
        while (low > 0 || high > 0) {
            bin = String(low & 1) + bin;
            low = Math.floor(low / 2);
            if (high > 0) {
                low += 5000000000 * (high % 2);
                high = Math.floor(high / 2);
            }
        }
        return new Date(parseInt(bin.substring(0, 42), 2)) + 1420070400000;
    },
    
    camelCase: (string) => {
        string = string.split('_');
        return string[0].toLowerCase() + (string.length > 1 ? string.slice(1).map(x => `${x[0].toUpperCase()}${x.slice(1).toLowerCase()}`).join('') : '');
    },
    
    evaluate: (msg, flag) => {
        if (!flag || typeof flag !== 'object') flag = {};
        if (!flag.binary) return JSON.parse(msg);
        const inflator = new Inflate();
        inflator.push(msg);
        if (inflator.err) throw new Error('An error occurred while decompressing data');
        return JSON.parse(inflator.toString());
    },
    
    parseFlags: (current, data, cls) => {
        for (const key in data)
            data[key] = ((current | data[key]) === current);
        if (!cls) return data;
        
        // can't Object.assign a class ;-;
        for (const key in data)
            cls[key] = data[key];
    },
    
    assign: (cls, object, func) => {
        for (const key in object) {
            const name = func(key);
            if (name)
                cls[name] = object[key];
        }
    }
}