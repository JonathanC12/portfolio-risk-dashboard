"""
Monte Carlo simulation of future portfolio value paths.
"""

import numpy as np

from data import fetch_price_data, compute_daily_returns


def run_monte_carlo(tickers, weights, start, horizon=252, simulations=1000):
    """Simulate portfolio value paths by sampling daily returns from a normal
    distribution fit to historical weighted portfolio returns.

    Returns a dict with all simulated paths (normalized to 100 at start),
    the 5th/50th/95th percentile paths over time, summary statistics on the
    ending values, and the Value at Risk at 95% confidence.
    """
    prices = fetch_price_data(tickers, start=start)
    returns = compute_daily_returns(prices)

    weights_array = np.array(weights)
    portfolio_returns = returns[tickers].dot(weights_array)

    mean = portfolio_returns.mean()
    std = portfolio_returns.std()

    sampled_returns = np.random.normal(mean, std, size=(simulations, horizon))
    growth_factors = np.cumprod(1 + sampled_returns, axis=1)

    start_values = np.full((simulations, 1), 100.0)
    paths = np.concatenate([start_values, 100.0 * growth_factors], axis=1)

    percentile_5 = np.percentile(paths, 5, axis=0)
    percentile_50 = np.percentile(paths, 50, axis=0)
    percentile_95 = np.percentile(paths, 95, axis=0)

    final_values = paths[:, -1]
    final_percentile_5 = np.percentile(final_values, 5)
    final_percentile_50 = np.percentile(final_values, 50)
    final_percentile_95 = np.percentile(final_values, 95)

    # VaR at 95% confidence: the loss (relative to the starting value of
    # 100) that is not expected to be exceeded in 95% of simulated outcomes.
    value_at_risk_95 = 100.0 - final_percentile_5

    return {
        "paths": paths.tolist(),
        "percentile_5": percentile_5.tolist(),
        "percentile_50": percentile_50.tolist(),
        "percentile_95": percentile_95.tolist(),
        "final_value_stats": {
            "mean": float(final_values.mean()),
            "std": float(final_values.std()),
            "percentile_5": float(final_percentile_5),
            "percentile_50": float(final_percentile_50),
            "percentile_95": float(final_percentile_95),
        },
        "value_at_risk_95": float(value_at_risk_95),
    }
