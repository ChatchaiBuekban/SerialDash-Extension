# Changelog

All notable changes to the **Serial Dash** extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **In-dashboard connection controls** — port + baud selectors and a Connect/Disconnect button live in the header. Command palette no longer prompts for them.
- **Refresh ports** button to re-scan available serial devices.
- **Last-used port and baud** persist across sessions via `vscode.setState`.
- **Fullscreen mode** with two variants:
  - Panel-only — hides dashboard chrome inside the webview.
  - Full VS Code — closes sidebar + panel, enters Zen Mode, toggles OS fullscreen (Shift/Alt + click).
  - Floating exit button plus `F11` / `Esc` shortcuts.
- **Per-widget customization** via a pencil icon in Edit Layout mode:
  - Min / Max range for gauges, bars, and level widgets
  - Units for radial gauge and value display
  - Decimal precision for value display
  - Accent color (6 preset swatches + custom color picker)
  - Title and channel updates without recreating the widget
- **Text Note customization** — font size, color, alignment (left/center/right/justify), bold/italic/underline toggles. Both in the modal and an inline toolbar on the widget when in edit mode.
- **Empty state** prompt when no widgets exist.
- Support for higher baud rates (230400, 460800, 921600).

### Changed
- **Modernized UI**: card-based widgets with soft shadows, rounded corners, hover elevation, and subtle gradients.
- **Header redesign** with a gradient brand mark and a pill-shaped status indicator that pulses green when connected, red when disconnected.
- **Toolbar** grouped into logical sections with inline SVG icons (Add/Edit vs Pause/Clear/Export vs Fullscreen).
- **Modal redesign** with backdrop blur, slide-up animation, sectioned header/body/actions, uppercase field labels, and focus rings.
- **Widget visuals**: glossy 3D LEDs, gradient level bars with value label, glowing simple-gauge ring, accent-colored value display, polished console with custom scrollbar.
- **Line chart** now renders with a soft filled area under the stroke and uses the widget's accent color.
- **Bar chart** gets rounded corners and honors configured min/max.
- **Text Note** widgets are no longer wrapped in a card — they render as plain notes with a dashed outline only in edit mode.
- Dashboard opens **standalone** (no pre-connect prompts). Connection is triggered from the UI.
- Default widgets (Channel 0 line + Channel 1 gauge) are no longer created on first open — the dashboard starts empty with the empty-state prompt.

### Removed
- Automatic pre-connect QuickPicks for port/baud on command invocation.

## [0.0.1] — Initial

### Added
- Initial extension scaffold with `serialdash.openDashboard` and `serialdash.setDelimiter` commands.
- Basic SerialManager with port listing, connect, and delimiter-based parsing.
- Webview dashboard with 9 widget types: line chart, radial gauge, simple gauge, horizontal bar, level bar, status LED, text note, value display, console.
- Drag + resize via interact.js.
- Pause, clear, and CSV export.
- State persistence for widget layout.
