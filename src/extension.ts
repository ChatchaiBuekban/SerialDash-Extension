import * as vscode from 'vscode';
import { SerialManager } from './SerialManager';
import { DashboardPanel } from './DashboardPanel';

let serialManager: SerialManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Serial Dash Extension is now active');

    serialManager = new SerialManager();

    async function sendPortList() {
        try {
            const ports = await serialManager.listPorts();
            DashboardPanel.currentPanel?.postMessage({
                type: 'ports',
                ports: ports.map(p => ({ path: p.path, manufacturer: p.manufacturer || '' }))
            });
        } catch (err: any) {
            DashboardPanel.currentPanel?.postMessage({
                type: 'status',
                text: `Error listing ports: ${err.message}`
            });
        }
    }

    // Open dashboard — now standalone; connection is triggered from the dashboard UI
    const openDashCommand = vscode.commands.registerCommand('serialdash.openDashboard', async () => {
        DashboardPanel.createOrShow(context.extensionUri, {
            onConnect: (port: string, baud: number) => {
                try {
                    serialManager.connect(port, baud);
                } catch (err: any) {
                    vscode.window.showErrorMessage(`Failed to connect: ${err.message}`);
                    DashboardPanel.currentPanel?.postMessage({ type: 'status', text: 'Disconnected' });
                }
            },
            onDisconnect: () => serialManager.disconnect(),
            onListPorts: () => sendPortList(),
            onSetDelimiter: (d: string) => serialManager.setDelimiter(d),
        });
        sendPortList();
        DashboardPanel.currentPanel?.postMessage({
            type: 'connectionState',
            connected: serialManager.isConnected()
        });
    });

    // Serial events → webview
    serialManager.on('connected', (path: string) => {
        DashboardPanel.currentPanel?.postMessage({ type: 'status', text: `Connected to ${path}` });
        DashboardPanel.currentPanel?.postMessage({ type: 'connectionState', connected: true });
    });

    serialManager.on('data', (data) => {
        DashboardPanel.currentPanel?.postMessage({ type: 'update', data });
    });

    serialManager.on('error', (err) => {
        vscode.window.showErrorMessage(`Serial Error: ${err.message}`);
        DashboardPanel.currentPanel?.postMessage({ type: 'status', text: `Error: ${err.message}` });
        DashboardPanel.currentPanel?.postMessage({ type: 'connectionState', connected: false });
    });

    serialManager.on('disconnected', () => {
        DashboardPanel.currentPanel?.postMessage({ type: 'status', text: 'Disconnected' });
        DashboardPanel.currentPanel?.postMessage({ type: 'connectionState', connected: false });
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

export function deactivate() {
    if (serialManager) {
        serialManager.disconnect();
    }
}
