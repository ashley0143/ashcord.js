const ws = require('ws'),
    fetch = require('node-fetch'),
    EventEmitter = require('events'),
    { readdirSync } = require('fs'),
    { platform } = require('os'),
    websocket = require('./websocket');

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
    constructor(options = { intents: 512 }) {
        super();

        if (!(options instanceof Object))
            throw new TypeError("'options' must be an object");
        if (!Number.isInteger(options.intents))
            throw new TypeError("'options.intents' must be a number");
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
     * @param {string} [token=this.token]
     * @returns {void}
     */
    connect(token = this.token) {
        if (typeof token !== 'string')
            throw new TypeError("'token' must be a string");

        this.token = token;

        this.emit('debug', 'Attempting to connect to the Discord gateway...');

        this.socket = new ws('wss://gateway.discord.gg/?v=6&encoding=json');
        this.socket.once('open', () => {
            this.emit('debug', 'Attempting to login...');
            this.socket.send(JSON.stringify({
                op: 2,
                d: {
                    token: this.token,
                    intents: this.config.intents,
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
                if (c === 4004) throw new Error('Invalid client token provided');
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

module.exports = Client;