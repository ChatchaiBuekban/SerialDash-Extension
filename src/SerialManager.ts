import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { EventEmitter } from 'events';

export interface SerialData {
    channels: number[];
    timestamp: number;
    raw: string;
}

export class SerialManager extends EventEmitter {
    private port: SerialPort | null = null;
    private parser: ReadlineParser | null = null;
    private delimiter: string = ',';

    constructor() {
        super();
    }

    setDelimiter(delimiter: string) {
        this.delimiter = delimiter;
    }

    async listPorts() {
        return await SerialPort.list();
    }

    connect(path: string, baudRate: number = 9600) {
        if (this.port) {
            this.port.close();
        }

        this.port = new SerialPort({ path, baudRate });
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        this.port.on('open', () => {
            console.log(`Port opened: ${path}`);
            this.emit('connected', path);
        });

        this.port.on('error', (err) => {
            console.error('Serial Error:', err);
            this.emit('error', err);
        });

        this.parser.on('data', (data: string) => {
            this.parseData(data);
        });

        this.port.on('close', () => {
            this.emit('disconnected');
        });
    }

    private parseData(data: string) {
        // Dynamic parsing based on delimiter
        const parts = data.trim().split(this.delimiter);
        const channels = parts.map(p => {
            // Extract number from string, handle prefix like "L10.5" -> 10.5
            const val = parseFloat(p.replace(/[^\d.-]/g, ''));
            return isNaN(val) ? 0 : val;
        });

        if (channels.length > 0) {
            const serialData: SerialData = {
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
