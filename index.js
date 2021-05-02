const ws              = require('ws');
const fetch           = require('node-fetch');
const EventEmitter    = require('events');
const { readdirSync } = require('fs');
const { platform }    = require('os');
const websocket       = require('./Websocket');
const { Intents }     = require('./constructors/Flags');

/**
 * @typedef {Object} ClientOptions
 * @property {string} [token]
 * @property {number} [intents=32767]
 * @property {{
 *     name: string;
 *     type: number;
 *     }} [activity]
 * @property {string} [status]
 * @property {string} [commandHandlerPath]
 */

class Client extends EventEmitter {
    /**
     * @param {ClientOptions} [options={ intents: 512 }] The options for the client.
     */
    constructor(options = { intents: Intents.ALL }) {
        super();

        if (!(options instanceof Object))
            throw new TypeError("'options' must be an object");
        if (!Number.isInteger(options.intents) && !(options.intents instanceof Intents))
            throw new TypeError("'options.intents' must be a number or an instance of the intents object.");
        if ('token' in options && typeof options.token !== 'string')
            throw new TypeError("'options.token' must be a string");
        if ('activity' in options && !(options.activity instanceof Object))
            throw new TypeError("'options.activity' must an object");
        if ('commandHandlerPath' in options && typeof options.commandHandlerPath !== 'string')
            throw new TypeError("'options.commandHandlerPath' must be a string");
        if ('status' in options && typeof options.status !== 'string')
            throw new TypeError("'options.status' must be a string");

        Object.defineProperty(this, 'token', {
            value: process.env.TOKEN || options.token,
            configurable: true,
            writable: true,
            enumerable: false
        });
        
        const name = require('./package.json').name;
        this.config = {
            browser: name,
            device: name,
            status: options.status !== undefined && ['online', 'idle', 'dnd', 'invisible'].includes(options.status.toLowerCase()) ? options.status : 'online',
            intents: options.intents,
            activity: options.activity || {},
            baseURL: 'https://discord.com/api/v8'
        };
        this.commands = new Map();
        this.seqNum = 1;
        this.sessionID = null;

        const path = options.commandHandlerPath;
        if (path) {
            for (const file of readdirSync(path).filter(f => /\.[jt]s$/.test(f))) {
                try {
                    const command = require(`${path.endsWith('/') ? path : `${path}/`}${file}`);

                    this.commands.set(command.name, command);
                } catch (err) {
                    console.error(`Command ${file.slice(0, 3)} failed to load, error:\n${err}`);
                }
            }
        }
    }

    /**
     * @param {string} method
     * @param {string} path
     * @param {Object} [body]
     * @returns {Promise<any>}
     */
    request(method, path, body) {
        if (typeof method !== 'string')
            throw new TypeError("'method' must be a string");
        if (typeof path !== 'string')
            throw new TypeError("'path' must be a string");
        if (body !== undefined && body !== null && !(body instanceof Object))
            throw new TypeError("'body' must be an object");

        return fetch(`${this.config.baseURL}${path}`, {
            method,
            headers: {
                Authorization: `Bot ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: body !== undefined ? JSON.stringify(body) : null
        }).then(res => res.json());
    }

    /**
     * @param {string} [token] the bot token.
     * @returns {void}
     */
    connect(token) {
        if (!token && !this.token)
            throw new TypeError("'token' must be provided.");

        this.token = token;
        this.emit('debug', 'Attempting to connect to the Discord gateway...');

        this.socket = new ws('wss://gateway.discord.gg/?v=6&encoding=json');
        this.socket.once('open', () => {
            this.emit('debug', 'Attempting to login...');
            this.socket.send(JSON.stringify({
                op: 2,
                d: {
                    token: this.token,
                    intents: Number.isInteger(this.config.intents) ? this.config.intents : this.config.intents.value,
                    properties: {
                        $os: platform,
                        $browser: this.config.browser,
                        $device: this.config.device
                    },
                    presence: {
                        activities: [this.config.activity],
                        status: this.config.status
                    }
                }
            }));
            this.socket.once('error', error => this.emit('error', error));
            this.socket.on('message', (message, flag) => {
                websocket(this, message, flag)
            });
            this.socket.on('close', c => {
                clearInterval(this.hb);
				// this should cover most common close codes, right?
				// documentation: https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes
                switch (c) {
                    case 4000:
                        console.error('An unknown error has occurred. Reconnecting...');
                        break;
                    case 4001:
                        throw new Error('You sent an invalid Gateway opcode or an invalid payload for an opcode. Don\'t do that!');
                        break;
                    case 4004:
                        throw new Error('Invalid client token provided');
                    case 4008:
                        throw new Error(`Woah nelly! You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this.`);
                        break;
                    case 4013:
                        throw new Error('You sent an invalid intent for a Gateway Intent. You may have incorrectly calculated the bitwise value.');
                    case 4014:
                        throw new Error('You sent a disallowed intent for a Gateway Intent. You may have tried to specify an intent that you have not enabled or are not approved for.');
                }
                this.emit('debug', `Connection closed unexpectedly with error code ${c}. Re-attempting login...`);
                this.connect();
            });
        });
    }

    /**
     * @param {string} [reason]
     * @returns {void}
     */
    destroy(reason) {
        this.socket.close();
        this.emit('debug', `Websocket connection closed${typeof reason === 'string' ? ` for the following reason:\n${reason}` : ''}`);
    }
}

module.exports = Object.assign(Client, { Intents });