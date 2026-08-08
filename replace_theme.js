const fs = require('fs');
const glob = require('glob');

const cssVars = `
@import "tailwindcss";

@theme {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --color-app-bg: var(--app-bg);
  --color-app-fg: var(--app-fg);
  --color-panel-bg: var(--panel-bg);
  --color-panel-border: var(--panel-border);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-surface-hover: var(--surface-hover);
  --color-chart-primary: var(--chart-primary);
  --color-chart-secondary: var(--chart-secondary);
  --color-chart-text: var(--chart-text);
  --color-chart-grid: var(--chart-grid);
}

:root {
  color-scheme: light dark;
  
  --app-bg: #f1f5f9;
  --app-fg: #0f172a;
  --panel-bg: #ffffff;
  --panel-border: #cbd5e1;
  
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  
  --accent: #10b981;
  --accent-hover: #059669;
  --surface-hover: #e2e8f0;

  --chart-primary: #B27B00;
  --chart-secondary: #B27B00;
  --chart-text: #475569;
  --chart-grid: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --app-bg: #020617;
    --app-fg: #f8fafc;
    --panel-bg: #0f172a;
    --panel-border: #1e293b;
    
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    --accent: #10b981;
    --accent-hover: #34d399;
    --surface-hover: #1e293b;

    --chart-primary: #FAAD14;
    --chart-secondary: #B27B00;
    --chart-text: #8B95A5;
    --chart-grid: #1e293b;
  }
}

html, body, #root {
  background-color: var(--app-bg);
  color: var(--app-fg);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
.pt-safe { padding-top: max(0.5rem, env(safe-area-inset-top)); }
.table-responsive-container { width: 100%; overflow-x: auto; }
.safe-padding { padding-bottom: env(safe-area-inset-bottom); }

.modal-overlay {
  background-color: rgba(15, 23, 42, 0.45);
}
@media (prefers-color-scheme: dark) {
  .modal-overlay {
    background-color: rgba(2, 6, 23, 0.75);
  }
}

.btn-neu {
  box-shadow: 3px 3px 8px rgba(166, 175, 195, 0.5), -3px -3px 8px rgba(255, 255, 255, 0.9);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-neu:hover {
  box-shadow: 5px 5px 12px rgba(166, 175, 195, 0.6), -4px -4px 10px rgba(255, 255, 255, 1);
}
.btn-neu:active, .btn-neu.active {
  box-shadow: inset 2px 2px 5px rgba(166, 175, 195, 0.6), inset -2px -2px 5px rgba(255, 255, 255, 0.9);
}
@media (prefers-color-scheme: dark) {
  .btn-neu {
    box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.45), -2px -2px 6px rgba(255, 255, 255, 0.04);
  }
  .btn-neu:hover {
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.55), -3px -3px 8px rgba(255, 255, 255, 0.07);
  }
  .btn-neu:active, .btn-neu.active {
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.6), inset -2px -2px 4px rgba(255, 255, 255, 0.04);
  }
}

.btn-neu-primary {
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 3px 3px 10px rgba(225, 29, 72, 0.25), -3px -3px 8px rgba(255, 255, 255, 0.8);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-neu-primary:active {
  box-shadow: inset 2px 2px 5px rgba(150, 0, 30, 0.35), inset -2px -2px 4px rgba(255, 255, 255, 0.3);
}
@media (prefers-color-scheme: dark) {
  .btn-neu-primary {
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 3px 3px 10px rgba(225, 29, 72, 0.35), -2px -2px 6px rgba(255, 255, 255, 0.05);
  }
  .btn-neu-primary:hover {
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 5px 5px 14px rgba(225, 29, 72, 0.45), -3px -3px 8px rgba(255, 255, 255, 0.08);
  }
  .btn-neu-primary:active {
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(255, 255, 255, 0.1);
  }
}

/* Ensure smooth transitions on colors */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
`;
fs.writeFileSync('src/index.css', cssVars);
