(function () {
    const vscode = acquireVsCodeApi();

    const widgetGrid = document.getElementById('widgetGrid');
    const statusEl = document.getElementById('status');
    const statusTextEl = statusEl ? statusEl.querySelector('.status-text') : null;
    const emptyStateEl = document.getElementById('emptyState');

    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const exportBtn = document.getElementById('exportBtn');
    const editBtn = document.getElementById('editBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');

    const portSelect = document.getElementById('portSelect');
    const baudSelect = document.getElementById('baudSelect');
    const connectBtn = document.getElementById('connectBtn');
    const refreshPortsBtn = document.getElementById('refreshPortsBtn');

    const widgetModal = document.getElementById('widgetModal');
    const modalTitleEl = document.getElementById('modalTitle');
    const widgetTypeSelect = document.getElementById('widgetType');
    const typeLabel = document.getElementById('typeLabel');
    const channelLabel = document.getElementById('channelLabel');
    const styleLabel = document.getElementById('styleLabel');
    const rangeLabel = document.getElementById('rangeLabel');
    const unitsLabel = document.getElementById('unitsLabel');
    const decimalsLabel = document.getElementById('decimalsLabel');
    const colorLabel = document.getElementById('colorLabel');
    const widgetMinEl = document.getElementById('widgetMin');
    const widgetMaxEl = document.getElementById('widgetMax');
    const widgetUnitsEl = document.getElementById('widgetUnits');
    const widgetDecimalsEl = document.getElementById('widgetDecimals');
    const widgetColorEl = document.getElementById('widgetColor');
    const swatchRow = document.getElementById('colorSwatches');
    const colorFieldLabel = colorLabel ? colorLabel.querySelector('.field-label') : null;
    const textSizeRow = document.getElementById('textSizeRow');
    const textFormatRow = document.getElementById('textFormatRow');
    const widgetFontSizeEl = document.getElementById('widgetFontSize');
    const widgetAlignEl = document.getElementById('widgetAlign');
    const fmtButtons = textFormatRow ? textFormatRow.querySelectorAll('.toggle-btn') : [];
    const lineAdvanced = document.getElementById('lineAdvanced');
    const lineWidthEl = document.getElementById('lineWidth');
    const lineStyleEl = document.getElementById('lineStyle');
    const lineTensionEl = document.getElementById('lineTension');
    const lineTensionVal = document.getElementById('lineTensionVal');
    const lineMaxPointsEl = document.getElementById('lineMaxPoints');
    const lineYModeEl = document.getElementById('lineYMode');
    const lineYRangeEl = document.getElementById('lineYRange');
    const lineYMinEl = document.getElementById('lineYMin');
    const lineYMaxEl = document.getElementById('lineYMax');
    const lineFillEl = document.getElementById('lineFill');
    const lineShowPointsEl = document.getElementById('lineShowPoints');
    const lineSteppedEl = document.getElementById('lineStepped');
    const lineShowGridEl = document.getElementById('lineShowGrid');
    const lineShowLegendEl = document.getElementById('lineShowLegend');
    const lineShowXAxisEl = document.getElementById('lineShowXAxis');

    const gaugeAdvanced = document.getElementById('gaugeAdvanced');
    const gaugeNeedleTypeEl = document.getElementById('gaugeNeedleType');
    const gaugeAnimMsEl = document.getElementById('gaugeAnimMs');
    const gaugeMajorTicksEl = document.getElementById('gaugeMajorTicks');
    const gaugeMinorTicksEl = document.getElementById('gaugeMinorTicks');
    const gaugeHighlightEl = document.getElementById('gaugeHighlight');
    const gaugeHighlightVal = document.getElementById('gaugeHighlightVal');
    const gaugeShowBordersEl = document.getElementById('gaugeShowBorders');
    const gaugeShowUnitsEl = document.getElementById('gaugeShowUnits');

    const simpleGaugeAdvanced = document.getElementById('simpleGaugeAdvanced');
    const sgThicknessEl = document.getElementById('sgThickness');
    const sgDisplayEl = document.getElementById('sgDisplay');
    const sgWarnEl = document.getElementById('sgWarn');
    const sgCritEl = document.getElementById('sgCrit');

    const barAdvanced = document.getElementById('barAdvanced');
    const barOrientEl = document.getElementById('barOrient');
    const barCornerEl = document.getElementById('barCorner');
    const barOpacityEl = document.getElementById('barOpacity');
    const barOpacityVal = document.getElementById('barOpacityVal');
    const barShowValueEl = document.getElementById('barShowValue');
    const barShowGridOptEl = document.getElementById('barShowGridOpt');

    const levelAdvanced = document.getElementById('levelAdvanced');
    const lvlDisplayEl = document.getElementById('lvlDisplay');
    const lvlBarHeightEl = document.getElementById('lvlBarHeight');
    const lvlWarnEl = document.getElementById('lvlWarn');
    const lvlCritEl = document.getElementById('lvlCrit');

    const statusAdvanced = document.getElementById('statusAdvanced');
    const stOkEl = document.getElementById('stOk');
    const stWarnEl = document.getElementById('stWarn');
    const stCritEl = document.getElementById('stCrit');
    const stLabelOffEl = document.getElementById('stLabelOff');
    const stLabelOkEl = document.getElementById('stLabelOk');
    const stLabelWarnEl = document.getElementById('stLabelWarn');
    const stLabelCritEl = document.getElementById('stLabelCrit');

    const valueAdvanced = document.getElementById('valueAdvanced');
    const valFontSizeEl = document.getElementById('valFontSize');
    const valAlignEl = document.getElementById('valAlign');
    const valPrefixEl = document.getElementById('valPrefix');
    const valGlowEl = document.getElementById('valGlow');

    const consoleAdvanced = document.getElementById('consoleAdvanced');
    const conMaxLinesEl = document.getElementById('conMaxLines');
    const conFontSizeEl = document.getElementById('conFontSize');
    const conSourceEl = document.getElementById('conSource');
    const conShowTsEl = document.getElementById('conShowTs');
    const conAutoScrollEl = document.getElementById('conAutoScroll');
    const conWrapEl = document.getElementById('conWrap');

    const confirmAdd = document.getElementById('confirmAdd');
    const cancelAdd = document.getElementById('cancelAdd');
    const closeAdd = document.getElementById('closeAdd');

    let isPaused = false;
    let isEditMode = false;
    let editingId = null; // when not null we're editing a widget
    let dataHistory = [];
    let widgets = [];
    let isConnected = false;
    let savedPort = null;
    let savedBaud = '115200';

    const MAX_POINTS = 50;
    const DEFAULT_COLOR = '#3b82f6';

    const TYPE_CAPS = {
        line:          { channel: true,  range: false, units: false, decimals: false, color: true  },
        gauge:         { channel: true,  range: true,  units: true,  decimals: false, color: true  },
        'simple-gauge':{ channel: true,  range: true,  units: false, decimals: false, color: true  },
        bar:           { channel: true,  range: true,  units: false, decimals: false, color: true  },
        level:         { channel: true,  range: true,  units: false, decimals: false, color: true  },
        status:        { channel: true,  range: false, units: false, decimals: false, color: false },
        text:          { channel: false, range: false, units: false, decimals: false, color: true  },
        value:         { channel: true,  range: false, units: true,  decimals: true,  color: true  },
        console:       { channel: true,  range: false, units: false, decimals: false, color: false }
    };

    function openModal() { widgetModal.classList.add('open'); }
    function closeModal() { widgetModal.classList.remove('open'); editingId = null; }

    function setStatus(text) {
        if (!statusEl) return;
        if (statusTextEl) statusTextEl.textContent = text;
        const isConnected = /connected/i.test(text) && !/dis/i.test(text);
        statusEl.classList.toggle('status-connected', isConnected);
        statusEl.classList.toggle('status-disconnected', !isConnected);
    }

    function updateEmptyState() {
        if (!emptyStateEl) return;
        emptyStateEl.style.display = widgets.length === 0 ? 'block' : 'none';
    }

    // --- Interact.js Initialization ---
    interact('.widget').resizable({
        edges: { right: true, bottom: true },
        listeners: {
            move(event) {
                let target = event.target;
                let x = (parseFloat(target.getAttribute('data-x')) || 0);
                let y = (parseFloat(target.getAttribute('data-y')) || 0);
                target.style.width = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';
                x += event.deltaRect.left; y += event.deltaRect.top;
                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x); target.setAttribute('data-y', y);
                const widgetObj = widgets.find(w => w.id === target.id);
                if (widgetObj && widgetObj.resize) { widgetObj.resize(); }
            },
            end(event) { saveState(); }
        },
        modifiers: [interact.modifiers.restrictSize({ min: { width: 200, height: 150 } })],
        enabled: false
    }).draggable({
        listeners: {
            move(event) {
                let target = event.target;
                let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x); target.setAttribute('data-y', y);
            },
            end(event) { saveState(); }
        },
        inertia: true, enabled: false
    });

    // Load state
    const previousState = vscode.getState();
    if (previousState && previousState.widgets) {
        previousState.widgets.forEach(w => addWidget(w));
    }
    if (previousState && previousState.conn) {
        savedPort = previousState.conn.port || null;
        savedBaud = previousState.conn.baud || '115200';
        if (baudSelect && savedBaud) baudSelect.value = String(savedBaud);
    }
    updateEmptyState();

    // Ask extension for port list
    vscode.postMessage({ command: 'listPorts' });

    // --- Message Handling ---
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'update':
                if (!isPaused) { dataHistory.push(message.data); updateWidgets(message.data); }
                break;
            case 'status': setStatus(message.text); break;
            case 'ports': renderPorts(message.ports || []); break;
            case 'connectionState': setConnectionState(!!message.connected); break;
        }
    });

    // --- Connection UI ---
    function renderPorts(ports) {
        if (!portSelect) return;
        const currentValue = portSelect.value || savedPort;
        portSelect.innerHTML = '';
        if (!ports.length) {
            const opt = document.createElement('option');
            opt.value = ''; opt.textContent = 'No ports available';
            portSelect.appendChild(opt);
            portSelect.disabled = true;
            connectBtn.disabled = true;
            return;
        }
        portSelect.disabled = false;
        connectBtn.disabled = false;
        ports.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.path;
            opt.textContent = p.manufacturer ? `${p.path} — ${p.manufacturer}` : p.path;
            portSelect.appendChild(opt);
        });
        if (currentValue && ports.some(p => p.path === currentValue)) {
            portSelect.value = currentValue;
        }
    }

    function setConnectionState(connected) {
        isConnected = connected;
        if (!connectBtn) return;
        const label = connectBtn.querySelector('span');
        if (label) label.textContent = connected ? 'Disconnect' : 'Connect';
        connectBtn.classList.toggle('is-connected', connected);
        if (portSelect) portSelect.disabled = connected || portSelect.options.length === 0 || portSelect.value === '';
        if (baudSelect) baudSelect.disabled = connected;
        if (refreshPortsBtn) refreshPortsBtn.disabled = connected;
    }

    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            if (isConnected) {
                vscode.postMessage({ command: 'disconnect' });
            } else {
                const port = portSelect && portSelect.value;
                const baud = parseInt(baudSelect && baudSelect.value) || 9600;
                if (!port) {
                    vscode.postMessage({ command: 'alert', text: 'Please select a serial port.' });
                    return;
                }
                savedPort = port; savedBaud = String(baud);
                saveState();
                setStatus(`Connecting to ${port}…`);
                vscode.postMessage({ command: 'connect', port, baud });
            }
        });
    }
    if (refreshPortsBtn) {
        refreshPortsBtn.addEventListener('click', () => vscode.postMessage({ command: 'listPorts' }));
    }
    if (portSelect) {
        portSelect.addEventListener('change', () => { savedPort = portSelect.value; saveState(); });
    }
    if (baudSelect) {
        baudSelect.addEventListener('change', () => { savedBaud = baudSelect.value; saveState(); });
    }

    // --- Toolbar Actions ---
    addBtn.addEventListener('click', () => {
        openWidgetModal('add');
    });
    widgetTypeSelect.addEventListener('change', updateModalFields);

    function updateModalFields() {
        const type = widgetTypeSelect.value;
        const caps = TYPE_CAPS[type] || {};
        const isText = type === 'text';
        const isLine = type === 'line';
        channelLabel.style.display = caps.channel ? '' : 'none';
        rangeLabel.style.display = caps.range ? '' : 'none';
        unitsLabel.style.display = caps.units ? '' : 'none';
        decimalsLabel.style.display = caps.decimals ? '' : 'none';
        colorLabel.style.display = caps.color ? '' : 'none';
        styleLabel.style.display = isText ? '' : 'none';
        if (textSizeRow) textSizeRow.style.display = isText ? '' : 'none';
        if (textFormatRow) textFormatRow.style.display = isText ? '' : 'none';
        if (colorFieldLabel) colorFieldLabel.textContent = isText ? 'Text Color' : 'Accent Color';
        if (lineAdvanced) lineAdvanced.style.display = isLine ? '' : 'none';
        if (gaugeAdvanced) gaugeAdvanced.style.display = type === 'gauge' ? '' : 'none';
        if (simpleGaugeAdvanced) simpleGaugeAdvanced.style.display = type === 'simple-gauge' ? '' : 'none';
        if (barAdvanced) barAdvanced.style.display = type === 'bar' ? '' : 'none';
        if (levelAdvanced) levelAdvanced.style.display = type === 'level' ? '' : 'none';
        if (statusAdvanced) statusAdvanced.style.display = type === 'status' ? '' : 'none';
        if (valueAdvanced) valueAdvanced.style.display = type === 'value' ? '' : 'none';
        if (consoleAdvanced) consoleAdvanced.style.display = type === 'console' ? '' : 'none';
    }

    if (lineYModeEl) {
        lineYModeEl.addEventListener('change', () => {
            if (lineYRangeEl) lineYRangeEl.style.display = lineYModeEl.value === 'manual' ? '' : 'none';
        });
    }
    if (lineTensionEl && lineTensionVal) {
        lineTensionEl.addEventListener('input', () => { lineTensionVal.textContent = parseFloat(lineTensionEl.value).toFixed(2); });
    }
    if (gaugeHighlightEl && gaugeHighlightVal) {
        gaugeHighlightEl.addEventListener('input', () => { gaugeHighlightVal.textContent = gaugeHighlightEl.value; });
    }
    if (barOpacityEl && barOpacityVal) {
        barOpacityEl.addEventListener('input', () => { barOpacityVal.textContent = parseFloat(barOpacityEl.value).toFixed(2); });
    }

    function setFormatToggle(fmt, on) {
        if (!fmtButtons) return;
        fmtButtons.forEach(b => {
            if (b.getAttribute('data-fmt') === fmt) b.classList.toggle('active', !!on);
        });
    }
    function getFormatToggle(fmt) {
        if (!fmtButtons) return false;
        const b = Array.from(fmtButtons).find(x => x.getAttribute('data-fmt') === fmt);
        return b ? b.classList.contains('active') : false;
    }
    fmtButtons.forEach(b => {
        b.addEventListener('click', () => b.classList.toggle('active'));
    });

    function setSelectedSwatch(color) {
        if (!swatchRow) return;
        swatchRow.querySelectorAll('.swatch').forEach(s => {
            s.classList.toggle('selected', s.getAttribute('data-color') === color);
        });
    }

    if (swatchRow) {
        swatchRow.addEventListener('click', (e) => {
            const sw = e.target.closest('.swatch');
            if (!sw) return;
            const color = sw.getAttribute('data-color');
            widgetColorEl.value = color;
            setSelectedSwatch(color);
        });
    }
    if (widgetColorEl) {
        widgetColorEl.addEventListener('input', () => setSelectedSwatch(widgetColorEl.value));
    }

    function openWidgetModal(mode, w) {
        editingId = mode === 'edit' && w ? w.id : null;
        modalTitleEl.textContent = editingId ? 'Edit Widget' : 'Add New Widget';
        confirmAdd.textContent = editingId ? 'Save' : 'Add Widget';
        typeLabel.style.display = editingId ? 'none' : ''; // lock type when editing

        const defaults = {
            type: 'line', channel: 0, title: '',
            min: 0, max: 100, color: DEFAULT_COLOR, units: '', decimals: 2,
            style: 'normal',
            fontSize: 14, textAlign: 'left',
            isBold: false, isItalic: false, isUnderline: false,
            lineWidth: 2, lineStyle: 'solid', tension: 0.25, maxPoints: 50,
            yMode: 'auto', yMin: 0, yMax: 100,
            fill: true, showPoints: false, stepped: false,
            showGrid: true, showLegend: false, showXAxis: false,
            gaugeNeedleType: 'arrow', gaugeAnimMs: 500,
            gaugeMajorTicks: 6, gaugeMinorTicks: 2,
            gaugeHighlight: 80, gaugeShowBorders: false, gaugeShowUnits: true,
            sgThickness: 10, sgDisplay: 'percent', sgWarn: 60, sgCrit: 80,
            barOrient: 'horizontal', barCorner: 6, barOpacity: 0.55,
            barShowValue: true, barShowGridOpt: true,
            lvlDisplay: 'percent', lvlBarHeight: 36, lvlWarn: 60, lvlCrit: 80,
            stOk: 0, stWarn: 50, stCrit: 80,
            stLabelOff: 'OFF', stLabelOk: 'OK', stLabelWarn: 'WARNING', stLabelCrit: 'CRITICAL',
            valFontSize: 48, valAlign: 'center', valPrefix: '', valGlow: true,
            conMaxLines: 200, conFontSize: 12, conSource: 'raw',
            conShowTs: true, conAutoScroll: true, conWrap: false
        };
        const src = editingId ? { ...defaults, ...w } : defaults;

        widgetTypeSelect.value = src.type;
        document.getElementById('widgetChannel').value = src.channel ?? 0;
        document.getElementById('widgetTitle').value = src.title || '';
        document.getElementById('widgetStyle').value = src.style || 'normal';
        widgetMinEl.value = src.min ?? 0;
        widgetMaxEl.value = src.max ?? 100;
        widgetUnitsEl.value = src.units || '';
        widgetDecimalsEl.value = src.decimals ?? 2;
        const isTextType = src.type === 'text';
        const defaultColor = isTextType ? (src.color || 'var(--vscode-foreground)') : DEFAULT_COLOR;
        const color = src.color || (isTextType ? DEFAULT_COLOR : DEFAULT_COLOR);
        widgetColorEl.value = color;
        setSelectedSwatch(color);
        if (widgetFontSizeEl) widgetFontSizeEl.value = src.fontSize ?? 14;
        if (widgetAlignEl) widgetAlignEl.value = src.textAlign || 'left';
        setFormatToggle('bold', !!src.isBold);
        setFormatToggle('italic', !!src.isItalic);
        setFormatToggle('underline', !!src.isUnderline);

        if (lineWidthEl) lineWidthEl.value = src.lineWidth ?? 2;
        if (lineStyleEl) lineStyleEl.value = src.lineStyle || 'solid';
        if (lineTensionEl) lineTensionEl.value = src.tension ?? 0.25;
        if (lineTensionVal) lineTensionVal.textContent = (src.tension ?? 0.25).toFixed(2);
        if (lineMaxPointsEl) lineMaxPointsEl.value = src.maxPoints ?? 50;
        if (lineYModeEl) lineYModeEl.value = src.yMode || 'auto';
        if (lineYMinEl) lineYMinEl.value = src.yMin ?? 0;
        if (lineYMaxEl) lineYMaxEl.value = src.yMax ?? 100;
        if (lineYRangeEl) lineYRangeEl.style.display = (src.yMode === 'manual') ? '' : 'none';
        if (lineFillEl) lineFillEl.checked = src.fill !== false;
        if (lineShowPointsEl) lineShowPointsEl.checked = !!src.showPoints;
        if (lineSteppedEl) lineSteppedEl.checked = !!src.stepped;
        if (lineShowGridEl) lineShowGridEl.checked = src.showGrid !== false;
        if (lineShowLegendEl) lineShowLegendEl.checked = !!src.showLegend;
        if (lineShowXAxisEl) lineShowXAxisEl.checked = !!src.showXAxis;

        if (gaugeNeedleTypeEl) gaugeNeedleTypeEl.value = src.gaugeNeedleType || 'arrow';
        if (gaugeAnimMsEl) gaugeAnimMsEl.value = src.gaugeAnimMs ?? 500;
        if (gaugeMajorTicksEl) gaugeMajorTicksEl.value = src.gaugeMajorTicks ?? 6;
        if (gaugeMinorTicksEl) gaugeMinorTicksEl.value = src.gaugeMinorTicks ?? 2;
        if (gaugeHighlightEl) gaugeHighlightEl.value = src.gaugeHighlight ?? 80;
        if (gaugeHighlightVal) gaugeHighlightVal.textContent = String(src.gaugeHighlight ?? 80);
        if (gaugeShowBordersEl) gaugeShowBordersEl.checked = !!src.gaugeShowBorders;
        if (gaugeShowUnitsEl) gaugeShowUnitsEl.checked = src.gaugeShowUnits !== false;

        if (sgThicknessEl) sgThicknessEl.value = src.sgThickness ?? 10;
        if (sgDisplayEl) sgDisplayEl.value = src.sgDisplay || 'percent';
        if (sgWarnEl) sgWarnEl.value = src.sgWarn ?? 60;
        if (sgCritEl) sgCritEl.value = src.sgCrit ?? 80;

        if (barOrientEl) barOrientEl.value = src.barOrient || 'horizontal';
        if (barCornerEl) barCornerEl.value = src.barCorner ?? 6;
        if (barOpacityEl) barOpacityEl.value = src.barOpacity ?? 0.55;
        if (barOpacityVal) barOpacityVal.textContent = (src.barOpacity ?? 0.55).toFixed(2);
        if (barShowValueEl) barShowValueEl.checked = src.barShowValue !== false;
        if (barShowGridOptEl) barShowGridOptEl.checked = src.barShowGridOpt !== false;

        if (lvlDisplayEl) lvlDisplayEl.value = src.lvlDisplay || 'percent';
        if (lvlBarHeightEl) lvlBarHeightEl.value = src.lvlBarHeight ?? 36;
        if (lvlWarnEl) lvlWarnEl.value = src.lvlWarn ?? 60;
        if (lvlCritEl) lvlCritEl.value = src.lvlCrit ?? 80;

        if (stOkEl) stOkEl.value = src.stOk ?? 0;
        if (stWarnEl) stWarnEl.value = src.stWarn ?? 50;
        if (stCritEl) stCritEl.value = src.stCrit ?? 80;
        if (stLabelOffEl) stLabelOffEl.value = src.stLabelOff || 'OFF';
        if (stLabelOkEl) stLabelOkEl.value = src.stLabelOk || 'OK';
        if (stLabelWarnEl) stLabelWarnEl.value = src.stLabelWarn || 'WARNING';
        if (stLabelCritEl) stLabelCritEl.value = src.stLabelCrit || 'CRITICAL';

        if (valFontSizeEl) valFontSizeEl.value = src.valFontSize ?? 48;
        if (valAlignEl) valAlignEl.value = src.valAlign || 'center';
        if (valPrefixEl) valPrefixEl.value = src.valPrefix || '';
        if (valGlowEl) valGlowEl.checked = src.valGlow !== false;

        if (conMaxLinesEl) conMaxLinesEl.value = src.conMaxLines ?? 200;
        if (conFontSizeEl) conFontSizeEl.value = src.conFontSize ?? 12;
        if (conSourceEl) conSourceEl.value = src.conSource || 'raw';
        if (conShowTsEl) conShowTsEl.checked = src.conShowTs !== false;
        if (conAutoScrollEl) conAutoScrollEl.checked = src.conAutoScroll !== false;
        if (conWrapEl) conWrapEl.checked = !!src.conWrap;

        updateModalFields();
        openModal();
    }

    clearBtn.addEventListener('click', () => { dataHistory = []; widgets.forEach(w => w.clear()); });
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        const label = pauseBtn.querySelector('span');
        if (label) label.textContent = isPaused ? 'Resume' : 'Pause';
        pauseBtn.classList.toggle('active', isPaused);
    });
    exportBtn.addEventListener('click', () => {
        if (dataHistory.length === 0) {
            vscode.postMessage({ command: 'alert', text: 'No data to export!' });
            return;
        }
        const maxChannels = Math.max(...dataHistory.map(d => d.channels.length));
        const headers = ['Timestamp', ...Array.from({length: maxChannels}, (_, i) => `Channel_${i}`), 'Raw'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + dataHistory.map(d => {
            const channels = Array.from({length: maxChannels}, (_, i) => d.channels[i] ?? '');
            return `${new Date(d.timestamp).toISOString()},${channels.join(',')},"${d.raw.replace(/"/g, '""')}"`;
        }).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `serial_data_${Date.now()}.csv`);
        link.click();
    });
    editBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        const label = editBtn.querySelector('span');
        if (label) label.textContent = isEditMode ? 'Done' : 'Edit Layout';
        editBtn.classList.toggle('active', isEditMode);
        document.querySelectorAll('.widget').forEach(el => el.classList.toggle('edit-mode', isEditMode));
        interact('.widget').resizable(isEditMode);
        interact('.widget').draggable(isEditMode);
    });

    // --- Fullscreen ---
    // Two modes:
    //   'panel'  — hide only dashboard chrome (header + toolbar). Native requestFullscreen on webview.
    //   'vscode' — also hide VS Code chrome via Zen Mode + OS-level fullscreen (extension side).
    let fsMode = null; // null | 'panel' | 'vscode'

    function applyPanelChrome(hide) {
        document.body.classList.toggle('fullscreen-mode', hide);
        widgets.forEach(w => w.resize && w.resize());
    }

    function enterFullscreen(mode) {
        fsMode = mode;
        applyPanelChrome(true);
        if (mode === 'panel') {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        } else if (mode === 'vscode') {
            vscode.postMessage({ command: 'enterImmersive', osFullscreen: true });
        }
    }

    function exitFullscreen() {
        const mode = fsMode;
        fsMode = null;
        applyPanelChrome(false);
        if (mode === 'panel' && document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (mode === 'vscode') {
            vscode.postMessage({ command: 'exitImmersive', osFullscreen: true });
        }
    }

    if (fullscreenBtn) {
        // Shift/Alt-click → full VS Code immersive (Zen + OS fullscreen). Plain click → panel-only.
        fullscreenBtn.addEventListener('click', (e) => {
            if (fsMode) { exitFullscreen(); return; }
            const wantVscode = e.shiftKey || e.altKey;
            enterFullscreen(wantVscode ? 'vscode' : 'panel');
        });
        fullscreenBtn.title = 'Fullscreen — click: panel only  |  Shift/Alt+click: full VS Code (Zen Mode)';
    }
    if (exitFullscreenBtn) exitFullscreenBtn.addEventListener('click', exitFullscreen);

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && fsMode === 'panel') {
            fsMode = null;
            applyPanelChrome(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            if (fsMode) exitFullscreen(); else enterFullscreen(e.shiftKey ? 'vscode' : 'panel');
        }
        if (e.key === 'Escape' && fsMode) exitFullscreen();
    });

    // --- Modal Actions ---
    confirmAdd.addEventListener('click', () => {
        const type = widgetTypeSelect.value;
        const channel = parseInt(document.getElementById('widgetChannel').value);
        const style = document.getElementById('widgetStyle').value;
        const title = document.getElementById('widgetTitle').value || (type === 'text' ? 'Note' : `Channel ${channel}`);
        const min = parseFloat(widgetMinEl.value);
        const max = parseFloat(widgetMaxEl.value);
        const units = widgetUnitsEl.value;
        const decimals = parseInt(widgetDecimalsEl.value) || 0;
        const color = widgetColorEl.value || DEFAULT_COLOR;
        const fontSize = parseInt(widgetFontSizeEl && widgetFontSizeEl.value) || 14;
        const textAlign = (widgetAlignEl && widgetAlignEl.value) || 'left';
        const isBold = getFormatToggle('bold');
        const isItalic = getFormatToggle('italic');
        const isUnderline = getFormatToggle('underline');

        const lineWidth = parseFloat(lineWidthEl && lineWidthEl.value);
        const lineStyle = (lineStyleEl && lineStyleEl.value) || 'solid';
        const tension = parseFloat(lineTensionEl && lineTensionEl.value);
        const maxPoints = parseInt(lineMaxPointsEl && lineMaxPointsEl.value) || 50;
        const yMode = (lineYModeEl && lineYModeEl.value) || 'auto';
        const yMin = parseFloat(lineYMinEl && lineYMinEl.value);
        const yMax = parseFloat(lineYMaxEl && lineYMaxEl.value);
        const fill = !lineFillEl || lineFillEl.checked;
        const showPoints = !!(lineShowPointsEl && lineShowPointsEl.checked);
        const stepped = !!(lineSteppedEl && lineSteppedEl.checked);
        const showGrid = !lineShowGridEl || lineShowGridEl.checked;
        const showLegend = !!(lineShowLegendEl && lineShowLegendEl.checked);
        const showXAxis = !!(lineShowXAxisEl && lineShowXAxisEl.checked);

        const num = (el, fallback) => {
            const v = parseFloat(el && el.value);
            return isFinite(v) ? v : fallback;
        };
        const int = (el, fallback) => {
            const v = parseInt(el && el.value);
            return isFinite(v) ? v : fallback;
        };
        const txt = (el, fallback) => (el && el.value !== undefined && el.value !== null) ? el.value : fallback;
        const chk = (el, fallback) => el ? el.checked : fallback;

        const opts = {
            type, channel, title, style, min, max, units, decimals, color,
            fontSize, textAlign, isBold, isItalic, isUnderline,
            lineWidth: isFinite(lineWidth) ? lineWidth : 2,
            lineStyle,
            tension: isFinite(tension) ? tension : 0.25,
            maxPoints,
            yMode,
            yMin: isFinite(yMin) ? yMin : 0,
            yMax: isFinite(yMax) ? yMax : 100,
            fill, showPoints, stepped, showGrid, showLegend, showXAxis,
            gaugeNeedleType: txt(gaugeNeedleTypeEl, 'arrow'),
            gaugeAnimMs: int(gaugeAnimMsEl, 500),
            gaugeMajorTicks: int(gaugeMajorTicksEl, 6),
            gaugeMinorTicks: int(gaugeMinorTicksEl, 2),
            gaugeHighlight: int(gaugeHighlightEl, 80),
            gaugeShowBorders: chk(gaugeShowBordersEl, false),
            gaugeShowUnits: chk(gaugeShowUnitsEl, true),
            sgThickness: int(sgThicknessEl, 10),
            sgDisplay: txt(sgDisplayEl, 'percent'),
            sgWarn: int(sgWarnEl, 60),
            sgCrit: int(sgCritEl, 80),
            barOrient: txt(barOrientEl, 'horizontal'),
            barCorner: int(barCornerEl, 6),
            barOpacity: num(barOpacityEl, 0.55),
            barShowValue: chk(barShowValueEl, true),
            barShowGridOpt: chk(barShowGridOptEl, true),
            lvlDisplay: txt(lvlDisplayEl, 'percent'),
            lvlBarHeight: int(lvlBarHeightEl, 36),
            lvlWarn: int(lvlWarnEl, 60),
            lvlCrit: int(lvlCritEl, 80),
            stOk: num(stOkEl, 0),
            stWarn: num(stWarnEl, 50),
            stCrit: num(stCritEl, 80),
            stLabelOff: txt(stLabelOffEl, 'OFF'),
            stLabelOk: txt(stLabelOkEl, 'OK'),
            stLabelWarn: txt(stLabelWarnEl, 'WARNING'),
            stLabelCrit: txt(stLabelCritEl, 'CRITICAL'),
            valFontSize: int(valFontSizeEl, 48),
            valAlign: txt(valAlignEl, 'center'),
            valPrefix: txt(valPrefixEl, ''),
            valGlow: chk(valGlowEl, true),
            conMaxLines: int(conMaxLinesEl, 200),
            conFontSize: int(conFontSizeEl, 12),
            conSource: txt(conSourceEl, 'raw'),
            conShowTs: chk(conShowTsEl, true),
            conAutoScroll: chk(conAutoScrollEl, true),
            conWrap: chk(conWrapEl, false)
        };

        if (editingId) {
            const old = widgets.find(w => w.id === editingId);
            const el = document.getElementById(editingId);
            if (old && el) {
                opts.id = editingId;
                opts.type = old.type; // type is locked when editing
                opts.width = el.style.width;
                opts.height = el.style.height;
                opts.x = parseFloat(el.getAttribute('data-x')) || 0;
                opts.y = parseFloat(el.getAttribute('data-y')) || 0;
                opts.content = old.content;
                widgetGrid.removeChild(el);
                widgets = widgets.filter(w => w.id !== editingId);
            }
        }

        addWidget(opts);
        saveState();
        closeModal();
    });
    cancelAdd.addEventListener('click', closeModal);
    if (closeAdd) closeAdd.addEventListener('click', closeModal);
    widgetModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && widgetModal.classList.contains('open')) closeModal();
    });

    // --- Helpers for widget visuals ---
    function hexToRgba(hex, a) {
        const h = (hex || DEFAULT_COLOR).replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return `rgba(${r},${g},${b},${a})`;
    }
    function scalePercent(val, min, max) {
        if (max === min) return 0;
        return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    }

    // --- Widget Logic ---
    function addWidget(opts) {
        const {
            type, channel, title, width, height, x, y,
            content, style,
            min = 0, max = 100, units = '', decimals = 2, color = DEFAULT_COLOR,
            fontSize = 14, textAlign = 'left',
            isBold = false, isItalic = false, isUnderline = false,
            lineWidth = 2, lineStyle = 'solid', tension = 0.25, maxPoints = 50,
            yMode = 'auto', yMin = 0, yMax = 100,
            fill = true, showPoints = false, stepped = false,
            showGrid = true, showLegend = false, showXAxis = false,
            gaugeNeedleType = 'arrow', gaugeAnimMs = 500,
            gaugeMajorTicks = 6, gaugeMinorTicks = 2,
            gaugeHighlight = 80, gaugeShowBorders = false, gaugeShowUnits = true,
            sgThickness = 10, sgDisplay = 'percent', sgWarn = 60, sgCrit = 80,
            barOrient = 'horizontal', barCorner = 6, barOpacity = 0.55,
            barShowValue = true, barShowGridOpt = true,
            lvlDisplay = 'percent', lvlBarHeight = 36, lvlWarn = 60, lvlCrit = 80,
            stOk = 0, stWarn = 50, stCrit = 80,
            stLabelOff = 'OFF', stLabelOk = 'OK', stLabelWarn = 'WARNING', stLabelCrit = 'CRITICAL',
            valFontSize = 48, valAlign = 'center', valPrefix = '', valGlow = true,
            conMaxLines = 200, conFontSize = 12, conSource = 'raw',
            conShowTs = true, conAutoScroll = true, conWrap = false
        } = opts;
        const id = opts.id || 'widget-' + Date.now();
        const widgetEl = document.createElement('div');
        widgetEl.className = `widget widget-${type}` + (isEditMode ? ' edit-mode' : '');
        widgetEl.id = id;
        widgetEl.style.setProperty('--widget-accent', color);
        if (width) widgetEl.style.width = width;
        if (height) widgetEl.style.height = height;
        if (x || y) {
            widgetEl.style.transform = `translate(${x || 0}px, ${y || 0}px)`;
            widgetEl.setAttribute('data-x', x || 0); widgetEl.setAttribute('data-y', y || 0);
        }
        const headerTitle = type === 'text' ? title : `${title} (Ch ${channel})`;
        widgetEl.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">${headerTitle}</h3>
                <div class="widget-actions">
                    <button class="edit-btn icon-btn" title="Customize widget" aria-label="Customize widget">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="remove-btn" title="Remove">✕</button>
                </div>
            </div>
            <div class="widget-content" id="content-${id}"></div>
        `;
        widgetGrid.appendChild(widgetEl);
        const contentEl = document.getElementById(`content-${id}`);
        let widgetObj = {
            id, type, channel, title,
            update: () => {}, clear: () => {}, resize: () => {},
            content, style,
            min, max, units, decimals, color,
            fontSize, textAlign, isBold, isItalic, isUnderline,
            lineWidth, lineStyle, tension, maxPoints,
            yMode, yMin, yMax,
            fill, showPoints, stepped, showGrid, showLegend, showXAxis,
            gaugeNeedleType, gaugeAnimMs, gaugeMajorTicks, gaugeMinorTicks,
            gaugeHighlight, gaugeShowBorders, gaugeShowUnits,
            sgThickness, sgDisplay, sgWarn, sgCrit,
            barOrient, barCorner, barOpacity, barShowValue, barShowGridOpt,
            lvlDisplay, lvlBarHeight, lvlWarn, lvlCrit,
            stOk, stWarn, stCrit, stLabelOff, stLabelOk, stLabelWarn, stLabelCrit,
            valFontSize, valAlign, valPrefix, valGlow,
            conMaxLines, conFontSize, conSource, conShowTs, conAutoScroll, conWrap
        };

        if (type === 'line') {
            const canvas = document.createElement('canvas');
            contentEl.appendChild(canvas);
            const dash = lineStyle === 'dashed' ? [8, 4] : (lineStyle === 'dotted' ? [2, 4] : []);
            const yScale = {
                display: true,
                grid: { display: showGrid, color: 'rgba(128,128,128,0.12)' }
            };
            if (yMode === 'manual' && isFinite(yMin) && isFinite(yMax) && yMax > yMin) {
                yScale.min = yMin;
                yScale.max = yMax;
            }
            widgetObj.chart = new Chart(canvas.getContext('2d'), {
                type: 'line',
                data: { labels: [], datasets: [{
                    label: title, data: [],
                    borderColor: color, backgroundColor: hexToRgba(color, 0.15),
                    tension: tension, fill: !!fill,
                    pointRadius: showPoints ? 3 : 0,
                    pointHoverRadius: showPoints ? 5 : 0,
                    borderWidth: lineWidth,
                    borderDash: dash,
                    stepped: !!stepped
                }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 0 },
                    plugins: { legend: { display: !!showLegend } },
                    scales: {
                        x: { display: !!showXAxis, grid: { display: showGrid && showXAxis, color: 'rgba(128,128,128,0.12)' } },
                        y: yScale
                    }
                }
            });
            const limit = Math.max(5, Math.min(parseInt(maxPoints) || 50, 5000));
            widgetObj.update = (val, ts) => {
                const now = new Date(ts).toLocaleTimeString();
                widgetObj.chart.data.labels.push(now);
                widgetObj.chart.data.datasets[0].data.push(val);
                if (widgetObj.chart.data.labels.length > limit) {
                    widgetObj.chart.data.labels.shift(); widgetObj.chart.data.datasets[0].data.shift();
                }
                widgetObj.chart.update();
            };
            widgetObj.clear = () => { widgetObj.chart.data.labels = []; widgetObj.chart.data.datasets[0].data = []; widgetObj.chart.update(); };
            widgetObj.resize = () => { widgetObj.chart.resize(); };
        } else if (type === 'gauge') {
            const canvas = document.createElement('canvas');
            contentEl.appendChild(canvas);
            const range = max - min;
            const ticks = Math.max(2, gaugeMajorTicks);
            const tickStep = range / (ticks - 1);
            const fmtTick = (v) => {
                const s = (Math.round(v * 10) / 10).toString();
                return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
            };
            const majorTicks = Array.from({length: ticks}, (_, i) => fmtTick(min + tickStep * i));
            const highlightStart = min + range * (gaugeHighlight / 100);
            const css = getComputedStyle(document.documentElement);
            const cssVar = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
            const fg = cssVar('--vscode-foreground', '#e5e7eb');
            const muted = cssVar('--vscode-descriptionForeground', '#9ca3af');
            const plate = cssVar('--sd-surface', '#1e1e1e');
            const plateHi = cssVar('--sd-surface-hi', '#2a2a2a');
            widgetObj.gauge = new RadialGauge({
                renderTo: canvas, width: 200, height: 200,
                units: gaugeShowUnits ? (units || title) : '',
                minValue: min, maxValue: max,
                majorTicks, minorTicks: gaugeMinorTicks, strokeTicks: true,
                highlights: gaugeHighlight < 100
                    ? [{ from: highlightStart, to: max, color: hexToRgba('#ef4444', 0.75) }]
                    : [],
                colorPlate: plate, colorPlateEnd: plate,
                colorMajorTicks: fg, colorMinorTicks: muted,
                colorNumbers: fg, colorTitle: fg, colorUnits: muted,
                borderShadowWidth: 0, borders: !!gaugeShowBorders,
                colorBorderOuter: 'transparent', colorBorderOuterEnd: 'transparent',
                colorBorderMiddle: 'transparent', colorBorderMiddleEnd: 'transparent',
                colorBorderInner: 'transparent', colorBorderInnerEnd: 'transparent',
                needleType: gaugeNeedleType, needleWidth: 3,
                needleShadow: false,
                colorNeedle: color, colorNeedleEnd: color,
                colorNeedleCircleOuter: plateHi, colorNeedleCircleOuterEnd: plateHi,
                colorNeedleCircleInner: plate, colorNeedleCircleInnerEnd: plate,
                valueBox: true, colorValueText: fg,
                colorValueBoxBackground: plateHi,
                colorValueBoxRect: 'transparent', colorValueBoxRectEnd: 'transparent',
                colorValueBoxShadow: 'transparent',
                fontNumbersSize: 18, fontUnitsSize: 22, fontTitleSize: 22, fontValueSize: 30,
                animationRule: 'bounce', animationDuration: gaugeAnimMs
            }).draw();
            widgetObj.update = (val) => { widgetObj.gauge.value = val; };
            widgetObj.clear = () => { widgetObj.gauge.value = min; };
            widgetObj.resize = () => {
                const size = Math.min(contentEl.clientWidth, contentEl.clientHeight);
                widgetObj.gauge.update({ width: size, height: size });
            };
        } else if (type === 'simple-gauge') {
            const container = document.createElement('div');
            container.className = 'simple-gauge-container';
            const radius = 60; const circ = 2 * Math.PI * radius;
            container.innerHTML = `
                <svg class="simple-gauge-svg" viewBox="0 0 150 150" width="100%" height="100%">
                    <circle class="simple-gauge-track" cx="75" cy="75" r="${radius}" style="stroke-width: ${sgThickness};"></circle>
                    <circle class="simple-gauge-fill" cx="75" cy="75" r="${radius}" style="stroke-dasharray: ${circ}; stroke-dashoffset: ${circ}; stroke: ${color}; stroke-width: ${sgThickness};"></circle>
                </svg>
                <div class="simple-gauge-value">0%</div>
            `;
            contentEl.appendChild(container);
            const fill = container.querySelector('.simple-gauge-fill');
            const valueText = container.querySelector('.simple-gauge-value');
            widgetObj.update = (val) => {
                const percent = scalePercent(val, min, max);
                fill.style.strokeDashoffset = circ - (percent / 100) * circ;
                if (sgDisplay === 'value') {
                    valueText.textContent = (typeof val === 'number') ? val.toFixed(decimals) : '0';
                } else {
                    valueText.textContent = Math.round(percent) + '%';
                }
                fill.style.stroke = percent > sgCrit ? '#ef4444' : (percent > sgWarn ? '#f59e0b' : color);
            };
            widgetObj.clear = () => {
                fill.style.strokeDashoffset = circ;
                valueText.textContent = sgDisplay === 'value' ? (0).toFixed(decimals) : '0%';
            };
            widgetObj.resize = () => {
                const size = Math.min(contentEl.clientWidth, contentEl.clientHeight);
                container.style.width = size + 'px'; container.style.height = size + 'px';
            };
        } else if (type === 'bar') {
            const canvas = document.createElement('canvas');
            contentEl.appendChild(canvas);
            const isHoriz = barOrient !== 'vertical';
            const valueAxis = {
                min, max,
                grid: { display: !!barShowGridOpt, color: 'rgba(128,128,128,0.1)' }
            };
            const catAxis = { grid: { display: false } };
            widgetObj.chart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: { labels: [title], datasets: [{
                    label: title, data: [0],
                    backgroundColor: hexToRgba(color, barOpacity),
                    borderColor: color, borderWidth: 1, borderRadius: barCorner
                }] },
                options: {
                    indexAxis: isHoriz ? 'y' : 'x',
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: isHoriz
                        ? { x: valueAxis, y: catAxis }
                        : { x: catAxis, y: valueAxis }
                }
            });
            const valueLabel = document.createElement('div');
            valueLabel.className = 'bar-value-label';
            valueLabel.style.display = barShowValue ? '' : 'none';
            valueLabel.textContent = (0).toFixed(decimals);
            contentEl.appendChild(valueLabel);
            widgetObj.update = (val) => {
                widgetObj.chart.data.datasets[0].data[0] = val;
                widgetObj.chart.update();
                if (barShowValue) valueLabel.textContent = (typeof val === 'number' ? val.toFixed(decimals) : String(val)) + (units ? ' ' + units : '');
            };
            widgetObj.clear = () => {
                widgetObj.chart.data.datasets[0].data[0] = min;
                widgetObj.chart.update();
                valueLabel.textContent = (0).toFixed(decimals);
            };
            widgetObj.resize = () => { widgetObj.chart.resize(); };
        } else if (type === 'level') {
            const container = document.createElement('div');
            container.className = 'level-container';
            container.style.height = lvlBarHeight + 'px';
            const fill = document.createElement('div'); fill.className = 'level-fill';
            fill.style.background = `linear-gradient(90deg, ${color}, ${hexToRgba(color, 0.7)})`;
            container.appendChild(fill); contentEl.appendChild(container);
            const valueLabel = document.createElement('div');
            valueLabel.className = 'level-value';
            valueLabel.textContent = lvlDisplay === 'value' ? (0).toFixed(decimals) : '0%';
            contentEl.appendChild(valueLabel);
            widgetObj.update = (val) => {
                const percent = scalePercent(val, min, max);
                fill.style.width = percent + '%';
                if (lvlDisplay === 'value') {
                    valueLabel.textContent = (typeof val === 'number' ? val.toFixed(decimals) : String(val)) + (units ? ' ' + units : '');
                } else {
                    valueLabel.textContent = Math.round(percent) + '%';
                }
                if (percent > lvlCrit) fill.style.background = `linear-gradient(90deg, #ef4444, ${hexToRgba('#ef4444', 0.7)})`;
                else if (percent > lvlWarn) fill.style.background = `linear-gradient(90deg, #f59e0b, ${hexToRgba('#f59e0b', 0.7)})`;
                else fill.style.background = `linear-gradient(90deg, ${color}, ${hexToRgba(color, 0.7)})`;
            };
            widgetObj.clear = () => {
                fill.style.width = '0%';
                valueLabel.textContent = lvlDisplay === 'value' ? (0).toFixed(decimals) : '0%';
            };
        } else if (type === 'status') {
            const container = document.createElement('div');
            container.className = 'status-container';
            const led = document.createElement('div'); led.className = 'led';
            const text = document.createElement('div'); text.className = 'status-text'; text.textContent = stLabelOff;
            container.appendChild(led); container.appendChild(text); contentEl.appendChild(container);
            widgetObj.update = (val) => {
                led.className = 'led';
                if (val >= stCrit) { led.classList.add('status-red'); text.textContent = stLabelCrit; }
                else if (val >= stWarn) { led.classList.add('status-yellow'); text.textContent = stLabelWarn; }
                else if (val > stOk) { led.classList.add('status-green'); text.textContent = stLabelOk; }
                else { text.textContent = stLabelOff; }
            };
            widgetObj.clear = () => { led.className = 'led'; text.textContent = stLabelOff; };
        } else if (type === 'text') {
            const container = document.createElement('div'); container.className = 'text-widget-container';
            const toolbar = document.createElement('div'); toolbar.className = 'text-widget-toolbar';

            const mkToggle = (label, active, tip) => {
                const btn = document.createElement('button');
                btn.innerHTML = label;
                btn.title = tip;
                btn.className = 'tn-toggle' + (active ? ' active' : '');
                return btn;
            };
            const boldBtn = mkToggle('<b>B</b>', isBold, 'Bold');
            const italicBtn = mkToggle('<i>I</i>', isItalic, 'Italic');
            const underlineBtn = mkToggle('<u>U</u>', isUnderline, 'Underline');

            const sizeInput = document.createElement('input');
            sizeInput.type = 'number'; sizeInput.min = '8'; sizeInput.max = '96';
            sizeInput.value = fontSize; sizeInput.className = 'tn-size';
            sizeInput.title = 'Font size (px)';

            const colorInput = document.createElement('input');
            colorInput.type = 'color'; colorInput.value = color || DEFAULT_COLOR;
            colorInput.className = 'tn-color'; colorInput.title = 'Text color';

            toolbar.append(boldBtn, italicBtn, underlineBtn, sizeInput, colorInput);

            const textarea = document.createElement('textarea');
            textarea.className = 'text-note' + (style ? ` style-${style}` : '');
            textarea.placeholder = 'Type here...'; textarea.value = content || '';
            container.appendChild(toolbar); container.appendChild(textarea); contentEl.appendChild(container);

            const applyStyles = () => {
                textarea.style.fontSize = widgetObj.fontSize + 'px';
                textarea.style.textAlign = widgetObj.textAlign;
                textarea.style.fontWeight = widgetObj.isBold ? '700' : '';
                textarea.style.fontStyle = widgetObj.isItalic ? 'italic' : '';
                textarea.style.textDecoration = widgetObj.isUnderline ? 'underline' : '';
                textarea.style.color = widgetObj.color || '';
                boldBtn.classList.toggle('active', !!widgetObj.isBold);
                italicBtn.classList.toggle('active', !!widgetObj.isItalic);
                underlineBtn.classList.toggle('active', !!widgetObj.isUnderline);
            };
            widgetObj.content = content || '';
            applyStyles();

            boldBtn.addEventListener('click', () => { widgetObj.isBold = !widgetObj.isBold; applyStyles(); saveState(); });
            italicBtn.addEventListener('click', () => { widgetObj.isItalic = !widgetObj.isItalic; applyStyles(); saveState(); });
            underlineBtn.addEventListener('click', () => { widgetObj.isUnderline = !widgetObj.isUnderline; applyStyles(); saveState(); });
            sizeInput.addEventListener('input', () => {
                const v = parseInt(sizeInput.value) || 14;
                widgetObj.fontSize = Math.min(96, Math.max(8, v));
                applyStyles(); saveState();
            });
            colorInput.addEventListener('input', () => { widgetObj.color = colorInput.value; applyStyles(); saveState(); });

            textarea.addEventListener('input', () => { widgetObj.content = textarea.value; saveState(); });
            widgetObj.clear = () => { textarea.value = ''; widgetObj.content = ''; saveState(); };
        } else if (type === 'value') {
            const display = document.createElement('div');
            display.className = 'value-display';
            display.textContent = (valPrefix || '') + (0).toFixed(decimals);
            display.style.color = color;
            display.style.fontSize = valFontSize + 'px';
            display.style.textAlign = valAlign;
            display.style.textShadow = valGlow ? `0 2px 20px ${hexToRgba(color, 0.35)}` : 'none';
            contentEl.appendChild(display);
            let unitEl = null;
            if (units) {
                unitEl = document.createElement('div');
                unitEl.className = 'value-units';
                unitEl.textContent = units;
                unitEl.style.textAlign = valAlign;
                contentEl.appendChild(unitEl);
            }
            widgetObj.update = (val) => {
                display.textContent = (valPrefix || '') + val.toFixed(decimals);
            };
            widgetObj.clear = () => {
                display.textContent = (valPrefix || '') + (0).toFixed(decimals);
            };
        } else if (type === 'console') {
            const consoleEl = document.createElement('div'); consoleEl.className = 'console-display';
            consoleEl.style.fontSize = conFontSize + 'px';
            consoleEl.style.whiteSpace = conWrap ? 'pre-wrap' : 'pre';
            contentEl.appendChild(consoleEl);
            const lineLimit = Math.max(10, Math.min(parseInt(conMaxLines) || 200, 100000));
            const lines = [];
            widgetObj.update = (val, ts, raw) => {
                const ts1 = conShowTs ? `[${new Date(ts).toLocaleTimeString()}] ` : '';
                const payload = conSource === 'channel'
                    ? (typeof val === 'number' ? val.toFixed(decimals) : String(val ?? ''))
                    : raw;
                lines.push(ts1 + payload);
                if (lines.length > lineLimit) lines.splice(0, lines.length - lineLimit);
                consoleEl.textContent = lines.join('\n') + '\n';
                if (conAutoScroll) consoleEl.scrollTop = consoleEl.scrollHeight;
            };
            widgetObj.clear = () => { lines.length = 0; consoleEl.textContent = ''; };
        }

        widgetEl.querySelector('.remove-btn').addEventListener('click', () => {
            widgetGrid.removeChild(widgetEl);
            widgets = widgets.filter(w => w.id !== id);
            saveState();
            updateEmptyState();
        });
        const editBtnEl = widgetEl.querySelector('.edit-btn');
        if (editBtnEl) {
            editBtnEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const w = widgets.find(x => x.id === id);
                if (w) openWidgetModal('edit', w);
            });
        }
        widgets.push(widgetObj);
        updateEmptyState();
    }

    function updateWidgets(data) {
        widgets.forEach(w => {
            if (w.type !== 'text') {
                const val = data.channels[w.channel] ?? 0;
                w.update(val, data.timestamp, data.raw);
            }
        });
    }

    function saveState() {
        const state = {
            widgets: widgets.map(w => {
                const el = document.getElementById(w.id);
                return {
                    id: w.id, type: w.type, channel: w.channel, title: w.title,
                    width: el.style.width, height: el.style.height,
                    x: parseFloat(el.getAttribute('data-x')) || 0,
                    y: parseFloat(el.getAttribute('data-y')) || 0,
                    content: w.content, style: w.style,
                    min: w.min, max: w.max, units: w.units, decimals: w.decimals, color: w.color,
                    fontSize: w.fontSize, textAlign: w.textAlign,
                    isBold: w.isBold, isItalic: w.isItalic, isUnderline: w.isUnderline,
                    lineWidth: w.lineWidth, lineStyle: w.lineStyle, tension: w.tension, maxPoints: w.maxPoints,
                    yMode: w.yMode, yMin: w.yMin, yMax: w.yMax,
                    fill: w.fill, showPoints: w.showPoints, stepped: w.stepped,
                    showGrid: w.showGrid, showLegend: w.showLegend, showXAxis: w.showXAxis,
                    gaugeNeedleType: w.gaugeNeedleType, gaugeAnimMs: w.gaugeAnimMs,
                    gaugeMajorTicks: w.gaugeMajorTicks, gaugeMinorTicks: w.gaugeMinorTicks,
                    gaugeHighlight: w.gaugeHighlight, gaugeShowBorders: w.gaugeShowBorders,
                    gaugeShowUnits: w.gaugeShowUnits,
                    sgThickness: w.sgThickness, sgDisplay: w.sgDisplay, sgWarn: w.sgWarn, sgCrit: w.sgCrit,
                    barOrient: w.barOrient, barCorner: w.barCorner, barOpacity: w.barOpacity,
                    barShowValue: w.barShowValue, barShowGridOpt: w.barShowGridOpt,
                    lvlDisplay: w.lvlDisplay, lvlBarHeight: w.lvlBarHeight, lvlWarn: w.lvlWarn, lvlCrit: w.lvlCrit,
                    stOk: w.stOk, stWarn: w.stWarn, stCrit: w.stCrit,
                    stLabelOff: w.stLabelOff, stLabelOk: w.stLabelOk, stLabelWarn: w.stLabelWarn, stLabelCrit: w.stLabelCrit,
                    valFontSize: w.valFontSize, valAlign: w.valAlign, valPrefix: w.valPrefix, valGlow: w.valGlow,
                    conMaxLines: w.conMaxLines, conFontSize: w.conFontSize, conSource: w.conSource,
                    conShowTs: w.conShowTs, conAutoScroll: w.conAutoScroll, conWrap: w.conWrap
                };
            }),
            conn: { port: savedPort, baud: savedBaud }
        };
        vscode.setState(state);
    }
}());
