import random
import uuid
from datetime import datetime, timedelta

MOCK_INSTITUTIONS = [
    {"name": "Chase Private Client", "type": "Checking ****4821", "balance": 18450.00},
    {"name": "Bank of America Preferred", "type": "Credit Card ****9012", "balance": -1240.50},
    {"name": "Fidelity Investments", "type": "Brokerage ****7741", "balance": 142800.00},
    {"name": "Charles Schwab", "type": "Roth IRA ****3310", "balance": 68400.00}
]

MOCK_MERCHANTS = [
    ("Equinox Gym", "Health & Fitness", "expense", 240.00),
    ("Trader Joe's", "Groceries", "expense", 94.60),
    ("Uber Enterprise", "Transportation", "expense", 38.40),
    ("Amazon.com", "Shopping", "expense", 129.99),
    ("Stripe Payout - Advisory", "Income", "income", 1850.00),
    ("Starbucks Reserve", "Dining & Drinks", "expense", 12.50),
    ("Netflix Premium 4K", "Entertainment", "expense", 22.99),
    ("Chevron Gas", "Transportation", "expense", 54.20)
]

def generate_mock_synced_transactions(count: int = 5):
    txs = []
    now = datetime.now()
    for i in range(count):
        merchant, category, tx_type, amount = random.choice(MOCK_MERCHANTS)
        date_offset = random.randint(0, 5)
        tx_date = (now - timedelta(days=date_offset)).strftime("%Y-%m-%d")
        txs.append({
            "id": f"plaid-{uuid.uuid4().hex[:8]}",
            "date": tx_date,
            "title": f"{merchant}",
            "category": category,
            "type": tx_type,
            "amount": round(amount + random.uniform(-5.0, 5.0), 2),
            "source": "plaid_sync"
        })
    return txs
