from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio
import random
import uuid
import pandas as pd
import io
from datetime import datetime

from config import HOST, PORT
from database import init_db, get_db
from services.yfinance_service import (
    get_stock_data,
    STOCK_UNIVERSE
)
from services.gemini_service import generate_ai_stock_analysis
from services.quant_math import calculate_dcf, run_monte_carlo_simulation
from services.plaid_mock import generate_mock_synced_transactions

app = FastAPI(title="FinSight AI Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    init_db()

# Pydantic Schemas
class TransactionCreate(BaseModel):
    title: str
    category: str
    type: str # 'expense' or 'income'
    amount: float
    date: Optional[str] = None

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    tier: Optional[str] = "Elite Pro Member"

class UserLogin(BaseModel):
    email: str
    password: str

class BudgetGoalCreate(BaseModel):
    category: str
    target_amount: float
    current_amount: Optional[float] = 0.0

class PortfolioItemCreate(BaseModel):
    ticker: str
    shares: float
    avg_price: float
    sector: Optional[str] = "Technology"

class DCFRequest(BaseModel):
    fcf: float
    growth_rate: float
    terminal_growth: float
    discount_rate: float
    shares_outstanding: float
    total_debt: float
    cash_and_equiv: float

class MonteCarloRequest(BaseModel):
    initial_portfolio_value: float
    expected_annual_return: float
    annual_volatility: float
    time_horizon_days: int = 252
    num_simulations: int = 100

class CompareRequest(BaseModel):
    tickers: List[str]

# WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

manager = ConnectionManager()

@app.websocket("/ws/ticks")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    tickers = ["AAPL", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "BTC-USD"]
    base_prices = {
        "AAPL": 224.50, "NVDA": 122.80, "MSFT": 448.90, "GOOGL": 182.30,
        "AMZN": 186.20, "META": 489.10, "TSLA": 248.50, "BTC-USD": 65400.00
    }
    try:
        while True:
            await asyncio.sleep(2)
            ticker = random.choice(tickers)
            delta = random.uniform(-0.45, 0.45)
            base_prices[ticker] = max(1.0, round(base_prices[ticker] + delta, 2))
            tick_data = {
                "ticker": ticker,
                "price": base_prices[ticker],
                "change": round(delta, 2),
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            await websocket.send_json(tick_data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ----------------- STOCK & MARKET ENDPOINTS ----------------- #

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "FinSight AI API"}

# ----------------- AUTHENTICATION ENDPOINTS ----------------- #

@app.post("/api/auth/register")
def register_user(req: UserRegister):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email.lower().strip(),))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO users VALUES (?,?,?,?,?,?)",
        (user_id, req.email.lower().strip(), req.name.strip(), req.password, req.tier, now_str)
    )
    conn.commit()
    conn.close()
    return {
        "status": "success",
        "user": {
            "id": user_id,
            "email": req.email.lower().strip(),
            "name": req.name.strip(),
            "tier": req.tier,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        }
    }

@app.post("/api/auth/login")
def login_user(req: UserLogin):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email.lower().strip(),))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address. Please Sign Up.")
    
    u_dict = dict(user)
    if u_dict["password_hash"] != req.password:
        raise HTTPException(status_code=401, detail="Incorrect password. Please verify and try again.")
    
    return {
        "status": "success",
        "user": {
            "id": u_dict["id"],
            "email": u_dict["email"],
            "name": u_dict["name"],
            "tier": u_dict["tier"],
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        }
    }

@app.get("/api/stocks/{ticker}")
def get_stock_details(ticker: str):
    data = get_stock_data(ticker)
    return data

@app.post("/api/stocks/{ticker}/ai-thesis")
def get_ai_thesis(ticker: str):
    stock_data = get_stock_data(ticker)
    analysis = generate_ai_stock_analysis(stock_data)
    return analysis

@app.get("/api/stocks/screener/list")
def get_screener(
    sector: Optional[str] = "All",
    max_pe: Optional[float] = 100.0,
    max_pb: Optional[float] = 100.0,
    max_de: Optional[float] = 10.0,
    min_growth: Optional[float] = -1.0
):
    results = []
    for item in STOCK_UNIVERSE:
        if sector != "All" and item["sector"] != sector:
            continue
        if item["pe"] > max_pe:
            continue
        if item["pb"] > max_pb:
            continue
        if item["de"] > max_de:
            continue
        if item["growth"] < min_growth:
            continue
        results.append(item)
    return {"count": len(results), "results": results}

@app.post("/api/stocks/compare")
def compare_stocks(req: CompareRequest):
    comparison = []
    for ticker in req.tickers:
        data = get_stock_data(ticker)
        comparison.append({
            "ticker": data["ticker"],
            "company_name": data["company_name"],
            "sector": data["sector"],
            "price": data["current_price"],
            "change_pct": data["change_pct"],
            "pe_ratio": data["pe_ratio"],
            "pb_ratio": data["pb_ratio"],
            "debt_to_equity": data["debt_to_equity"],
            "rsi": data["rsi"],
            "dividend_yield": data["dividend_yield"],
            "revenue_growth": data["revenue_growth"],
            "fifty_two_week_high": data["fifty_two_week_high"],
            "fifty_two_week_low": data["fifty_two_week_low"]
        })
    return {"count": len(comparison), "stocks": comparison}

@app.post("/api/dcf")
def dcf_calculation(req: DCFRequest):
    result = calculate_dcf(
        fcf=req.fcf,
        growth_rate=req.growth_rate,
        terminal_growth=req.terminal_growth,
        discount_rate=req.discount_rate,
        shares_outstanding=req.shares_outstanding,
        total_debt=req.total_debt,
        cash_and_equiv=req.cash_and_equiv
    )
    return result

@app.post("/api/monte-carlo")
def monte_carlo_simulation(req: MonteCarloRequest):
    result = run_monte_carlo_simulation(
        initial_portfolio_value=req.initial_portfolio_value,
        expected_annual_return=req.expected_annual_return,
        annual_volatility=req.annual_volatility,
        time_horizon_days=req.time_horizon_days,
        num_simulations=req.num_simulations
    )
    return result

# ----------------- PERSONAL FINANCE ENDPOINTS ----------------- #

@app.get("/api/finance/transactions")
def get_transactions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/finance/transactions")
def create_transaction(tx: TransactionCreate):
    conn = get_db()
    cursor = conn.cursor()
    tx_id = f"tx-{uuid.uuid4().hex[:8]}"
    date_str = tx.date if tx.date else datetime.now().strftime("%Y-%m-%d")
    cursor.execute(
        "INSERT INTO transactions VALUES (?,?,?,?,?,?,?)",
        (tx_id, date_str, tx.title, tx.category, tx.type, tx.amount, "manual")
    )
    conn.commit()
    conn.close()
    return {"status": "success", "id": tx_id}

@app.delete("/api/finance/transactions/{tx_id}")
def delete_transaction(tx_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

@app.post("/api/finance/transactions/clear-all")
def clear_all_transactions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "All transactions cleared"}

@app.post("/api/finance/budget-goals/clear-all")
def clear_all_budget_goals():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM budget_goals")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "All budget goals cleared"}

@app.post("/api/finance/reset-blank")
def reset_all_finance_to_blank():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions")
    cursor.execute("DELETE FROM budget_goals")
    cursor.execute("DELETE FROM portfolio")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "All finance & portfolio records wiped. Fresh 0-state ready."}

@app.post("/api/finance/transactions/upload-csv")
async def upload_csv_transactions(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    conn = get_db()
    cursor = conn.cursor()
    added_count = 0
    
    for _, row in df.iterrows():
        tx_id = f"csv-{uuid.uuid4().hex[:8]}"
        date = str(row.get("date", row.get("Date", datetime.now().strftime("%Y-%m-%d"))))
        title = str(row.get("title", row.get("Description", row.get("Merchant", "CSV Expense"))))
        category = str(row.get("category", row.get("Category", "General")))
        tx_type = str(row.get("type", "expense")).lower()
        amount = float(row.get("amount", row.get("Amount", 0.0)))
        
        cursor.execute(
            "INSERT INTO transactions VALUES (?,?,?,?,?,?,?)",
            (tx_id, date, title, category, tx_type, abs(amount), "csv_upload")
        )
        added_count += 1
        
    conn.commit()
    conn.close()
    return {"status": "success", "added_count": added_count}

@app.post("/api/finance/transactions/plaid-sync")
def plaid_bank_sync():
    synced = generate_mock_synced_transactions(5)
    conn = get_db()
    cursor = conn.cursor()
    for tx in synced:
        cursor.execute(
            "INSERT INTO transactions VALUES (?,?,?,?,?,?,?)",
            (tx["id"], tx["date"], tx["title"], tx["category"], tx["type"], tx["amount"], tx["source"])
        )
    conn.commit()
    conn.close()
    return {"status": "success", "synced_transactions": synced}

@app.get("/api/finance/budget-goals")
def get_budget_goals():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM budget_goals")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/finance/budget-goals")
def upsert_budget_goal(bg: BudgetGoalCreate):
    conn = get_db()
    cursor = conn.cursor()
    bg_id = f"bg-{uuid.uuid4().hex[:8]}"
    cursor.execute("""
        INSERT INTO budget_goals (id, category, target_amount, current_amount)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(category) DO UPDATE SET
        target_amount=excluded.target_amount,
        current_amount=excluded.current_amount
    """, (bg_id, bg.category, bg.target_amount, bg.current_amount))
    conn.commit()
    conn.close()
    return {"status": "success"}

# ----------------- PORTFOLIO & AUDIT ENDPOINTS ----------------- #

@app.get("/api/finance/portfolio")
def get_portfolio():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM portfolio")
    rows = cursor.fetchall()
    conn.close()
    items = [dict(row) for row in rows]
    
    enriched = []
    total_val = 0.0
    total_cost = 0.0
    
    for item in items:
        stock = get_stock_data(item["ticker"])
        curr_price = stock["current_price"]
        market_val = curr_price * item["shares"]
        cost_basis = item["avg_price"] * item["shares"]
        gain = market_val - cost_basis
        gain_pct = (gain / cost_basis * 100) if cost_basis > 0 else 0.0
        
        total_val += market_val
        total_cost += cost_basis
        
        enriched.append({
            **item,
            "current_price": curr_price,
            "market_value": round(market_val, 2),
            "cost_basis": round(cost_basis, 2),
            "unrealized_gain": round(gain, 2),
            "unrealized_gain_pct": round(gain_pct, 2),
            "day_change_pct": stock["change_pct"],
            "pe_ratio": stock["pe_ratio"],
            "rsi": stock["rsi"]
        })
        
    return {
        "holdings": enriched,
        "summary": {
            "total_value": round(total_val, 2),
            "total_cost": round(total_cost, 2),
            "total_gain": round(total_val - total_cost, 2),
            "total_gain_pct": round((total_val - total_cost) / total_cost * 100, 2) if total_cost > 0 else 0.0
        }
    }

@app.post("/api/finance/portfolio")
def add_portfolio_item(item: PortfolioItemCreate):
    conn = get_db()
    cursor = conn.cursor()
    pf_id = f"pf-{uuid.uuid4().hex[:8]}"
    added_at = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("""
        INSERT INTO portfolio (id, ticker, shares, avg_price, sector, added_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(ticker) DO UPDATE SET
        shares=excluded.shares,
        avg_price=excluded.avg_price
    """, (pf_id, item.ticker.upper(), item.shares, item.avg_price, item.sector, added_at))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/finance/portfolio/{ticker}")
def delete_portfolio_item(ticker: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM portfolio WHERE ticker = ?", (ticker.upper(),))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

@app.get("/api/finance/portfolio/risk-analysis")
def get_portfolio_risk():
    pf_data = get_portfolio()
    holdings = pf_data["holdings"]
    total_val = pf_data["summary"]["total_value"]
    
    if total_val == 0:
        return {"risk_score_num": 0, "risk_label": "No Assets", "concentration": [], "sector_exposure": [], "metrics": {"beta_est": 0, "sharpe_ratio": 0, "max_drawdown_hist": "0%"}}

    sector_totals = {}
    concentration = []
    
    for h in holdings:
        weight = (h["market_value"] / total_val) * 100
        concentration.append({
            "ticker": h["ticker"],
            "weight_pct": round(weight, 1)
        })
        sec = h.get("sector", "Technology")
        sector_totals[sec] = sector_totals.get(sec, 0.0) + h["market_value"]
        
    sector_exposure = [
        {"sector": k, "weight_pct": round((v / total_val) * 100, 1)}
        for k, v in sector_totals.items()
    ]
    
    max_weight = max([c["weight_pct"] for c in concentration]) if concentration else 0
    tech_weight = sector_totals.get("Technology", 0) / total_val * 100
    
    risk_num = int(min(95, max_weight * 0.8 + tech_weight * 0.4 + 20))
    risk_label = "Conservative" if risk_num < 40 else ("Moderate" if risk_num < 70 else "High Growth / Concentrated")

    return {
        "risk_score_num": risk_num,
        "risk_label": risk_label,
        "concentration": sorted(concentration, key=lambda x: x["weight_pct"], reverse=True),
        "sector_exposure": sorted(sector_exposure, key=lambda x: x["weight_pct"], reverse=True),
        "metrics": {
            "beta_est": 1.28,
            "sharpe_ratio": 1.84,
            "max_drawdown_hist": "-14.2%"
        }
    }

@app.get("/api/audit-logs")
def get_audit_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    
    logs = []
    for r in rows:
        d = dict(r)
        d["context_json"] = json.loads(d["context_json"])
        d["response_json"] = json.loads(d["response_json"])
        logs.append(d)
    return logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
