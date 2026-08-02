# Design System Specification: PawCare AI

```yaml
---
name: PawCare AI Design System
version: 1.0.0
description: A modern, non-AI-slop Dark Glassmorphism design system tailored for veterinary triage and pet emergency web apps.
theme: Hybrid Dark Glassmorphism
colors:
  canvas: "#121212"
  surface-card: "#181818"
  surface-glass: "rgba(24, 24, 24, 0.75)"
  border-glass: "rgba(255, 255, 255, 0.1)"
  
  # Brand Accents & Traffic Light Triage
  emerald-healthy: "#10b981"
  emerald-healthy-glow: "rgba(16, 185, 129, 0.2)"
  amber-warning: "#f59e0b"
  amber-warning-glow: "rgba(245, 158, 11, 0.2)"
  red-emergency: "#ef4444"
  red-emergency-glow: "rgba(239, 68, 68, 0.25)"
  
  # Typography Colors
  text-primary: "#ffffff"
  text-secondary: "#a1a1aa"
  text-muted: "#71717a"
  
typography:
  font-display: "'Outfit', 'Plus Jakarta Sans', sans-serif"
  font-body: "'Plus Jakarta Sans', system-ui, sans-serif"
  
radii:
  card: "16px"
  pill: "9999px"
  input: "12px"
---
```

---

## 1. Visual Theme & Atmosphere

**PawCare AI** uses a premium **Hybrid Dark Glassmorphism** design system. The base canvas is deep charcoal (`#121212`), allowing visual content (pet photos, status alert badges, and medical action cards) to stand out clearly.

The design philosophy balances **calm reassurance** for anxious pet owners with **high-tech precision** for AI analysis. Translucent frosted glass containers (`backdrop-filter: blur(12px)`) with subtle hairline borders (`rgba(255, 255, 255, 0.1)`) create depth and visual sophistication without clutter ("no AI slop").

---

## 2. Color Palette & Functional Roles

### Primary Floor & Canvas
* **Deep Charcoal Canvas** (`#121212`): Page background floor.
* **Glass Card Surface** (`rgba(24, 24, 24, 0.75)`): Main content containers with `backdrop-filter: blur(12px)`.
* **Elevated Card Surface** (`#1f1f23`): Input fields and interactive hover surfaces.

### Traffic Light Medical Triage Accents
* 🟢 **Emerald Healthy** (`#10b981`): Safe status, mild symptoms, positive action buttons.
* 🟡 **Amber Warning** (`#f59e0b`): Caution status, 24-hour observation badges, non-urgent alerts.
* 🔴 **Red Emergency** (`#ef4444`): Critical triage alert, emergency vet call buttons, warning callouts.

### Text & Hairlines
* **Primary Text** (`#ffffff`): Titles, main headings, critical data.
* **Secondary Text** (`#a1a1aa`): Body text, symptom descriptions, metadata.
* **Muted Text** (`#71717a`): Footers, timestamp captions.
* **Hairline Border** (`rgba(255, 255, 255, 0.1)`): Glass card outlines and divider lines.

---

## 3. Typography & Google Fonts

### Font Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Hierarchy
| Role | Font Family | Size | Weight | Line Height | Use |
|---|---|---|---|---|---|
| Display Hero | Outfit | 36px - 48px | 800 | 1.1 | Hero section main title |
| Section Heading | Outfit | 24px - 28px | 700 | 1.2 | Card headings, Triage Status |
| Subheading | Plus Jakarta Sans | 18px | 600 | 1.3 | Feature titles, Medical advice headers |
| Body Text | Plus Jakarta Sans | 15px - 16px | 400 | 1.5 | Symptom text, journal citations |
| Button Pill | Plus Jakarta Sans | 14px - 15px | 600 | 1.0 | Action buttons, CTA |
| Caption / Tag | Plus Jakarta Sans | 12px - 13px | 500 | 1.4 | Badges, timestamps, SINTA journal source |

---

## 4. Component Geometry & CSS Design Tokens

```css
:root {
  --bg-canvas: #121212;
  --bg-card-glass: rgba(24, 24, 24, 0.75);
  --bg-card-elevated: #1f1f23;
  --border-glass: rgba(255, 255, 255, 0.1);
  
  --color-green: #10b981;
  --color-green-glow: rgba(16, 185, 129, 0.2);
  --color-amber: #f59e0b;
  --color-amber-glow: rgba(245, 158, 11, 0.2);
  --color-red: #ef4444;
  --color-red-glow: rgba(239, 68, 68, 0.25);
  
  --font-display: 'Outfit', 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
  
  --radius-card: 16px;
  --radius-pill: 9999px;
  --radius-input: 12px;
  
  --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glassmorphism Card Style */
.glass-card {
  background: var(--bg-card-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-glass);
  padding: 24px;
  transition: var(--transition-smooth);
}

.glass-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Action Buttons */
.btn-pill {
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: var(--radius-pill);
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition-smooth);
}

.btn-primary {
  background: var(--color-green);
  color: #ffffff;
  box-shadow: 0 4px 14px var(--color-green-glow);
}

.btn-primary:hover {
  background: #059669;
  transform: scale(1.02);
}

.btn-emergency {
  background: var(--color-red);
  color: #ffffff;
  box-shadow: 0 4px 14px var(--color-red-glow);
}

.btn-emergency:hover {
  background: #dc2626;
  transform: scale(1.02);
}
```



---

## 7. Motion Design & Satisfying Micro-Animations Specification

To ensure PawCare AI feels dynamic, reactive, and non-static (inspired by top motion design practices), the UI includes four core animation layers:

### 1. Photo Medical Scanner Animation (AI Analysis Mode)
When a user uploads a pet photo, a glowing emerald scanner line slides up and down the photo image container:
```css
@keyframes scanline {
  0% { top: 0%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.scanner-line {
  position: absolute;
  left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-green), transparent);
  box-shadow: 0 0 15px var(--color-green);
  animation: scanline 2s infinite ease-in-out;
}
```

### 2. Emergency Alert Pulsating Glow (Red Alert Mode)
Critical triage cards pulse with a subtle red beacon glow to draw immediate focus:
```css
@keyframes emergencyPulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.card-emergency-pulse {
  animation: emergencyPulse 2s infinite;
  border-color: rgba(239, 68, 68, 0.6) !important;
}
```

### 3. Smooth Spring Slide-Up Reveal (Triage Results)
Analysis result cards smoothly slide up from the bottom with a spring easing curve:
```css
@keyframes slideUpSpring {
  0% { opacity: 0; transform: translateY(30px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.reveal-spring {
  animation: slideUpSpring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
```

### 4. Interactive Pill Button Bounce (Touch Feedback)
Pill buttons feature an elastic click/tap bounce for tactile touch feedback:
```css
.btn-pill:active {
  transform: scale(0.94);
}
```


