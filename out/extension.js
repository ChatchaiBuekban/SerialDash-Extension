"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const SerialManager_1 = require("./SerialManager");
const DashboardPanel_1 = require("./DashboardPanel");
let serialManager;
function activate(context) {
    console.log('Serial Dash Extension is now active');
    serialManager = new SerialManager_1.SerialManager();
    async function sendPortList() {
        try {
            const ports = await serialManager.listPorts();
            DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({
                type: 'ports',
                ports: ports.map(p => ({ path: p.path, manufacturer: p.manufacturer || '' }))
            });
        }
        catch (err) {
            DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({
                type: 'status',
                text: `Error listing ports: ${err.message}`
            });
        }
    }
    // Open dashboard — now standalone; connection is triggered from the dashboard UI
    const openDashCommand = vscode.commands.registerCommand('serialdash.openDashboard', async () => {
        DashboardPanel_1.DashboardPanel.createOrShow(context.extensionUri, {
            onConnect: (port, baud) => {
                try {
                    serialManager.connect(port, baud);
                }
                catch (err) {
                    vscode.window.showErrorMessage(`Failed to connect: ${err.message}`);
                    DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'status', text: 'Disconnected' });
                }
            },
            onDisconnect: () => serialManager.disconnect(),
            onListPorts: () => sendPortList(),
            onSetDelimiter: (d) => serialManager.setDelimiter(d),
        });
        sendPortList();
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({
            type: 'connectionState',
            connected: serialManager.isConnected()
        });
    });
    // Serial events → webview
    serialManager.on('connected', (path) => {
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'status', text: `Connected to ${path}` });
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'connectionState', connected: true });
    });
    serialManager.on('data', (data) => {
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'update', data });
    });
    serialManager.on('error', (err) => {
        vscode.window.showErrorMessage(`Serial Error: ${err.message}`);
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'status', text: `Error: ${err.message}` });
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'connectionState', connected: false });
    });
    serialManager.on('disconnected', () => {
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'status', text: 'Disconnected' });
        DashboardPanel_1.DashboardPanel.currentPanel?.postMessage({ type: 'connectionState', connected: false });
    });
    const setDelimiterCommand = vscode.commands.registerCommand('serialdash.setDelimiter', async () => {
        const delimiter = await vscode.window.showQuickPick([',', ';', '|', 'Space'], {
            placeHolder: 'Select data delimiter'
        });
        if (delimiter) {
            const actualDelimiter = delimiter === 'Space' ? ' ' : delimiter;
            serialManager.setDelimiter(actualDelimiter);
            vscode.window.showInformationMessage(`Delimiter set to "${delimiter}"`);
        }
    });
    context.subscriptions.push(openDashCommand, setDelimiterCommand);
}
exports.activate = activate;
function deactivate() {
    if (serialManager) {
        serialManager.disconnect();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map