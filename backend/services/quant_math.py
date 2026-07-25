import numpy as np

def calculate_dcf(
    fcf: float, # in Millions (e.g. 108000 for $108B)
    growth_rate: float, # e.g. 0.08 for 8%
    terminal_growth: float, # e.g. 0.025 for 2.5%
    discount_rate: float, # e.g. 0.09 for 9% WACC
    shares_outstanding: float, # in Millions (e.g. 15200 for 15.2B)
    total_debt: float, # in Millions
    cash_and_equiv: float, # in Millions
    projection_years: int = 5
) -> dict:
    """
    Computes Discounted Cash Flow (DCF) Intrinsic Value per share with exact financial formulas.
    All balance sheet inputs are assumed in $ Millions.
    """
    if shares_outstanding <= 0:
        shares_outstanding = 1.0

    # Ensure discount rate > terminal growth to prevent NaN/Infinity
    denom = max(0.005, discount_rate - terminal_growth)

    future_cash_flows = []
    pv_cash_flows = []
    
    current_fcf = fcf
    for i in range(1, projection_years + 1):
        current_fcf *= (1 + growth_rate)
        discount_factor = (1 + discount_rate) ** i
        pv_fcf = current_fcf / discount_factor
        future_cash_flows.append(round(current_fcf, 2))
        pv_cash_flows.append(round(pv_fcf, 2))

    # 1. Terminal Value calculation at Year 5
    terminal_value = (future_cash_flows[-1] * (1 + terminal_growth)) / denom
    
    # 2. Present Value of Terminal Value
    pv_terminal_value = terminal_value / ((1 + discount_rate) ** projection_years)
    
    # 3. Total Enterprise Value (Sum PV FCF + PV Terminal Value)
    enterprise_value = sum(pv_cash_flows) + pv_terminal_value
    
    # 4. Total Equity Value = Enterprise Value + Cash - Total Debt
    equity_value = enterprise_value + cash_and_equiv - total_debt
    
    # 5. Intrinsic Value Per Share = Equity Value ($M) / Shares Outstanding ($M)
    intrinsic_value_per_share = round(max(0.01, equity_value / shares_outstanding), 2)
    
    def format_financial_amount(val_m: float) -> str:
        if val_m is None or np.isnan(val_m) or np.isinf(val_m):
            return "$0.00 Million"
        if abs(val_m) >= 1000:
            return f"${val_m / 1000:.2f} Billion"
        return f"${val_m:,.2f} Million"

    return {
        "intrinsic_value_per_share": intrinsic_value_per_share,
        "enterprise_value": round(enterprise_value, 2),
        "enterprise_value_millions": round(enterprise_value, 2),
        "enterprise_value_formatted": format_financial_amount(enterprise_value),
        "equity_value": round(equity_value, 2),
        "equity_value_millions": round(equity_value, 2),
        "equity_value_formatted": format_financial_amount(equity_value),
        "pv_terminal_value": round(pv_terminal_value, 2),
        "pv_terminal_value_millions": round(pv_terminal_value, 2),
        "pv_terminal_value_formatted": format_financial_amount(pv_terminal_value),
        "projected_fcf": future_cash_flows,
        "pv_fcf": pv_cash_flows,
        "terminal_value": round(terminal_value, 2),
        "terminal_value_millions": round(terminal_value, 2),
        "terminal_value_formatted": format_financial_amount(terminal_value)
    }

def run_monte_carlo_simulation(
    initial_portfolio_value: float,
    expected_annual_return: float = 0.10,
    annual_volatility: float = 0.18,
    time_horizon_days: int = 252,
    num_simulations: int = 100
) -> dict:
    """
    Executes a Monte Carlo portfolio simulation using Geometric Brownian Motion.
    Returns percentile trajectory paths and formatted chart lines.
    """
    dt = 1 / 252.0
    drift = (expected_annual_return - 0.5 * annual_volatility ** 2) * dt
    shock_std = annual_volatility * np.sqrt(dt)

    np.random.seed(42)
    daily_shocks = np.random.normal(0, 1, (num_simulations, time_horizon_days))
    daily_returns = np.exp(drift + shock_std * daily_shocks)

    trajectories = np.zeros((num_simulations, time_horizon_days + 1))
    trajectories[:, 0] = initial_portfolio_value

    for t in range(1, time_horizon_days + 1):
        trajectories[:, t] = trajectories[:, t - 1] * daily_returns[:, t - 1]

    p10 = np.percentile(trajectories, 10, axis=0).round(2).tolist()
    p50 = np.percentile(trajectories, 50, axis=0).round(2).tolist()
    p90 = np.percentile(trajectories, 90, axis=0).round(2).tolist()

    ending_values = trajectories[:, -1]

    # Format chart lines for Recharts
    # Downsample points for smooth high performance rendering (every 5 days)
    chart_lines = []
    step = max(1, time_horizon_days // 50)
    for day in range(0, time_horizon_days + 1, step):
        chart_lines.append({
            "day": f"Day {day}",
            "p10": p10[day],
            "p50": p50[day],
            "p90": p90[day]
        })

    return {
        "days": list(range(time_horizon_days + 1)),
        "chart_lines": chart_lines,
        "trajectories_sample": ["p10", "p50", "p90"],
        "p10_path": p10,
        "p50_path": p50,
        "p90_path": p90,
        "stats": {
            "initial_value": initial_portfolio_value,
            "median_final_value": round(float(np.median(ending_values)), 2),
            "p5_final_value": round(float(np.percentile(ending_values, 5)), 2),
            "p95_final_value": round(float(np.percentile(ending_values, 95)), 2),
            "profit_probability": round(float(np.mean(ending_values > initial_portfolio_value) * 100), 1)
        }
    }
