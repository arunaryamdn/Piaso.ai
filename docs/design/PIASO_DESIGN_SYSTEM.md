# Piaso.ai — Unified Design System
## Investments + Spend Analytics for Indian Retail Investors

**Version:** 1.0  
**Date:** April 2026  
**Author:** Arun Arya  
**Status:** Handoff to Claude Design / Figma

---

## 1. Product Context

### What This Is
Piaso.ai is the convergence of two products:
- **Paiso.ai** — investment portfolio tracker for Indian retail investors (Zerodha/Kite integration)
- **Gullak** — salary-cycle spend awareness app ("Am I okay this month?")

The unified product answers two questions in one place:
1. **"How is my money growing?"** — portfolio performance, net worth, stock holdings
2. **"Am I okay this month?"** — salary cycle, spend runway, committed vs discretionary

### Who It's For
Indian salaried consumers, ages 25–45, urban, smartphone-first. Monthly income ₹40K–₹2L. Has a Zerodha account and gets salary credited monthly. Not a power trader or financial analyst — a person who wants clarity, not complexity.

### Competitive Space
Indian fintech peers: CRED, Jupiter, Fi Money, Jar, Zerodha Kite, ET Money, Groww, INDmoney.

**Our positioning:** Nobody in Indian fintech shows you investments AND spend health in one pulse. CRED/Fi are aspirational/dark. Groww/Kite are tool-first. Jupiter/Jar are spend-first. Piaso.ai is the only warm, everyday utility that holds both.

### Primary Platform
Mobile-first web app. Primary viewport: 393px (iPhone 14/15). Desktop supported from 920px with sidebar rail.

---

## 2. Design Philosophy

### Direction: Warm Functional
Inherited from Gullak. Extended for investments.

**The principle:** A well-organized household ledger that happens to be beautifully designed. Not a trading terminal. Not a bank. A trusted companion that helps a person understand their financial life at a glance.

**What we are NOT:**
- Dark/premium (that's CRED, Fi, Bloomberg)
- Gamified (that's Jar, Groww's nudges)
- Clinical/data-heavy (that's Kite, ET Money)
- Corporate/navy (that's every bank app)

**What we ARE:**
- Warm and trustworthy
- Information-dense but never cluttered
- Culturally Indian (coin jar metaphor, ₹ symbol prominent, salary-cycle awareness)
- One clear answer per screen before detail is available

### The Two Metaphors
1. **Coin jar (Gullak):** Spend health visualization. Gold coins in a glass jar at fill level. Culturally resonant — every Indian has seen a clay gullak (piggy bank). The jar tells you at a glance how much of this month is left.
2. **Growing plant / Seedling:** Investment growth visualization. A small seedling that grows taller as net worth increases. Paired with the jar: "your jar is healthy, your plant is growing." Both are alive, both require care.

*(Note: the plant metaphor is directional — Claude Design can explore alternatives. Core requirement: an organic, warm growth metaphor that pairs with the coin jar. Not a bar chart, not an arrow.)*

### Design Decisions Log (inherited + new)
| Decision | Rationale |
|---|---|
| Light theme over dark | 71% Indian users prefer "simple and quiet" (NASSCOM 2025). Dark = trading terminal. |
| Warm ivory over cool grey | `#FAF9F6` feels like paper/ledger. Single biggest mood shift from typical fintech. |
| Fraunces (serif) for hero numbers | No Indian fintech uses display serif. Warm, human, not clinical. ₹23,450 in Fraunces feels like someone cares. |
| Traffic-light health states | Universal. Green/amber/red maps to portfolio performance AND spend health. No blue in health states. |
| Deep Teal over navy | Warmer, more approachable. Doesn't clash with Paytm's blue. Says "home" not "bank." |
| Portfolio green ≠ up-tick green | Investment gain color (`#059669`) is the same as spend health green — intentional. "Green means good" is universal. |

---

## 3. Typography

### Font Stack
```
Display/Hero:  Fraunces 700 (optical size 48) — Google Fonts
Body/UI:       DM Sans 400–700 (variable) — Google Fonts
Numeric data:  DM Sans 600, font-variant-numeric: tabular-nums
```

**Google Fonts import:**
```
https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&display=swap
```

### Type Scale
| Size | Usage | Font | Weight |
|---|---|---|---|
| `9px` | Badge text, micro labels | DM Sans | 600, uppercase, letter-spacing 0.8px |
| `11px` | Timestamps, meta text, status hints | DM Sans | 400 |
| `13px` | Body text, card descriptions, table body | DM Sans | 400 |
| `14px` | Item names, transaction descriptions, stock names | DM Sans | 500 |
| `16px` | Section headers, nav labels, card titles | DM Sans | 600 |
| `18–20px` | Secondary hero numbers (P&L, today's gain) | Fraunces | 600 |
| `24px` | Portfolio sub-total, month spend total | Fraunces | 700 |
| `28–32px` | Primary hero: net worth, runway amount | Fraunces | 700 |
| `48px` | Landing page title | Fraunces | 700 |

### Numeric Display Convention
All currency amounts use `font-variant-numeric: tabular-nums` so digits align in columns. ₹ symbol is DM Sans weight to match the number weight. Delta values (gain/loss) are always preceded by `+` or `−` (minus sign, not hyphen).

```
Hero amount:     ₹23,45,000      (Fraunces 700, 28–32px)
Secondary:       +₹1,23,450      (Fraunces 600, 18–20px, green-500)
Table cell:      ₹1,234.50       (DM Sans 600 tabular, 14px)
Percentage:      +12.4%          (DM Sans 600, 13px, color by sign)
```

---

## 4. Color System

### Foundation: Warm Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--page-bg` | `#FAF9F6` | Page background — warm ivory. Not white, not grey. |
| `--card-bg` | `#FFFFFF` | All card surfaces |
| `--border` | `rgba(0,0,0,0.06)` | Card borders, dividers, table row separators |
| `--ink-primary` | `#1A1A2E` | Headings, primary text (warm near-black with indigo tint) |
| `--ink-secondary` | `#4A5568` | Body text, amounts, stock names |
| `--ink-muted` | `#94A3B8` | Meta text, timestamps, ISIN codes, labels |

### Brand: Deep Teal
| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#1B3A4B` | Primary buttons, app header, wordmark, CTAs |
| `--primary-light` | `#2D5F73` | Hover/active states, secondary actions |
| `--primary-dark` | `#122831` | Pressed states |
| `--brand-cyan` | `#00BAF2` | Brand accent only (logo eyebrow, never for UI states) |

### Health States: Traffic Light
Used for BOTH spend health AND portfolio performance health. Green = good. Amber = watch. Red = action needed.

| State | `500` (primary) | `600` (text on light bg) | `100` (subtle bg) | `50` (card bg) | When |
|---|---|---|---|---|---|
| Green | `#059669` | `#047857` | `#D1FAE5` | `#ECFDF5` | Spend: <70% used, bills paid. Portfolio: positive return, on track. |
| Amber | `#D97706` | `#92400E` | `#FEF3C7` | `#FFFBEB` | Spend: 70–90% used, spike ahead. Portfolio: flat, underperforming index. |
| Red | `#DC2626` | `#991B1B` | `#FEE2E2` | `#FEF2F2` | Spend: >90% used, overdue. Portfolio: significant loss, stop-loss territory. |
| Grey | `#64748B` | `#475569` | `#E2E8F0` | `#F1F5F9` | Partial data, loading, unknown state. |

### Health Gradients (hero card backgrounds)
```css
green:  linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)
amber:  linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)
red:    linear-gradient(135deg, #FFF5F5 0%, #FEE2E2 50%, #FECACA 100%)
grey:   linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)
```

### Investment-Specific Color Extensions

#### Gain / Loss Delta Colors
These mirror health states but are used specifically for price movement and P&L.
| Token | Hex | Usage |
|---|---|---|
| `--gain` | `#059669` | Positive return, price up, profit |
| `--gain-bg` | `#ECFDF5` | Chip/badge background for gain |
| `--loss` | `#DC2626` | Negative return, price down, loss |
| `--loss-bg` | `#FEF2F2` | Chip/badge background for loss |
| `--neutral-delta` | `#64748B` | Zero change, no movement |

**Important:** India convention — green = up, red = down. This matches the rest of the health system. No inversion needed.

#### Chart Color Palette (8 colors, accessible)
Used for: sector allocation donut, portfolio composition, multi-line performance charts.
```
Chart-1:  #1B3A4B  (Deep Teal — primary, largest allocation)
Chart-2:  #059669  (Green — second allocation)
Chart-3:  #D97706  (Amber — third)
Chart-4:  #7C3AED  (Violet — fourth)
Chart-5:  #2563EB  (Blue — fifth)
Chart-6:  #DC2626  (Red — sixth)
Chart-7:  #0891B2  (Cyan — seventh)
Chart-8:  #94A3B8  (Grey — other/miscellaneous)
```

These 8 colors are the complete chart palette. Chart-1 always maps to the largest segment. Chart-8 always maps to "Others" or unclassified.

#### Portfolio Performance Line Chart
```
Portfolio line:   #1B3A4B  (Deep Teal, 2px stroke)
Nifty 50 line:   #94A3B8  (Muted grey, 1.5px stroke, dashed)
Area fill:        rgba(27, 58, 75, 0.08)  (Teal tint under portfolio line)
Today marker:    #059669  (Green dot, 6px)
Grid lines:       rgba(0,0,0,0.04)
```

#### Sparkline (mini chart in holdings table)
```
Up trend:    #059669  (1.5px stroke)
Down trend:  #DC2626  (1.5px stroke)
Flat:        #94A3B8  (1.5px stroke)
```

### Special: Gold Coin (Gullak jar)
```css
background: radial-gradient(circle at 35% 35%, #FFE066, #F5B800, #CC8F00)
border: 1.5px solid #B8860B
box-shadow: 0 1px 3px rgba(184,134,11,0.4)
```

### Dark Mode Token Overrides
Full dark mode support. Triggered via `[data-theme="dark"]` on `<html>`.
```css
[data-theme="dark"] {
  --primary: #5BA4C0;
  --primary-light: #7BBDD6;
  --primary-dark: #1B3A4B;
  --ink-primary: #F1F5F9;
  --ink-secondary: #CBD5E1;
  --ink-muted: #64748B;
  --page-bg: #0F172A;
  --card-bg: #1E293B;
  --border: rgba(255,255,255,0.08);

  /* Health states shift to lighter for dark bg */
  --green-50: #052E16; --green-100: #064E3B; --green-500: #34D399;
  --amber-50: #451A03; --amber-100: #78350F; --amber-500: #FBBF24;
  --red-50:   #450A0A; --red-100:   #7F1D1D; --red-500:   #F87171;
  --grey-50:  #1E293B; --grey-100:  #334155;
}
```

---

## 5. CSS Custom Properties (Complete Token Set)

```css
:root {
  /* Brand */
  --primary: #1B3A4B;
  --primary-light: #2D5F73;
  --primary-dark: #122831;
  --brand-cyan: #00BAF2;

  /* Health / Traffic Light */
  --green-500: #059669; --green-600: #047857; --green-100: #D1FAE5; --green-50: #ECFDF5;
  --amber-500: #D97706; --amber-600: #92400E; --amber-100: #FEF3C7; --amber-50: #FFFBEB;
  --red-500:   #DC2626; --red-600:   #991B1B; --red-100:   #FEE2E2; --red-50:   #FEF2F2;
  --grey-500:  #64748B; --grey-600:  #475569; --grey-100:  #E2E8F0; --grey-50:  #F1F5F9;

  /* Investment Deltas */
  --gain: #059669;
  --gain-bg: #ECFDF5;
  --loss: #DC2626;
  --loss-bg: #FEF2F2;
  --neutral-delta: #64748B;

  /* Chart Palette */
  --chart-1: #1B3A4B; --chart-2: #059669; --chart-3: #D97706; --chart-4: #7C3AED;
  --chart-5: #2563EB; --chart-6: #DC2626; --chart-7: #0891B2; --chart-8: #94A3B8;

  /* Neutrals */
  --ink-primary: #1A1A2E;
  --ink-secondary: #4A5568;
  --ink-muted: #94A3B8;
  --page-bg: #FAF9F6;
  --card-bg: #FFFFFF;
  --border: rgba(0,0,0,0.06);

  /* Gold Coin */
  --gold: #F5B800;
  --gold-light: #FFE066;
  --gold-dark: #CC8F00;

  /* Spacing (base 4px) */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-6: 24px; --sp-8: 32px; --sp-12: 48px; --sp-16: 64px;

  /* Border Radius */
  --r-sm: 6px;     /* badges, pills */
  --r-md: 10px;    /* buttons, inputs, flip cards */
  --r-lg: 14px;    /* cards, hero shell */
  --r-xl: 20px;    /* modals, persona cards */
  --r-full: 999px; /* chips, avatar, toggle pills */

  /* Motion */
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
  --dur-micro: 150ms;
  --dur-short: 250ms;
  --dur-medium: 450ms;
  --dur-long: 800ms;
}
```

---

## 6. Information Architecture

### Navigation Model
Three top-level tabs in bottom navigation (mobile) or sidebar rail (desktop):

| Tab | Icon | Question answered |
|---|---|---|
| **Pulse** (home) | Heart / pulse wave | "How am I doing overall?" |
| **Invest** | Plant / seedling | "How is my money growing?" |
| **Spend** | Coin jar | "Am I okay this month?" |

### L0 — Pulse (Primary Home Screen)
**Question:** "Give me the full picture in one glance."

**Layout (mobile, 393px):**
```
┌─────────────────────────────────┐
│  Piaso.ai       [🔔] [avatar]   │  ← App header (Deep Teal bg, white text)
├─────────────────────────────────┤
│  Net Worth                      │  ← Hero card (health-gradient bg)
│  ₹23,45,000          ↑ +2.3%   │  ← Fraunces 700 28px + green delta
│  ━━━━━━━━━━━━━━━━━━━━━━━━       │  ← Flip-card divider
│  Invested ₹19,45,000  CAGR 8.2% │  ← Flip-card row
├─────────────────────────────────┤
│  ╔═══════════════╗              │
│  ║  Investments  ║  Spend       │  ← Two metric cards side by side
│  ║  ₹23.4L  +12% ║  ₹14,200    │
│  ║  🟢 Growing   ║  🟢 22 days  │
│  ╚═══════════════╝              │
├─────────────────────────────────┤
│  This Month's Activity          │  ← Section header
│  ─────────────────────────      │
│  Apr 1  Salary credited +₹85K  │  ← Timeline items
│  Apr 5  SIP deducted    -₹5K   │
│  Apr 10 Amazon spend   -₹1,200  │
│  Apr 15 Dividend       +₹450   │
│  [See all activity →]           │
├─────────────────────────────────┤
│  [💡 AI Insight]                │  ← AI insight card (grey bg)
│  Your SIP hit a 52-week high.   │
│  Momentum is with large-cap.    │
└─────────────────────────────────┘
```

**Net Worth Hero Card behavior:**
- Background gradient reflects combined health (investments + spend both green → green gradient)
- If investments up but spend in amber → amber gradient (spend health gates overall)
- Tapping "Investments" metric card → navigates to Invest tab
- Tapping "Spend" metric card → navigates to Spend tab

---

### L1 — Invest Tab (Portfolio Overview)
**Question:** "How is my money growing?"

**Layout:**
```
┌─────────────────────────────────┐
│  Investments                    │  ← Section header
│  ₹23,45,000  +₹2,45,000 (12.4%)│  ← Total invested + total gain (Fraunces)
├─────────────────────────────────┤
│  [Performance Chart — 1Y]       │  ← Area chart: portfolio vs Nifty 50
│  [1W] [1M] [3M] [1Y] [All]     │  ← Time range pills
├─────────────────────────────────┤
│  Sector Allocation              │
│  [Donut chart]                  │  ← 8-color chart palette
│  ■ IT 34%  ■ Banks 22%  ■ ...  │
├─────────────────────────────────┤
│  Holdings (23 stocks)     [Sort]│
│  ─────────────────────────────  │
│  RELIANCE  ₹89,400 +14.2% ↑   │  ← Holdings row
│  TCS       ₹74,200 +8.1%  ↑   │
│  INFY      ₹41,100 -2.3%  ↓   │
│  [Load more]                    │
└─────────────────────────────────┘
```

**Holdings Table Row anatomy:**
```
[Stock logo/initials] [Name + NSE symbol]   [Current value]
                      [Qty × avg price]      [+/- % · sparkline]
```

---

### L2 — Stock Detail
**Question:** "What's happening with this specific holding?"

**Layout:**
```
┌─────────────────────────────────┐
│  ← RELIANCE.NS                  │  ← Back nav
├─────────────────────────────────┤
│  ₹2,890.50  +₹42.30 (+1.48%)  │  ← CMP + today's change (Fraunces)
│  As of 3:30 PM · NSE           │  ← Meta text
├─────────────────────────────────┤
│  [Candlestick / Line chart]     │  ← Price chart (1D/1W/1M/1Y)
├─────────────────────────────────┤
│  Your Position                  │
│  ┌────────────┬────────────┐   │
│  │ Qty        │ 31 shares  │   │  ← Flip cards
│  ├────────────┼────────────┤   │
│  │ Avg Cost   │ ₹2,638.40  │   │
│  ├────────────┼────────────┤   │
│  │ Invested   │ ₹81,790    │   │
│  ├────────────┼────────────┤   │
│  │ Current    │ ₹89,595    │   │
│  ├────────────┼────────────┤   │
│  │ P&L        │ +₹7,805    │   │  ← green text
│  │ Returns    │ +9.54%     │   │  ← green text
│  └────────────┴────────────┘   │
├─────────────────────────────────┤
│  [💡 AI Note]                   │
│  Reliance is up 3.2% this week  │
│  vs Nifty at +0.8%. Strong.     │
└─────────────────────────────────┘
```

---

### L1 — Spend Tab (Gullak)
**Question:** "Am I okay this month?"

Carries over the complete Gullak L0 → L1 → L2 → L3 architecture exactly as specified in Gullak's design. No changes to the spend information architecture.

**Key screens:**
- **L0 Timeline:** Coin jar + runway days + cycle position
- **L1 Categories:** Committed vs discretionary breakdown
- **L2 Events:** Individual transactions, uncertain items
- **L3 Actions:** Recommendations, what to do next

---

## 7. Component Inventory

### Shared Components (used in both Invest + Spend)

#### Hero Card
```
Structure:  
  Top area: primary metric (Fraunces 700 28px) + health delta
  Divider:  flip-card split-flap CSS line
  Bottom:   2–3 secondary metrics in a row

Background: health-gradient (computed from current health state)
Radius:     --r-lg (14px)
Padding:    20px
Shadow:     0 2px 12px rgba(0,0,0,0.06)
```

#### Flip Card (data cell)
```
White card with --border
Split-flap CSS divider line at vertical midpoint:
  border-top: 1px solid rgba(0,0,0,0.08)
  content positioned at center
  
Top half: value (DM Sans 600, 16–20px, --ink-primary)
Bottom half: label (DM Sans 600, 9px, uppercase, letter-spacing 0.8px, --ink-muted)
Radius: --r-md (10px)
```

#### Health Badge / Chip
```
Compact status indicator
Background: health-50 (e.g., --green-50)
Text:       health-600 (e.g., --green-600)
Font:       DM Sans 600, 9px, uppercase
Padding:    2px 8px
Radius:     --r-full (999px)
```

Examples: `● GROWING` (green), `● WATCH` (amber), `● AT RISK` (red), `● LOADING` (grey)

#### AI Insight Card
```
Background: --grey-50 (#F1F5F9)
Border:     1px solid --border
Radius:     --r-md
Padding:    14px 16px
Icon:       ✦ sparkle (SVG, --ink-muted, 16px)
Text:       DM Sans 400, 13px, --ink-secondary
Footer:     "Powered by Piaso AI" · DM Sans 400 11px, --ink-muted
```

#### Action Button
```
Primary:   bg --primary, text white, radius --r-md, padding 12px 20px, DM Sans 600 14px
Secondary: bg transparent, border 1.5px --primary, text --primary, same sizing
Ghost:     text --primary only, no border/bg
Danger:    bg --red-500, text white

Hover:     primary → --primary-light
Active:    primary → --primary-dark
Disabled:  opacity 0.4, cursor not-allowed
```

#### Timeline Item
```
Left:   colored dot (6px circle, health-state color) + vertical connector line
Center: 
  Line 1: [event name, DM Sans 500 14px, --ink-primary] [amount, right-aligned, Fraunces 600 14px]
  Line 2: [date/meta, DM Sans 400 11px, --ink-muted]    [badge (PAID / SIP / DIVIDEND)]
Right:  optional action icon (chevron, edit)

Row height: min 52px
Separator:  none (vertical line handles it)
```

---

### Investment-Specific Components

#### Holdings Table Row
```
Height:     64px
Padding:    12px 16px
Left:       Stock logo circle (32px, DM Sans 600 12px initials, chart-color bg)
Center top: Stock name (DM Sans 500 14px, --ink-primary)
Center bot: NSE symbol · Qty (DM Sans 400 11px, --ink-muted)
Right top:  Current value (DM Sans 600 14px tabular, --ink-primary)
Right bot:  Delta chip (+9.5% ↑ in --gain color, or -2.3% ↓ in --loss color)
Far right:  Sparkline (40×20px, gain/loss/neutral color, 1.5px stroke)

Tap target:     full row
Tap feedback:   bg tint to --grey-50 (150ms)
Separator:      1px --border
```

#### Performance Chart (Area Chart)
```
Chart type:     Area chart with line on top
Portfolio line: --primary (Deep Teal), 2px stroke
Nifty 50 line:  --ink-muted, 1.5px dashed stroke
Area fill:      rgba(27,58,75,0.08) under portfolio line
Grid:           horizontal only, rgba(0,0,0,0.04)
X-axis:         DM Sans 400 11px, --ink-muted
Y-axis:         DM Sans 400 11px, --ink-muted, ₹ prefix
Today marker:   6px circle, --green-500 fill
Tooltip:        White card, --r-sm, shadow, shows date + portfolio value + Nifty value
Time pills:     [1W] [1M] [3M] [1Y] [All] — DM Sans 600 12px chips
```

#### Sector Donut Chart
```
Chart type:     Donut (ring width ~20% of radius)
Colors:         chart-1 through chart-8 in order of allocation size
Center label:   "Sectors" (DM Sans 600 11px) + count (DM Sans 700 18px, --ink-primary)
Legend:         below chart, colored square + name + % per row, DM Sans 400 13px
Hover state:    selected segment slightly offset (4px translate outward), others dim to 60% opacity
```

#### P&L Summary Strip
```
3 flip cards in a row:
  [Invested]  [Current Value]  [Total P&L]

P&L card special treatment:
  If positive: health-gradient green bg, green text
  If negative: health-gradient red bg, red text
  If zero:     grey bg
```

#### Stock Logo Circle
```
When logo available: circular crop, 32×32px
When not available:  2-letter initials (e.g., "RL" for Reliance), 
                     background from chart palette (cycled by stock order),
                     DM Sans 700 12px white text
Radius: --r-full
```

---

### Spend-Specific Components (from Gullak, unchanged)

#### Coin Jar Visualization
```
Glass jar SVG — outline, transparent center
Gold Rs coins stacked inside at fill-level
Fill level = % of salary spent
Coin animation: coins pop upward and arc away on spend events (infinite loop, slower = healthier)
Nearly empty jar: 1–2 coins, increased urgency
```

#### Spend Category Bar
```
Committed segment:  --primary (Deep Teal)
Discretionary:      --amber-500
Remaining:          --green-100

Height: 8px track, --r-full
```

---

## 8. Layout System

### Mobile (primary, 393px viewport)
```
Header:         56px fixed top (Deep Teal bg)
Content area:   full width, 16px horizontal padding
Bottom nav:     60px fixed bottom (white, border-top --border)
Card gap:       12px
Max width:      440px (content), centered
```

### Desktop (920px+)
```
Left sidebar:   240px fixed (Deep Teal bg, white text)
Content area:   remainder, max 680px centered
Top header:     none (sidebar has wordmark)
```

### Bottom Navigation (mobile)
```
3 tabs: Pulse | Invest | Spend
Active tab: --primary text + dot indicator
Inactive:   --ink-muted
Icon size:  24px SVG
Label:      DM Sans 600 9px uppercase
```

---

## 9. Motion

### Principles
Intentional only. Every animation serves a purpose: feedback, spatial orientation, or delight. No gratuitous motion.

### Easing Tokens
```
Spring enter:   cubic-bezier(0.22, 1, 0.36, 1)  → natural settle
Ease out:       ease-out                          → exits
Ease in-out:    ease-in-out                       → moves/repositions
```

### Duration Tokens
| Token | Duration | Usage |
|---|---|---|
| micro | 150ms | Button press, hover, tap feedback |
| short | 250ms | Tab switch, card appear, tooltip |
| medium | 450ms | Screen transition, chart draw, hero load |
| long | 800ms | Count-up animation (₹ amounts), chart area fill |
| infinite | 1.8–2.8s | Coin fly animation (loop) |

### Named Animations
```
staggerIn:     fade up + translate Y 8px → 0, stagger 80ms per item (timeline lists, holdings rows)
slideUp:       translate Y 100% → 0, short (bottom sheet, modal)
fadeIn:        opacity 0 → 1, short (cards, tooltips)
countUp:       number animation from 0 to final value, long (hero amounts on first load)
chartDraw:     line draws left to right, medium (performance chart)
coinFly:       coins arc upward from jar, infinite loop (coin jar)
deltaFlash:    background briefly flashes gain/loss color, micro (live price update)
```

### Reduced Motion
All animations gated: `@media (prefers-reduced-motion: no-preference) { ... }`

---

## 10. Accessibility

### Contrast Ratios (verified)
| Pair | Ratio | Grade |
|---|---|---|
| --ink-primary on --page-bg | 15.2:1 | AAA |
| White on --primary (Deep Teal) | 11.4:1 | AAA |
| --green-600 on --green-50 | 5.8:1 | AA |
| --amber-600 on --amber-50 | 6.1:1 | AA |
| --red-600 on --red-50 | 6.3:1 | AA |

### Touch Targets
Minimum 44×44px for all interactive elements on mobile.

### Semantic Rules
- Health states always use color + text label, never color alone
- Delta values always use `+` or `−` prefix, never color alone
- Charts always have accessible tooltips
- Stock logo fallback always shows stock initials (never blank)

---

## 11. Iconography

### Approach
Minimal inline SVG icons. No icon library dependency. Hand-drawn to match warm aesthetic.

### Required Icons
```
Navigation:
  pulse-wave       → Pulse tab
  seedling/plant   → Invest tab
  coin-jar         → Spend tab
  bell             → Notifications
  avatar-circle    → User profile

Investment:
  trending-up      → Gain indicator
  trending-down    → Loss indicator
  minus            → Flat / neutral
  chart-area       → Performance chart
  pie-chart        → Sector allocation
  info-circle      → Stock info

Spend:
  edit-pencil      → Edit budget
  chevron-right    → Navigation
  check-circle     → Paid status
  alert-circle     → Overdue / warning
  sparkle (✦)      → AI insights

General:
  plus             → Add transaction
  search           → Search stocks
  filter           → Sort/filter
  close (×)        → Dismiss
  back-arrow       → Navigation back
```

### No-Emoji Rule
No emoji as UI elements. Emoji is acceptable only in AI-generated insight text. All UI states use SVG icons.

---

## 12. Data States

Every data-bearing component must handle all four states:

### Loading
```
Skeleton shimmer: --grey-100 background, animated gradient sweep
No spinner — skeleton only (spinners feel slow, skeletons feel fast)
Animation: shimmer from left to right, 1.5s loop
```

### Empty
```
Illustration: subtle line art (not illustrated mascots)
  Invest empty: seedling outline, "Upload your portfolio to get started"
  Spend empty:  empty coin jar outline, "Connect your bank to track spend"
CTA button: primary action to resolve empty state
```

### Error
```
Background: --red-50
Icon:       alert-circle, --red-500
Text:       DM Sans 500 14px, --red-600, plain language (no technical errors)
Action:     "Try again" ghost button
```

### Partial / Unknown Data
```
Uses grey health state
Text: "--" or "Partial data" in --ink-muted
No fake numbers, no 0 shown as actual value
```

---

## 13. Badges Reference

### Transaction / Event Badges
| Badge | Background | Text | Usage |
|---|---|---|---|
| PAID | `#D1FAE5` | `#059669` | Bill paid on time |
| OVERDUE | `#FEE2E2` | `#DC2626` | Bill overdue |
| SIP | `#DBEAFE` | `#2563EB` | Mutual fund SIP deducted |
| DIVIDEND | `#D1FAE5` | `#047857` | Dividend credited |
| SALARY | `#ECFDF5` | `#059669` | Salary credited |
| EMI | `#FEF3C7` | `#92400E` | EMI deducted |
| HABITUAL | `#F1F5F9` | `#64748B` | Recurring discretionary |

### Portfolio Badges
| Badge | Background | Text | Usage |
|---|---|---|---|
| NIFTY 50 | `#DBEAFE` | `#2563EB` | Index constituent |
| LARGE CAP | `#F3E8FF` | `#7C3AED` | Market cap category |
| MID CAP | `#FEF3C7` | `#92400E` | Market cap category |
| SMALL CAP | `#FEE2E2` | `#DC2626` | Market cap category |
| 52W HIGH | `#D1FAE5` | `#047857` | Near 52-week high |
| 52W LOW | `#FEE2E2` | `#DC2626` | Near 52-week low |

---

## 14. Voice and Tone

### Numbers
- Always show ₹ symbol before amounts (never "Rs" or "INR" in UI)
- Use Indian number format: ₹23,45,000 (not ₹2,345,000)
- Lakhs and crores: ₹23.4L, ₹1.2Cr (abbreviated in cards), full number in detail views
- Percentages: +12.4% (always sign-prefixed in delta context)
- Always use `−` (minus sign U+2212) not `-` (hyphen) for negative values

### Copy Tone
Warm, direct, plain. No jargon, no hedging.

```
✓ "22 days of spending left"     ✗ "Remaining balance: ₹14,200"
✓ "Your portfolio is growing"    ✗ "Portfolio performance: +12.4%"
✓ "SIP on track"                 ✗ "Systematic Investment Plan status: Active"
✓ "You're okay this month"       ✗ "Financial health index: 82/100"
```

### Error Messages
Plain language, actionable.
```
✓ "Couldn't load your portfolio. Check your connection and try again."
✗ "Error 503: Service Unavailable"
```

### AI Insights
2–3 sentences max. Conversational. One observation + one implication.
```
✓ "Your SIP is hitting a 52-week high this week. Momentum is with large-cap IT — your allocation here is working."
✓ "You're 16 days into the month with ₹14,200 left. At your current pace, you'll finish with ₹8,000 surplus."
```

---

## 15. What Claude Design Should Produce

Given this document, the expected output is:

### Screens to Design (Mobile, 393px)
1. **Pulse (Home)** — Net worth hero + two metric cards + activity timeline + AI insight
2. **Invest Overview** — Portfolio hero + performance chart + sector donut + holdings list
3. **Stock Detail** — Price hero + chart + position flip cards + AI note
4. **Spend Overview (Gullak L0)** — Coin jar + runway + cycle timeline
5. **Spend Categories (L1)** — Category breakdown + committed vs discretionary
6. **Spend Transactions (L2)** — Transaction list + filters
7. **Spend Actions (L3)** — Recommendations
8. **Navigation** — Bottom tab bar
9. **Upload Flow** — Portfolio Excel upload + Bank statement upload (PDF/Excel)
10. **Onboarding** — Connect Zerodha + Upload statement

### Design System Deliverables
- Color styles (all tokens above)
- Text styles (all type scale above)
- Component library: hero card, flip card, holdings row, action buttons, badges, charts (wireframe), coin jar
- Spacing / grid (4px base, 16px page margin)
- Dark mode variants for all components

### Constraints for Claude Design
- Light theme first. Dark mode is a toggle, not the primary.
- No illustrations except coin jar SVG and optional seedling growth metaphor
- Fraunces only for hero numbers. DM Sans for everything else.
- No corporate navy or bank-blue in health states
- Mobile screens designed at 393×852px (iPhone 14/15)
- Desktop screens at 1280×800px with left sidebar
