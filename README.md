# 🌊 RIVR FinSight AI — Quantitative Financial Intelligence & Personal Wealth Dashboard

> **A state-of-the-art, high-contrast financial engine combining personal cash flow management, quantitative DCF valuation, 100+ trajectory Monte Carlo simulations, real-time stock technical analysis, and Gemini 1.5 Flash AI investment decision auditing.**

---

## 🌟 Visual Aesthetics & Design System

- **Main Canvas Theme**: Warm Luxury Cream (`#FDFBF7`) for maximum contrast and zero eye fatigue.
- **Glassmorphism Hero**: Cloudfront HD video background with SVG cutout corner masks (`fill="#FDFBF7"`).
- **Typography**: Custom `@font-face` **Helvetica Regular** paired with crisp dark slate headers (`#0F172A`).
- **Crystal Clear Cards**: High-contrast white cards (`bg-white border border-slate-300 shadow-md`) across every single section for crystal clear readability.

---

## ⚡ Core Features Breakdown

### 💳 1. Personal Expenses & Plaid Bank Sync
- **Plaid Bank Sync Sandbox**: Click one button to simulate syncing Chase or Bank of America checking accounts.
- **Manual Data Entry & CSV Upload**: Add custom expenses or drag-and-drop CSV files.
- **Clear Demo Entries**: Reset initial demo records with 1 click (`POST /api/finance/transactions/clear-all`) to start with a blank $0 balance.
- **Budget Limit Calculator**: Interactive monthly spending limits and savings trajectory estimates.

### 📈 2. Real-Time Stock Analysis & Gemini 1.5 Flash AI
- **Technical Market Indicators**: Real-time price charts with 20-day, 50-day, 200-day Simple Moving Averages, RSI (14), MACD, and 30-day Support/Resistance levels.
- **Gemini AI Decision Card**: Structured AI analysis evaluating P/E, P/B, Debt/Equity, and Free Cash Flow to generate a 1-paragraph investment thesis, price movement breakdown, key catalysts, red flags, and a **Strong Buy / Buy / Watchlist** rating label.

### 🧮 3. Quantitative DCF & Monte Carlo Engine
- **DCF Valuation Sliders**: Adjust Cash Flow Growth Rate %, Discount Rate / WACC %, and Terminal Growth % to compute per-share intrinsic value.
- **Mathematical Breakdown Panel**: Step-by-step mathematical breakdown showing Terminal Value equations and Equity Value calculations ($EV = \sum PV(FCF) + PV(TV)$, $Equity = EV + Cash - Debt$).
- **100+ Trajectory Monte Carlo Simulator**: Geometric Brownian Motion (GBM) stochastic simulation returning 10th percentile (Bear), 50th percentile (Median), and 90th percentile (Bull) price outcome paths.

### 📊 4. Portfolio Risk Index & Equity Screener
- **Institutional Risk Score (0-100)**: Portfolio beta estimates, sector exposure donut chart, and asset breakdown.
- **Multi-Metric Stock Screener**: Filter U.S. equities by max P/E, P/B, Debt/Equity, and Sector.
- **Side-by-Side Comparison Matrix**: Compare 2-4 equities simultaneously across all key metrics.

### 🛡️ 5. SQLite AI Audit Log & Transparency Hub
- **Strict `table-fixed` Layout**: Zero text overlap or line breaking across Latency, Tokens, and Inspect JSON columns.
- **AI Decision Output Binding**: Displays the generated AI investment thesis and rating badge directly in the audit table.
- **Raw JSON Payload Inspector**: Modal displaying exact user prompts, API latency in ms, token usage, and structured JSON responses recorded in SQLite (`finsight.db`).

### 📄 6. Executive PDF & CSV Report Export
- Download a confidential executive report (`FinSight_AI_Executive_Financial_Report.pdf`) or export raw financial data to CSV.

---

## 🛠️ Technology Stack

### Frontend:
- **Core**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Custom CSS Variables, Glassmorphism, Helvetica Regular Font
- **Animations**: Motion (`motion/react`)
- **Charts**: Recharts (LineChart, AreaChart, PieChart, ResponsiveContainer)
- **Icons**: Lucide React
- **Document Export**: jsPDF

### Backend:
- **API Framework**: Python 3.10+, FastAPI, Uvicorn
- **Database**: SQLite3 (`finsight.db`)
- **Financial Math & Data**: NumPy, Pandas, yfinance
- **AI Model**: Google Gemini 1.5 Flash API via HTTP REST

---

## 📁 Project Directory Structure

```
finsight-ai/
├── start_servers.py                 # Unified server launcher script
├── README.md                        # Project documentation
├── backend/
│   ├── main.py                      # FastAPI REST & WebSockets router
│   ├── database.py                  # SQLite schema & seed setup
│   ├── config.py                    # Environment & Gemini API key configuration
│   ├── finsight.db                  # Local SQLite database
│   └── services/
│       ├── gemini_service.py        # Gemini AI stock analysis & SQLite logging
│       ├── yfinance_service.py      # Real-time stock prices & technical indicators
│       └── quant_math.py            # DCF valuation & Monte Carlo simulation math
└── frontend/
    ├── index.html                   # HTML entry page
    ├── vite.config.ts               # Vite configuration with API proxy
    ├── package.json                 # Frontend dependencies
    └── src/
        ├── App.tsx                  # Main React container & routing
        ├── main.tsx                 # React DOM mount
        ├── index.css                # Custom CSS tokens & font definitions
        └── components/
            ├── Hero.tsx             # RIVR streaming video background hero
            ├── Navbar.tsx           # Navigation header bar
            ├── HeroBadge.tsx        # Hero pill badge
            ├── BottomLeftCard.tsx   # Hero badge with AI Audit Log link
            ├── BottomRightCorner.tsx# Cutout corner with SVG masks
            ├── ScrollToTopButton.tsx# Floating Back to Top button
            ├── ExpenseTracker.tsx   # Personal Expenses & Bank sync
            ├── StockAnalysis.tsx    # Stock charts & Gemini AI thesis
            ├── DCFAndMonteCarlo.tsx # DCF sliders & Monte Carlo fan chart
            ├── PortfolioRisk.tsx    # Portfolio risk score & holdings
            ├── ScreenerAndCompare.tsx# Equity screener & compare matrix
            ├── AIAuditLog.tsx       # SQLite AI Audit Log table & inspector
            ├── UserGuideModal.tsx   # Dashboard guide modal
            └── PDFExportModal.tsx   # Executive PDF report download modal
```

---

## 🚀 Quick Start & Local Running Instructions

### Prerequisites:
- **Node.js**: v18+ installed
- **Python**: v3.10+ installed

### 1. Launch Both Servers Automatically
Run the unified server launcher script from the project root:

```bash
python start_servers.py
```

This starts:
- 🐍 **FastAPI Backend**: `http://localhost:8000`
- ⚡ **Vite Frontend**: `http://localhost:5173`

---

## 🔑 Environment Configuration
The Gemini API key is configured in `backend/config.py`:
```python
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
```

---

## 📜 License
This project is open-source and available for research and personal wealth management purposes.
