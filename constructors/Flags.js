const { intents, privilegedIntents, permissions } = require('../Constants');
const intentNames = Object.keys(intents);
const intentValues = Object.values(intents);

class Permissions {
    constructor(value) {
        this.value = isNaN(value) ? 0 : Number(value);
        
        if (Array.isArray(value))
            this.value = value.every(Number.isInteger) ? value.reduce((a, b) => a | b) : value.filter(x => typeof x === 'string' && permissions[x.toUpperCase()]).map(x => permissions[x.toLowerCase()]).reduce((a, b) => a | b);
        
        for (const key in permissions)
            this[key] = (this.value | permissions[key]) === this.value;
    }
}

class Intents {
    constructor(data) {
        this.value = Number.isInteger(data) ? data : 0;
        
        if (!this.value) {
            if (Array.isArray(data) && data.length) {
                for (const part of data) {
                    if (Number.isInteger(part)) {
                        if (!intentValues.includes(part)) throw new Error(`The intent bit: '${part}' does not exist.`);
                        this.value |= part;
                        continue;
                    }
                    
                    if (typeof part !== 'string') throw new TypeError(`Invalid type: '${typeof part}', must be either a number or a string.`);
                    if (!intentNames.includes(part.toUpperCase())) throw new Error(`The intent name: '${part}' does not exist.`);
                    this.value |= intents[part.toUpperCase()];
                }
            } else if (typeof data === 'string') {
                data = data.toUpperCase();
                switch (data) {
                    case 'ALL':
                        this.value = intentValues.reduce((a, b) => a | b);
                        break;
                    case 'PRIVILEGED':
                        this.value = privilegedIntents.map(x => intents[x]).reduce((a, b) => a | b);
                        break;
                    default:
                        if (!intentNames.includes(data)) throw new Error(`The intent name: '${data}' does not exist.`);
                        this.value = intents[data];
                }
            }
        }
        
        for (const key of intentNames)
            this[key] = ((this.value | intents[key]) === this.value);
    }
}

module.exports = {
    Permissions,
    Intents: Object.assign(Intents, Object.assign({
        ALL: intentValues.reduce((a, b) => a | b),
        PRIVILEGED: privilegedIntents.map(x => intents[x]).reduce((a, b) => a | b)
    }, intents))
};