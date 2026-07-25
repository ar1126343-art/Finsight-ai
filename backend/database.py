import sqlite3
import json
from datetime import datetime
from config import DB_PATH

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            source TEXT DEFAULT 'manual'
        )
    ''')
    
    # Budget goals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS budget_goals (
            id TEXT PRIMARY KEY,
            category TEXT UNIQUE NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0.0
        )
    ''')
    
    # Portfolio holdings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio (
            id TEXT PRIMARY KEY,
            ticker TEXT UNIQUE NOT NULL,
            shares REAL NOT NULL,
            avg_price REAL NOT NULL,
            sector TEXT,
            added_at TEXT
        )
    ''')
    
    # System settings table to track initialization
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    
    # Audit log table for AI calls
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            ticker TEXT NOT NULL,
            prompt TEXT NOT NULL,
            context_json TEXT NOT NULL,
            response_json TEXT NOT NULL,
            duration_ms INTEGER NOT NULL,
            tokens_used INTEGER NOT NULL
        )
    ''')

    # Seed initial demo data ONLY on first setup ever
    cursor.execute("SELECT value FROM system_settings WHERE key = 'initialized'")
    setting = cursor.fetchone()
    
    if not setting:
        # Seed initial demo transactions
        demo_txs = [
            ("tx-1", "2026-07-20", "Apple Store - Mac Studio", "Electronics & Tech", "expense", 1999.00, "manual"),
            ("tx-2", "2026-07-19", "Bi-Weekly Salary Paycheck", "Income", "income", 4250.00, "plaid_sync"),
            ("tx-3", "2026-07-18", "Whole Foods Market", "Groceries", "expense", 184.20, "plaid_sync"),
            ("tx-4", "2026-07-16", "Tesla Supercharger", "Transportation", "expense", 32.50, "manual"),
            ("tx-5", "2026-07-14", "Equinox Fitness Subscription", "Health & Fitness", "expense", 240.00, "plaid_sync")
        ]
        cursor.executemany("INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?,?)", demo_txs)

        # Seed initial budget goals
        demo_budgets = [
            ("bg-1", "Groceries", 600.0, 184.20),
            ("bg-2", "Dining & Drinks", 300.0, 145.00),
            ("bg-3", "Electronics & Tech", 2500.0, 1999.00),
            ("bg-4", "Transportation", 200.0, 85.00),
            ("bg-5", "Health & Fitness", 300.0, 240.00)
        ]
        cursor.executemany("INSERT OR IGNORE INTO budget_goals VALUES (?,?,?,?)", demo_budgets)

        # Seed initial portfolio holdings
        demo_portfolio = [
            ("pf-1", "AAPL", 45.0, 175.50, "Technology", "2026-01-10"),
            ("pf-2", "NVDA", 25.0, 110.20, "Technology", "2026-02-15"),
            ("pf-3", "MSFT", 20.0, 380.00, "Technology", "2026-03-01")
        ]
        cursor.executemany("INSERT OR IGNORE INTO portfolio VALUES (?,?,?,?,?,?)", demo_portfolio)

        cursor.execute("INSERT OR REPLACE INTO system_settings VALUES ('initialized', 'true')")

    # Seed AI audit log entries if empty so the inspector always has active data
    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    count = cursor.fetchone()[0]
    if count == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        aapl_resp = json.dumps({
            "analysis": {
                "label": "Strong Buy",
                "thesis": "Apple demonstrates resilient iPhone revenue and expanding high-margin Services ecosystem with strong Free Cash Flow.",
                "why_moved": "Services revenue accelerated +12% YoY, driving margin expansion.",
                "catalysts": ["Generative AI Siri overhaul", "M4 Mac line refresh", "Services ARR growth"],
                "risks": ["Greater China hardware competition", "Regulatory App Store scrutiny"],
                "disclaimer": "FinSight AI model output for decision support. Not direct financial advice."
            }
        })
        demo_logs = [
            ("audit-1", now_str, "AAPL", "Generate structured AI investment thesis for AAPL based on P/E 33.2, RSI 62.4, and MA indicators.", json.dumps({"ticker": "AAPL", "pe": 33.2}), aapl_resp, 620, 340),
            ("audit-2", now_str, "NVDA", "Generate structured AI investment thesis for NVDA based on Blackwell GPU demand and datacenter revenue.", json.dumps({"ticker": "NVDA", "pe": 48.5}), aapl_resp, 710, 410)
        ]
        cursor.executemany("INSERT OR IGNORE INTO audit_logs VALUES (?,?,?,?,?,?,?,?)", demo_logs)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")
