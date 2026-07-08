"""
Functions for computing portfolio risk metrics from daily returns.
"""

import numpy as np
import pandas as pd

from data import fetch_price_data, compute_daily_returns

TRADING_DAYS_PER_YEAR = 252


def compute_correlation_matrix(returns):
    """Compute the correlation matrix of daily returns."""
    return returns.corr()


def compute_annualized_volatility(returns):
    """Annualize daily return volatility (std dev) for each ticker."""
    return returns.std() * np.sqrt(TRADING_DAYS_PER_YEAR)


def compute_sharpe_ratio(returns, risk_free_rate=0.0):
    """Compute the annualized Sharpe ratio for each ticker.

    risk_free_rate is an annualized rate (e.g. 0.04 for 4%).
    """
    excess_daily_return = returns.mean() - (risk_free_rate / TRADING_DAYS_PER_YEAR)
    annualized_excess_return = excess_daily_return * TRADING_DAYS_PER_YEAR
    annualized_volatility = compute_annualized_volatility(returns)
    return annualized_excess_return / annualized_volatility


def compute_beta(returns, benchmark="SPY"):
    """Compute beta of each ticker's returns against a benchmark ticker."""
    if benchmark not in returns.columns:
        raise ValueError(f"Benchmark ticker '{benchmark}' not found in returns data")

    benchmark_returns = returns[benchmark]
    benchmark_variance = benchmark_returns.var()

    betas = {
        ticker: returns[ticker].cov(benchmark_returns) / benchmark_variance
        for ticker in returns.columns
    }
    return pd.Series(betas, name="beta")


def compute_all_metrics(tickers, start, end=None, benchmark="SPY", risk_free_rate=0.0):
    """Fetch price data and compute all core risk metrics in a single pass."""
    prices = fetch_price_data(tickers, start=start, end=end)
    returns = compute_daily_returns(prices)

    result = pd.DataFrame({
        "annualized_volatility": compute_annualized_volatility(returns),
        "sharpe_ratio": compute_sharpe_ratio(returns, risk_free_rate=risk_free_rate),
        "beta": compute_beta(returns, benchmark=benchmark),
    })

    # Round first: once NaN/inf become None below, the DataFrame is object
    # dtype and .round() silently no-ops on non-numeric columns.
    result = result.round(4)

    # NaN/inf (e.g. from a zero-variance benchmark) aren't valid JSON;
    # FastAPI raises a ValueError trying to serialize them.
    result = result.replace([np.inf, -np.inf], np.nan)
    result = result.astype(object).where(pd.notnull(result), None)

    return result
