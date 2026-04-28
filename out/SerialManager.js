"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialManager = void 0;
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
const events_1 = require("events");
class SerialManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.port = null;
        this.parser = null;
        this.delimiter = ',';
    }
    setDelimiter(delimiter) {
        this.delimiter = delimiter;
    }
    async listPorts() {
        return await serialport_1.SerialPort.list();
    }
    connect(path, baudRate = 9600) {
        if (this.port) {
            this.port.close();
        }
        this.port = new serialport_1.SerialPort({ path, baudRate });
        this.parser = this.port.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\r\n' }));
        this.port.on('open', () => {
            console.log(`Port opened: ${path}`);
            this.emit('connected', path);
        });
        this.port.on('error', (err) => {
            console.error('Serial Error:', err);
            this.emit('error', err);
        });
        this.parser.on('data', (data) => {
            this.parseData(data);
        });
        this.port.on('close', () => {
            this.emit('disconnected');
        });
    }
    parseData(data) {
        // Dynamic parsing based on delimiter
        const parts = data.trim().split(this.delimiter);
        const channels = parts.map(p => {
            // Extract number from string, handle prefix like "L10.5" -> 10.5
            const val = parseFloat(p.replace(/[^\d.-]/g, ''));
            return isNaN(val) ? 0 : val;
        });
        if (channels.length > 0) {
            const serialData = {
                channels,
                timestamp: Date.now(),
                raw: data
            };
            this.emit('data', serialData);
        }
    }
    disconnect() {
        if (this.port) {
            this.port.close();
            this.port = null;
            this.parser = null;
        }
    }
    isConnected() {
        return this.port !== null && this.port.isOpen;
    }
}
exports.SerialManager = SerialManager;
//# sourceMappingURL=SerialManager.js.map