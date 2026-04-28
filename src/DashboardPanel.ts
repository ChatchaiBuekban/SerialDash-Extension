import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export interface DashboardHandlers {
  onConnect?: (port: string, baud: number) => void;
  onDisconnect?: () => void;
  onListPorts?: () => void;
  onSetDelimiter?: (delimiter: string) => void;
}

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _handlers: DashboardHandlers;

  public static createOrShow(
    extensionUri: vscode.Uri,
    handlers: DashboardHandlers = {},
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel._handlers = handlers;
      DashboardPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "serialDashboard",
      "Serial Dash",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionUri.fsPath, "media")),
        ],
      },
    );

    DashboardPanel.currentPanel = new DashboardPanel(
      panel,
      extensionUri,
      handlers,
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    handlers: DashboardHandlers,
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._handlers = handlers;

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
          case "listPorts":
            this._handlers.onListPorts?.();
            return;
          case "connect":
            this._handlers.onConnect?.(message.port, message.baud);
            return;
          case "disconnect":
            this._handlers.onDisconnect?.();
            return;
          case "setDelimiter":
            this._handlers.onSetDelimiter?.(message.delimiter);
            return;
          case "toggleZenMode":
            await vscode.commands.executeCommand(
              "workbench.action.toggleZenMode",
            );
            return;
          case "toggleVSCodeFullscreen":
            await vscode.commands.executeCommand(
              "workbench.action.toggleFullScreen",
            );
            return;
          case "enterImmersive":
            await vscode.commands.executeCommand(
              "workbench.action.closeSidebar",
            );
            await vscode.commands.executeCommand(
              "workbench.action.closeAuxiliaryBar",
            );
            await vscode.commands.executeCommand("workbench.action.closePanel");
            await vscode.commands.executeCommand(
              "workbench.action.toggleZenMode",
            );
            if (message.osFullscreen) {
              await vscode.commands.executeCommand(
                "workbench.action.toggleFullScreen",
              );
            }
            return;
          case "exitImmersive":
            await vscode.commands.executeCommand(
              "workbench.action.exitZenMode",
            );
            if (message.osFullscreen) {
              await vscode.commands.executeCommand(
                "workbench.action.toggleFullScreen",
              );
            }
            return;
        }
      },
      null,
      this._disposables,
    );
  }

  public postMessage(message: any) {
    this._panel.webview.postMessage(message);
  }

  public dispose() {
    DashboardPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this._extensionUri.fsPath, "media", "dashboard.js"),
      ),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this._extensionUri.fsPath, "media", "style.css"),
      ),
    );

    // Chart.js and Canvas-Gauges from CDN
    const chartJsUri = "https://cdn.jsdelivr.net/npm/chart.js";
    const canvasGaugesUri =
      "https://cdn.rawgit.com/Mikhus/canvas-gauges/master/gauge.min.js";

    // Inline SVG icons (stroke uses currentColor so they inherit button text color)
    const icon = (path: string) =>
      `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    const iconPlus = icon(
      '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    );
    const iconTrash = icon(
      '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    );
    const iconPause = icon(
      '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    );
    const iconDownload = icon(
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    );
    const iconEdit = icon(
      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    );
    // Brand logo loaded from assets/icons/icon.svg, recolored to inherit currentColor
    let brandLogo = "";
    try {
      const svgPath = path.join(
        this._extensionUri.fsPath,
        "assets",
        "icons",
        "icon.svg",
      );
      brandLogo = fs
        .readFileSync(svgPath, "utf8")
        .replace(/stroke:\s*#[0-9a-fA-F]{3,6}/g, "stroke:currentColor")
        .replace(/<svg\b([^>]*?)>/, '<svg$1 class="icon">');
    } catch {
      brandLogo = "";
    }
    const iconSerial =
      brandLogo ||
      icon(
        '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/>',
      );
    const iconFullscreen = icon(
      '<path d="M3 9V4a1 1 0 0 1 1-1h5"/><path d="M21 9V4a1 1 0 0 0-1-1h-5"/><path d="M3 15v5a1 1 0 0 0 1 1h5"/><path d="M21 15v5a1 1 0 0 1-1 1h-5"/>',
    );
    const iconExitFullscreen = icon(
      '<path d="M9 3H4a1 1 0 0 0-1 1v5"/><path d="M15 3h5a1 1 0 0 1 1 1v5"/><path d="M9 21H4a1 1 0 0 1-1-1v-5"/><path d="M15 21h5a1 1 0 0 0 1-1v-5"/>',
    );
    const iconPlug = icon(
      '<path d="M12 22v-5"/><path d="M9 7V2"/><path d="M15 7V2"/><path d="M6 13V8h12v5a5 5 0 0 1-10 0"/>',
    );
    const iconRefresh = icon(
      '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    );

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Serial Dash</title>
            </head>
            <body>
                <div class="dashboard">
                    <header class="app-header">
                        <div class="brand">
                            <div class="brand-icon">${iconSerial}</div>
                            <div class="brand-text">
                                <h1>Serial Dash</h1>
                                <span class="brand-sub">Real-time Serial Dash Board Monitor</span>
                            </div>
                        </div>
                        <div class="header-right">
                            <div class="conn-panel">
                                <div class="conn-field">
                                    <label for="portSelect" class="conn-label">Port</label>
                                    <div class="conn-select-wrap">
                                        <select id="portSelect" class="conn-select" title="Serial port">
                                            <option value="">No ports</option>
                                        </select>
                                        <button id="refreshPortsBtn" class="icon-btn conn-refresh" title="Refresh ports">
                                            ${iconRefresh}
                                        </button>
                                    </div>
                                </div>
                                <div class="conn-field">
                                    <label for="baudSelect" class="conn-label">Baud</label>
                                    <select id="baudSelect" class="conn-select" title="Baud rate">
                                        <option value="9600">9600</option>
                                        <option value="19200">19200</option>
                                        <option value="38400">38400</option>
                                        <option value="57600">57600</option>
                                        <option value="115200" selected>115200</option>
                                        <option value="230400">230400</option>
                                        <option value="460800">460800</option>
                                        <option value="921600">921600</option>
                                    </select>
                                </div>
                                <button id="connectBtn" class="btn btn-primary conn-btn" title="Connect">
                                    ${iconPlug}<span>Connect</span>
                                </button>
                            </div>
                            <div id="status" class="status-pill status-disconnected">
                                <span class="status-dot"></span>
                                <span class="status-text">Disconnected</span>
                            </div>
                        </div>
                    </header>

                    <div class="toolbar">
                        <div class="toolbar-group">
                            <button id="addBtn" class="btn btn-primary" title="Add Widget">
                                ${iconPlus}<span>Add Widget</span>
                            </button>
                            <button id="editBtn" class="btn btn-ghost" title="Toggle layout edit">
                                ${iconEdit}<span>Edit Layout</span>
                            </button>
                        </div>
                        <div class="toolbar-divider"></div>
                        <div class="toolbar-group">
                            <button id="pauseBtn" class="btn btn-ghost" title="Pause data stream">
                                ${iconPause}<span>Pause</span>
                            </button>
                            <button id="clearBtn" class="btn btn-ghost" title="Clear all data">
                                ${iconTrash}<span>Clear</span>
                            </button>
                            <button id="exportBtn" class="btn btn-ghost" title="Export data to CSV">
                                ${iconDownload}<span>Export CSV</span>
                            </button>
                        </div>
                        <div class="toolbar-spacer"></div>
                        <div class="toolbar-group">
                            <button id="fullscreenBtn" class="btn btn-ghost" title="Fullscreen (show widgets only)">
                                ${iconFullscreen}<span>Fullscreen</span>
                            </button>
                        </div>
                    </div>

                    <button id="exitFullscreenBtn" class="exit-fullscreen-btn" title="Exit fullscreen">
                        ${iconExitFullscreen}
                    </button>

                    <div id="widgetGrid" class="widget-grid">
                        <!-- Widgets will be injected here -->
                    </div>

                    <div id="emptyState" class="empty-state" style="display:none;">
                        <div class="empty-icon">${iconPlus}</div>
                        <h3>No widgets yet</h3>
                        <p>Click <strong>Add Widget</strong> to create your first visualization.</p>
                    </div>
                </div>

                <!-- Add / Edit Widget Modal -->
                <div id="widgetModal" class="modal">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modalTitle">Add New Widget</h3>
                            <button id="closeAdd" class="icon-btn" title="Close">✕</button>
                        </div>
                        <div class="modal-body">
                            <label class="field" id="typeLabel">
                                <span class="field-label">Widget Type</span>
                                <select id="widgetType">
                                    <option value="line">📈 Line Chart</option>
                                    <option value="gauge">⏱ Radial Gauge</option>
                                    <option value="simple-gauge">◯ Simple Gauge</option>
                                    <option value="bar">▬ Horizontal Bar</option>
                                    <option value="level">▤ Level Bar</option>
                                    <option value="status">● Status LED</option>
                                    <option value="text">✎ Text Note</option>
                                    <option value="value"># Value Display</option>
                                    <option value="console">❯ Console</option>
                                </select>
                            </label>
                            <label class="field" id="channelLabel">
                                <span class="field-label">Channel</span>
                                <input type="number" id="widgetChannel" value="0" min="0">
                            </label>
                            <label class="field" id="styleLabel" style="display:none;">
                                <span class="field-label">Preset Style</span>
                                <select id="widgetStyle">
                                    <option value="normal">Normal</option>
                                    <option value="header">Header (Large)</option>
                                    <option value="code">Code (Monospace)</option>
                                </select>
                            </label>
                            <div class="field-row" id="textSizeRow" style="display:none;">
                                <label class="field">
                                    <span class="field-label">Font Size (px)</span>
                                    <input type="number" id="widgetFontSize" value="14" min="8" max="96">
                                </label>
                                <label class="field">
                                    <span class="field-label">Align</span>
                                    <select id="widgetAlign">
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                        <option value="justify">Justify</option>
                                    </select>
                                </label>
                            </div>
                            <div class="field" id="textFormatRow" style="display:none;">
                                <span class="field-label">Format</span>
                                <div class="toggle-row">
                                    <button type="button" class="toggle-btn" data-fmt="bold" title="Bold"><b>B</b></button>
                                    <button type="button" class="toggle-btn" data-fmt="italic" title="Italic"><i>I</i></button>
                                    <button type="button" class="toggle-btn" data-fmt="underline" title="Underline"><u>U</u></button>
                                </div>
                            </div>
                            <label class="field">
                                <span class="field-label">Title</span>
                                <input type="text" id="widgetTitle" placeholder="Channel X">
                            </label>
                            <div class="field-row" id="rangeLabel">
                                <label class="field">
                                    <span class="field-label">Min</span>
                                    <input type="number" id="widgetMin" value="0" step="any">
                                </label>
                                <label class="field">
                                    <span class="field-label">Max</span>
                                    <input type="number" id="widgetMax" value="100" step="any">
                                </label>
                            </div>
                            <label class="field" id="unitsLabel" style="display:none;">
                                <span class="field-label">Units</span>
                                <input type="text" id="widgetUnits" placeholder="e.g. °C, V, %">
                            </label>
                            <label class="field" id="decimalsLabel" style="display:none;">
                                <span class="field-label">Decimals</span>
                                <input type="number" id="widgetDecimals" value="2" min="0" max="6">
                            </label>
                            <div class="field line-advanced" id="lineAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Line Chart Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Line Width</span>
                                                <input type="number" id="lineWidth" value="2" min="1" max="10" step="0.5">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Line Style</span>
                                                <select id="lineStyle">
                                                    <option value="solid">Solid</option>
                                                    <option value="dashed">Dashed</option>
                                                    <option value="dotted">Dotted</option>
                                                </select>
                                            </label>
                                        </div>
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Smoothness <span id="lineTensionVal" class="hint">0.25</span></span>
                                                <input type="range" id="lineTension" value="0.25" min="0" max="1" step="0.05">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Max History Points</span>
                                                <input type="number" id="lineMaxPoints" value="50" min="5" max="5000" step="5">
                                            </label>
                                        </div>
                                        <label class="field">
                                            <span class="field-label">Y-Axis</span>
                                            <select id="lineYMode">
                                                <option value="auto">Auto</option>
                                                <option value="manual">Manual</option>
                                            </select>
                                        </label>
                                        <div class="field-row" id="lineYRange" style="display:none;">
                                            <label class="field">
                                                <span class="field-label">Y Min</span>
                                                <input type="number" id="lineYMin" value="0" step="any">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Y Max</span>
                                                <input type="number" id="lineYMax" value="100" step="any">
                                            </label>
                                        </div>
                                        <div class="toggle-grid">
                                            <label class="toggle-check"><input type="checkbox" id="lineFill" checked><span>Fill area</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="lineShowPoints"><span>Show points</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="lineStepped"><span>Stepped line</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="lineShowGrid" checked><span>Show grid</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="lineShowLegend"><span>Show legend</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="lineShowXAxis"><span>Show X-axis</span></label>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="field" id="gaugeAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Gauge Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Needle Type</span>
                                                <select id="gaugeNeedleType">
                                                    <option value="arrow">Arrow</option>
                                                    <option value="line">Line</option>
                                                </select>
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Animation (ms)</span>
                                                <input type="number" id="gaugeAnimMs" value="500" min="0" max="5000" step="50">
                                            </label>
                                        </div>
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Major Ticks</span>
                                                <input type="number" id="gaugeMajorTicks" value="6" min="2" max="20">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Minor Ticks</span>
                                                <input type="number" id="gaugeMinorTicks" value="2" min="0" max="10">
                                            </label>
                                        </div>
                                        <label class="field">
                                            <span class="field-label">Red Zone Start (% of range) <span id="gaugeHighlightVal" class="hint">80</span></span>
                                            <input type="range" id="gaugeHighlight" value="80" min="0" max="100" step="5">
                                        </label>
                                        <div class="toggle-grid">
                                            <label class="toggle-check"><input type="checkbox" id="gaugeShowBorders"><span>Show borders</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="gaugeShowUnits" checked><span>Show units</span></label>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="field" id="simpleGaugeAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Simple Gauge Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Ring Thickness</span>
                                                <input type="number" id="sgThickness" value="10" min="2" max="30">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Display</span>
                                                <select id="sgDisplay">
                                                    <option value="percent">Percentage</option>
                                                    <option value="value">Value</option>
                                                </select>
                                            </label>
                                        </div>
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Warning %</span>
                                                <input type="number" id="sgWarn" value="60" min="0" max="100">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Critical %</span>
                                                <input type="number" id="sgCrit" value="80" min="0" max="100">
                                            </label>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="field" id="barAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Bar Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Orientation</span>
                                                <select id="barOrient">
                                                    <option value="horizontal">Horizontal</option>
                                                    <option value="vertical">Vertical</option>
                                                </select>
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Corner Radius</span>
                                                <input type="number" id="barCorner" value="6" min="0" max="30">
                                            </label>
                                        </div>
                                        <label class="field">
                                            <span class="field-label">Fill Opacity <span id="barOpacityVal" class="hint">0.55</span></span>
                                            <input type="range" id="barOpacity" value="0.55" min="0.1" max="1" step="0.05">
                                        </label>
                                        <div class="toggle-grid">
                                            <label class="toggle-check"><input type="checkbox" id="barShowValue" checked><span>Show value label</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="barShowGridOpt" checked><span>Show grid</span></label>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="field" id="levelAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Level Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Display</span>
                                                <select id="lvlDisplay">
                                                    <option value="percent">Percentage</option>
                                                    <option value="value">Value</option>
                                                </select>
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Bar Height (px)</span>
                                                <input type="number" id="lvlBarHeight" value="36" min="8" max="200">
                                            </label>
                                        </div>
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Warning %</span>
                                                <input type="number" id="lvlWarn" value="60" min="0" max="100">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Critical %</span>
                                                <input type="number" id="lvlCrit" value="80" min="0" max="100">
                                            </label>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="field" id="statusAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Status Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">OK Above</span>
                                                <input type="number" id="stOk" value="0" step="any">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Warning ≥</span>
                                                <input type="number" id="stWarn" value="50" step="any">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Critical ≥</span>
                                                <input type="number" id="stCrit" value="80" step="any">
                                            </label>
                                        </div>
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Off Label</span>
                                                <input type="text" id="stLabelOff" value="OFF">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">OK Label</span>
                                                <input type="text" id="stLabelOk" value="OK">
                                            </label>
                                        </div>
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Warning Label</span>
                                                <input type="text" id="stLabelWarn" value="WARNING">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Critical Label</span>
                                                <input type="text" id="stLabelCrit" value="CRITICAL">
                                            </label>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="field" id="valueAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Value Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Font Size (px)</span>
                                                <input type="number" id="valFontSize" value="48" min="12" max="200">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Align</span>
                                                <select id="valAlign">
                                                    <option value="center">Center</option>
                                                    <option value="left">Left</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </label>
                                        </div>
                                        <label class="field">
                                            <span class="field-label">Prefix</span>
                                            <input type="text" id="valPrefix" placeholder="e.g. $, T:">
                                        </label>
                                        <div class="toggle-grid">
                                            <label class="toggle-check"><input type="checkbox" id="valGlow" checked><span>Glow effect</span></label>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div class="field" id="consoleAdvanced" style="display:none;">
                                <details class="advanced-details">
                                    <summary>Advanced Console Options</summary>
                                    <div class="advanced-body">
                                        <div class="field-row">
                                            <label class="field">
                                                <span class="field-label">Max Lines</span>
                                                <input type="number" id="conMaxLines" value="200" min="10" max="10000" step="10">
                                            </label>
                                            <label class="field">
                                                <span class="field-label">Font Size (px)</span>
                                                <input type="number" id="conFontSize" value="12" min="8" max="32">
                                            </label>
                                        </div>
                                        <label class="field">
                                            <span class="field-label">Show</span>
                                            <select id="conSource">
                                                <option value="raw">Raw line</option>
                                                <option value="channel">Channel value only</option>
                                            </select>
                                        </label>
                                        <div class="toggle-grid">
                                            <label class="toggle-check"><input type="checkbox" id="conShowTs" checked><span>Show timestamps</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="conAutoScroll" checked><span>Auto-scroll</span></label>
                                            <label class="toggle-check"><input type="checkbox" id="conWrap"><span>Wrap long lines</span></label>
                                        </div>
                                    </div>
                                </details>
                            </div>
                            <div class="field" id="colorLabel">
                                <span class="field-label">Accent Color</span>
                                <div class="swatch-row" id="colorSwatches">
                                    <button type="button" class="swatch" data-color="#3b82f6" style="--sw:#3b82f6" title="Blue"></button>
                                    <button type="button" class="swatch" data-color="#10b981" style="--sw:#10b981" title="Green"></button>
                                    <button type="button" class="swatch" data-color="#f59e0b" style="--sw:#f59e0b" title="Amber"></button>
                                    <button type="button" class="swatch" data-color="#ef4444" style="--sw:#ef4444" title="Red"></button>
                                    <button type="button" class="swatch" data-color="#8b5cf6" style="--sw:#8b5cf6" title="Purple"></button>
                                    <button type="button" class="swatch" data-color="#06b6d4" style="--sw:#06b6d4" title="Cyan"></button>
                                    <input type="color" id="widgetColor" value="#3b82f6" title="Custom color">
                                </div>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button id="cancelAdd" class="btn btn-ghost">Cancel</button>
                            <button id="confirmAdd" class="btn btn-primary">Add Widget</button>
                        </div>
                    </div>
                </div>

                <script src="${chartJsUri}"></script>
                <script src="${canvasGaugesUri}"></script>
                <script src="https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js"></script>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
  }
}
