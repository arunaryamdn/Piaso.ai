# Piaso.ai — Product Requirements Document

**Version:** 1.0  
**Date:** April 2026  
**Owner:** Arun Arya

---

## 1. Problem statement

Indian salaried investors have money in two places — market investments (Zerodha/MF) and their bank account — but no single tool tells them whether they're financially okay in a given month. Existing tools (Zerodha Kite, bank apps) are siloed. Spreadsheets are manual and out of date.

**Core user anxiety:** *"Am I okay this month?"*

---

## 2. Target user

- Salaried professional in India, age 25–40
- Has a Zerodha account with equity holdings
- Receives salary into a savings bank account
- Uses mobile primarily (phone-first, not desktop)
- Not a day trader — checks portfolio weekly, not hourly

---

## 3. Goals

| # | Goal |
|---|------|
| G1 | Show net worth (investments + bank balance) in a single glance |
| G2 | Tell users if their monthly spending is on track |
| G3 | Surface AI buy/hold/sell signals for their actual holdings |
| G4 | Require zero manual data entry — file upload only |
| G5 | Work on mobile browser without requiring an app install |

---

## 4. Non-goals (v1)

- Mutual fund tracking
- Tax computation (LTCG/STCG)
- Bill reminders or payment integrations
- Multi-user / family accounts
- Android/iOS native apps

---

## 5. Features

### 5.1 Pulse (L0 home)
**What:** Combined net worth + spend health on one screen.  
**Input:** Portfolio data + bank statement (both optional — shows welcome state if missing)  
**Output:**
- Net worth hero card (investments value, CAGR, total gain)
- Invest metric card (portfolio value, health badge)
- Spend metric card (runway days, balance left)
- Overall health = worst of (invest health, spend health)

### 5.2 Invest
**What:** Portfolio analytics from Zerodha Excel upload.  
**Upload format:** Zerodha Console holdings export (.xlsx)  
**Output:**
- Hero: total value, invested amount, total P&L %, CAGR
- Holdings table: sortable by value/gain, per-stock mini sparkline
- Upload / re-upload / delete flow

### 5.3 Spend
**What:** Bank statement analysis.  
**Upload format:** HDFC/Axis/SBI/ICICI statement (PDF or Excel)  
**Output:**
- Runway hero: days left in salary cycle, balance remaining, health gradient
- Transaction list: filterable by type (income / committed / investment / discretionary)
- Category auto-classification via keyword rules (see `statement_parser.py`)
- Salary cycle config (salary day, amount)

### 5.4 AI Advisor
**What:** Per-holding buy/hold/sell recommendation.  
**Logic:** Rule-based on gain/loss % thresholds (configurable in `config.py`)
- Down >10% → "Buy More"
- Up >20% → "Sell"
- Otherwise → "Hold"
**Roadmap:** Replace with LLM-based analysis (Anthropic API)

### 5.5 Market News
**What:** NSE news filtered to user's portfolio symbols.  
**Source:** `routes_nse.py` → currently placeholder; roadmap is NSE RSS + BeautifulSoup scrape

### 5.6 Profile
**What:** User identity, portfolio management, Zerodha connect.  
**Contents:**
- Google account info (name, email, photo)
- Uploaded portfolio: filename, size, date, re-upload, delete
- Zerodha OAuth connect (for live price sync via Kite MCP)
- Sign out

---

## 6. User flows

### First-time user
1. Lands on `/` → sees "Am I okay this month?" hero
2. Clicks "Check your financial health" → Google sign-in
3. Redirected to `/pulse` → sees welcome state (no data)
4. Goes to `/invest` → clicks "Upload Portfolio" → uploads Zerodha Excel
5. Invest page shows holdings analytics
6. Goes to `/spend` → uploads bank statement
7. Pulse now shows combined health

### Returning user
1. Opens app → auto-redirected to `/pulse` (session active)
2. Sees net worth + spend status at a glance
3. Drills into `/invest` or `/spend` for details

---

## 7. Health system

Spend and invest each compute a health state: `green | amber | red | grey`

| State | Meaning |
|-------|---------|
| `green` | On track |
| `amber` | Watch — mild concern |
| `red` | At risk |
| `grey` | No data |

Pulse overall health = worst of (invest health, spend health), using rank: red > amber > grey > green.

---

## 8. Success metrics (v1)

- User uploads portfolio within 5 minutes of sign-up
- Pulse page loads in < 2 seconds on 4G
- Zero data entry required beyond file upload
- Mobile-first: all screens usable on 375px viewport

---

## 9. Roadmap (v2+)

| Feature | Priority |
|---------|---------|
| Zerodha live sync (Kite API) | High |
| MF / SIP tracking | High |
| LLM-powered AI advisor (Claude API) | High |
| Push notifications (salary credited, large spend) | Medium |
| LTCG/STCG tax estimation | Medium |
| Export to PDF / share portfolio | Low |
| Desktop layout (1280px sidebar) | Low |
