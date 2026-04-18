# Piaso.ai — Design System

**Version:** 1.0  
**Date:** April 2026  
**Source:** Exported from Claude Design (`claude.ai/design`)

---

## 1. Brand identity

**Name:** Piaso.ai  
**Positioning:** Personal wealth clarity for India  
**Tagline:** *Am I okay this month?*  
**Logo:** ₹ glyph with growth arrow (Option A from design iteration) — `public/logo.svg`

### Core metaphors
- **Coin jar** (spend) — your salary cycle visualised as coins filling a jar. `public/coin-jar.svg`
- **Rising ₹** (invest) — rupee symbol with an upward growth arrow

---

## 2. Color tokens

All tokens defined in `frontend/app/globals.css` as CSS custom properties.

### Brand
| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#1B3A4B` | Deep Teal — headers, CTAs, primary actions |
| `--primary-light` | `#2D5F73` | Hover states, avatar bg |
| `--primary-dark` | `#122831` | Active states |
| `--brand-cyan` | `#00BAF2` | Accent, links |
| `--gold` | `#F5B800` | Coin jar, positive wealth accents |

### Health system (traffic light)
| State | Background token | Text token | Use |
|-------|-----------------|-----------|-----|
| Green | `--green-50` `#ECFDF5` | `--green-600` `#047857` | On track |
| Amber | `--amber-50` `#FFFBEB` | `--amber-600` `#92400E` | Watch |
| Red | `--red-50` `#FEF2F2` | `--red-600` `#991B1B` | At risk |
| Grey | `--grey-50` `#F1F5F9` | `--grey-600` `#475569` | No data |

Hero gradient backgrounds: `bg-health-{green|amber|red|grey}` CSS classes.

### Investment deltas
| Token | Value | Use |
|-------|-------|-----|
| `--gain` | `#059669` | Positive P&L, green numbers |
| `--gain-bg` | `#ECFDF5` | Background for gain cells |
| `--loss` | `#DC2626` | Negative P&L, red numbers |
| `--loss-bg` | `#FEF2F2` | Background for loss cells |

### Neutrals (warm)
| Token | Value | Use |
|-------|-------|-----|
| `--page-bg` | `#FAF9F6` | Warm ivory — app background |
| `--card-bg` | `#FFFFFF` | Cards, modals |
| `--ink-primary` | `#1A1A2E` | Primary text |
| `--ink-secondary` | `#4A5568` | Body text, descriptions |
| `--ink-muted` | `#94A3B8` | Labels, timestamps, placeholders |
| `--border` | `rgba(0,0,0,0.06)` | Card borders, dividers |

---

## 3. Typography

### Fonts
- **Display / hero amounts:** Fraunces (Google Fonts) — serif, used for all rupee amounts, hero headlines
- **Body / UI:** DM Sans (Google Fonts) — geometric sans, used for everything else

### Type scale
| Token | Size | Use |
|-------|------|-----|
| `--fs-micro` | 9px | Badge labels, uppercase micro |
| `--fs-meta` | 11px | Timestamps, metadata |
| `--fs-body` | 13px | Body text |
| `--fs-item` | 14px | Table rows, item names |
| `--fs-section` | 16px | Section headings, nav |
| `--fs-hero-s` | 20px | Secondary hero |
| `--fs-hero-m` | 24px | Sub-totals |
| `--fs-hero-l` | 32px | Primary hero amount |
| `--fs-display` | 48px | Landing page title |

### Rules
- All rupee amounts use `font-variant-numeric: tabular-nums` (`.tabular` class or `fontVariantNumeric: "tabular-nums"` inline)
- Hero amounts always use Fraunces: `fontFamily: "var(--font-fraunces), Fraunces, Georgia, serif"`
- Indian number formatting: `toLocaleString("en-IN")` — displays `23,45,000` not `2,345,000`
- Large amounts abbreviated: `≥1Cr` → `₹1.2Cr`, `≥1L` → `₹23.4L`, `≥1K` → `₹8.4K`

---

## 4. Spacing & radii

### Spacing (base 4px grid)
`--sp-1: 4px` · `--sp-2: 8px` · `--sp-3: 12px` · `--sp-4: 16px` · `--sp-6: 24px` · `--sp-8: 32px`

### Border radii
| Token | Value | Use |
|-------|-------|-----|
| `--r-sm` | 6px | Badges, pills |
| `--r-md` | 10px | Buttons, inputs |
| `--r-lg` | 14px | Cards, hero shell |
| `--r-xl` | 20px | Modals, profile card |
| `--r-full` | 999px | Chips, avatars, toggles |

### Shadows
| Token | Use |
|-------|-----|
| `--shadow-xs` | Subtle depth on small elements |
| `--shadow-sm` | Default card shadow |
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.06)` — hero cards |
| `--shadow-md` | Buttons, dropdowns |
| `--shadow-lg` | Modals, hamburger drawer |

---

## 5. Components

### AppHeader
Deep Teal sticky bar, 56px tall. Logo + "Piaso.ai" wordmark on left. User avatar + hamburger icon on right.

### BottomNav
White bar, 60px, 3 tabs: Pulse (waveform) / Invest (trending-up arrow) / Spend (coin jar). Active tab: Deep Teal with 4px dot indicator.

### HamburgerMenu
Right-side slide-in drawer, 280px wide. User avatar + name in Deep Teal header. Nav sections divided by hairline dividers. Sign Out in red at bottom.

### HeroCard (health gradient)
Rounded 14px card with health gradient background. Micro-label → Fraunces amount → delta → flip stats row.

### HealthBadge
Tonal pill: `● State` in matching color. Used inside hero cards.

### FlipCard
Small stat tile with value + micro-label. Used in hero flip row.

### AI Insight card
Light grey `#F1F5F9` card with `✦` icon + body text + "Powered by Piaso AI" footer.

---

## 6. Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease-spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | Enters, slides |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Exits |
| `--dur-micro` | 150ms | Hover states |
| `--dur-short` | 250ms | Button interactions |
| `--dur-medium` | 450ms | Card transitions |
| `--dur-long` | 800ms | Page transitions |

Respect `prefers-reduced-motion` — `globals.css` sets all durations to `0.01ms` when reduced motion is preferred.

---

## 7. Mobile-first rules

- All layouts constrained to `max-width: 440px` centred
- Use `min-height: 100dvh` (dynamic viewport height) — handles mobile browser chrome
- Bottom nav is `position: fixed; bottom: 0` — main content pads `padding-bottom: 80px`
- No horizontal scroll — all cards fill width with `padding: 0 16px`
- Touch targets minimum 44px height
- Google photos loaded with `referrerPolicy="no-referrer"` to prevent 403s on mobile
