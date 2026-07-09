"""
Efficient frontier construction via Monte Carlo portfolio simulation and
scipy-based optimization for minimum variance and maximum Sharpe ratio.
"""

import numpy as np
from scipy.optimize import minimize

from data import fetch_price_data, compute_daily_returns

TRADING_DAYS_PER_YEAR = 252


def _portfolio_performance(weights, mean_returns, cov_matrix, risk_free_rate):
    annual_return = np.dot(weights, mean_returns) * TRADING_DAYS_PER_YEAR
    annual_volatility = np.sqrt(
        np.dot(weights.T, np.dot(cov_matrix, weights)) * TRADING_DAYS_PER_YEAR
    )
    sharpe_ratio = (annual_return - risk_free_rate) / annual_volatility
    return annual_return, annual_volatility, sharpe_ratio


def _negative_sharpe(weights, mean_returns, cov_matrix, risk_free_rate):
    _, _, sharpe_ratio = _portfolio_performance(
        weights, mean_returns, cov_matrix, risk_free_rate
    )
    return -sharpe_ratio


def _portfolio_volatility(weights, mean_returns, cov_matrix, risk_free_rate):
    _, annual_volatility, _ = _portfolio_performance(
        weights, mean_returns, cov_matrix, risk_free_rate
    )
    return annual_volatility


def _optimize(objective, num_assets, mean_returns, cov_matrix, risk_free_rate):
    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1},)
    bounds = tuple((0, 1) for _ in range(num_assets))
    initial_guess = np.full(num_assets, 1 / num_assets)

    result = minimize(
        objective,
        initial_guess,
        args=(mean_returns, cov_matrix, risk_free_rate),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
    )
    return result.x


def compute_portfolio_performance(tickers, weights, start, risk_free_rate=0.04):
    """Compute annualized return, volatility, and Sharpe ratio for a given
    set of portfolio weights."""
    prices = fetch_price_data(tickers, start=start)
    returns = compute_daily_returns(prices)[tickers]

    mean_returns = returns.mean().to_numpy()
    cov_matrix = returns.cov().to_numpy()

    annual_return, annual_volatility, sharpe_ratio = _portfolio_performance(
        np.array(weights), mean_returns, cov_matrix, risk_free_rate
    )
    return {
        "weights": list(weights),
        "return": float(annual_return),
        "volatility": float(annual_volatility),
        "sharpe": float(sharpe_ratio),
    }


def run_efficient_frontier(tickers, start, simulations=5000, risk_free_rate=0.04):
    """Simulate random portfolios and locate the minimum variance and maximum
    Sharpe ratio portfolios via optimization.

    Returns a dict with all simulated portfolios (volatility/return/sharpe/
    weights lists), the minimum variance portfolio, and the maximum Sharpe
    ratio portfolio.
    """
    prices = fetch_price_data(tickers, start=start)
    returns = compute_daily_returns(prices)[tickers]

    mean_returns = returns.mean().to_numpy()
    cov_matrix = returns.cov().to_numpy()
    num_assets = len(tickers)

    random_weights = np.random.dirichlet(np.ones(num_assets), size=simulations)

    sim_volatility = np.empty(simulations)
    sim_return = np.empty(simulations)
    sim_sharpe = np.empty(simulations)

    for i in range(simulations):
        weights = random_weights[i]
        annual_return, annual_volatility, sharpe_ratio = _portfolio_performance(
            weights, mean_returns, cov_matrix, risk_free_rate
        )
        sim_return[i] = annual_return
        sim_volatility[i] = annual_volatility
        sim_sharpe[i] = sharpe_ratio

    min_variance_weights = _optimize(
        _portfolio_volatility, num_assets, mean_returns, cov_matrix, risk_free_rate
    )
    min_variance_return, min_variance_volatility, _ = _portfolio_performance(
        min_variance_weights, mean_returns, cov_matrix, risk_free_rate
    )

    max_sharpe_weights = _optimize(
        _negative_sharpe, num_assets, mean_returns, cov_matrix, risk_free_rate
    )
    max_sharpe_return, max_sharpe_volatility, max_sharpe_ratio = _portfolio_performance(
        max_sharpe_weights, mean_returns, cov_matrix, risk_free_rate
    )

    return {
        "tickers": tickers,
        "simulated_portfolios": {
            "volatility": sim_volatility.tolist(),
            "return": sim_return.tolist(),
            "sharpe": sim_sharpe.tolist(),
            "weights": random_weights.tolist(),
        },
        "min_variance_portfolio": {
            "weights": min_variance_weights.tolist(),
            "volatility": float(min_variance_volatility),
            "return": float(min_variance_return),
        },
        "max_sharpe_portfolio": {
            "weights": max_sharpe_weights.tolist(),
            "volatility": float(max_sharpe_volatility),
            "return": float(max_sharpe_return),
            "sharpe": float(max_sharpe_ratio),
        },
    }
