# Universal UI/UX Design System Specification (`design-system.md`)

> **Version:** 2.1 (Mobile-First Minimalist & Calm Architecture)  
> **Target Devices:** Mobile Phones (320px – 430px), Tablets (768px – 1023px), Desktop (1024px+)  
> **Design Philosophy:** "Less, but better" — Minimal, Calm, Premium, Clean, Native, and Functional.  

> **Usage Note:** This design specification serves as the single source of truth for visual tokens, UI hierarchy, responsive rules, component specifications, and theme presets across the Seafarer NRI Seatime & Tax Calculator application.

---

## 1. Core Visual Principles & Design Philosophy

This application follows a mobile-first, content-focused design methodology inspired by the restraint and clarity of modern native applications (such as Apple Health, Things 3, and Linear).

### Key Guidelines:
* **Spacious Whitespace & Typography Hierarchy:** Content is grouped logically using consistent padding and subtle background contrast (`var(--app-recessed)`) rather than heavy decorative borders or nested card clutter.
* **Calm & Flexible Palette:** Built on custom CSS variables (`--app-bg`, `--app-surface`, `--app-recessed`, `--app-border`, `--app-text`, `--app-primary`, `--app-light-accent`) supporting 5 instant theme presets.
* **Subtle Elevation & Soft Shadows:** Replaces harsh neumorphic or heavy drop shadows with light, weightless cards (`box-shadow: 0 2px 8px rgba(0,0,0,0.03)`) and 1px crisp borders (`var(--app-border)`).
* **One Dominant CTA:** Every primary screen features a single dominant primary action button (`.btn-primary-cta`) to guide user attention.
* **Progressive Disclosure:** Secondary controls, detailed logs, export utilities, and transcript options recede visually until requested, keeping the primary workspace clean and focused.

---

## 2. Color Palette Tokens & Theme Presets

The application supports dynamic CSS theme switching via the `data-theme` attribute on the root document element:

```css
/* Core Color Tokens (Slate Green Default) */
:root, [data-theme="slate-green"] {
  --app-bg: #F7F9F8;             /* Canvas background */
  --app-surface: #FFFFFF;        /* Flat elevated card surface */
  --app-recessed: #F3F6F4;       /* Sunken inset container */
  --app-border: #E7ECE9;         /* Divider & card border */
  --app-text: #172033;           /* Primary text color (Dark Slate) */
  --app-muted: #667085;          /* Muted text color */
  --app-primary: #238B45;        /* Deep Forest Green accent */
  --app-primary-hover: #1E783B;  /* Active button hover green */
  --app-light-accent: #EAF7EE;   /* Soft mint tint for highlights */
  --overlay-bg: rgba(15, 20, 30, 0.45);
}
```

### Supported Theme Presets
Users can toggle theme presets in **Settings -> Design System & Appearance**:
1. **Slate Green (Default):** `#F7F9F8` canvas / `#238B45` forest green
2. **Emerald:** `#F2F9F5` canvas / `#059669` emerald green
3. **Indigo:** `#F8F9FC` canvas / `#4F46E5` indigo blue
4. **Warm Sand:** `#FAF8F5` canvas / `#15803D` green-sand
5. **Dark Night:** `#0F172A` dark slate canvas / `#22C55E` bright green

---

## 3. Typography System & Typeface Pairings

The design system provides 5 selectable font pairings configurable via CSS utility classes:

```
├── Plus Jakarta Sans (.font-jakarta) ── Default: Modern geometric body & display
├── Inter (.font-inter) ─────────────── High readability, clean UI standard
├── System Sans (.font-system) ──────── Native OS font stack (-apple-system, BlinkMacSystemFont)
├── Playfair Display (.font-playfair) ── Elegant serif display headers
└── JetBrains Mono (.font-mono-jb) ───── High-precision numbers, timers & dates
```

### Type Scale Matrix
* **Primary Metric Headline:** `28px – 32px`, Font Weight: 900 (Black)
* **Screen Title (H1):** `20px – 22px`, Font Weight: 800 (Extrabold)
* **Section Title (H2):** `14px – 16px`, Font Weight: 700 (Bold)
* **Body Text:** `14px`, Line Height: 1.5, Font Weight: 400 – 500
* **Secondary Labels:** `12px – 13px`, Color: `var(--app-muted)`
* **Micro Labels & Subtitles:** `10px – 11px`, Uppercase tracking: `0.05em`

### Font Scale Adjuster
Supports dynamic scaling via `fontScale` setting multiplier (Range: `0.85x` to `1.25x`), ensuring high accessibility for all users onboard vessels or in low-visibility environments.

---

## 4. Spacing System & Border Radius Hierarchy

### Spacing Scale
All margins, padding, and gaps follow a strict 4pt grid: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`.

* **Screen Outer Padding:** `16px` (Mobile) / `24px` - `32px` (Desktop `max-w-7xl`)
* **Section Gap:** `16px` to `20px`
* **Card Inner Padding:** `16px` to `20px`
* **Control Gap:** `8px` to `12px`

### Radius Hierarchy
* **Outer Cards & Modals:** `20px` (`rounded-[20px]` / `.app-card`)
* **Inner Containers / Insets:** `16px` (`rounded-2xl` / `.app-recessed`)
* **Buttons & Form Inputs:** `12px` (`rounded-xl` / `.btn-primary-cta`)
* **Pill Badges & Chips:** `9999px` (`rounded-full`)

---

## 5. Responsive Layout Architecture

### Mobile Phone (320px – 430px)
- **Header:** Compact header bar with title, profile selector, and quick actions (`min-h-[44px]`).
- **Bottom Navigation:** Fixed bottom bar with 5 primary destinations (`Dashboard`, `Sailing Log`, `NRI Status`, `FY Overview`, `More`). Touch targets: `44px+`.
- **Vertical Scroll:** Single-column flow with zero horizontal page overflow.

### Tablet & Desktop (768px+)
- **Sidebar Navigation:** Collapsible left sidebar (`md:w-20` icon mode, `lg:w-64` expanded mode) with clear active tab highlight.
- **Grid Layout:** Responsive multi-column layout adapting up to `max-w-7xl` with spacious grid gaps (`gap-6`).

---

## 6. Component Specifications

### A. Primary CTA Button (`.btn-primary-cta`)
- **Background:** `var(--app-primary)`
- **Text:** `#FFFFFF`, Semibold, 14px
- **Height:** `44px` - `48px`
- **Radius:** `16px` (`rounded-2xl`)
- **Interaction:** Scale feedback on press (`active:scale-98`), hover background transition (`var(--app-primary-hover)`).

### B. Circular NRI Status & Seatime Progress Ring
- **Dimensions:** `116px x 116px` or `140px x 140px`
- **Track Stroke:** `var(--app-light-accent)` (8px stroke)
- **Progress Stroke:** `var(--app-primary)` (8px stroke with smooth SVG stroke-dasharray)
- **Center Metric:** Displays completion percentage, days remaining, or tax exemption status.

### C. Selectable Chips & Filters
- **Selected State:** `var(--app-primary)` background, white text
- **Unselected State:** `var(--app-surface)` surface with `var(--app-border)` border
- **Height:** `36px` – `42px` with smooth horizontal scrolling on mobile.

### D. Cards & Insets (`.app-card` / `.app-recessed`)
- **Card Background:** `var(--app-surface)` (`#FFFFFF` or theme equivalent)
- **Inset Background:** `var(--app-recessed)` (`#F3F6F4` or theme equivalent)
- **Border:** `1px solid var(--app-border)`
- **Shadow:** `0 2px 8px rgba(0, 0, 0, 0.03)`

---

## 7. Touch Targets & Accessibility

- **Minimum Touch Area:** `44px x 44px` for all interactive elements.
- **WCAG AA Compliance:** Color contrast ratio >= 4.5:1 for all text.
- **Keyboard & Focus States:** Clear outline and border color transition on keyboard focus (`var(--app-primary)`).

---

## 8. Summary of Recent Design Updates

1. **Theme Preset System:** Integrated 5 color palettes into `index.css` and added theme switcher UI in `About.tsx`.
2. **Typography System:** Added 5 font pairings with selector controls and dynamic scaling support.
3. **Sea Time Transcript Modal:** Clean print-ready sea service summary modal inside `SailingLog.tsx`.
4. **Active Contract Tracker & NRI Predictor Widget:** Interactive contract duration tracker with real-time target projection inside `Dashboard.tsx`.
5. **Maritime Document Vault:** Document management tab inside `About.tsx` for tracking Passport, CDC, STCW certificates, and COP expiry.
