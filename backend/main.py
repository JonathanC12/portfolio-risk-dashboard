"""
FastAPI application exposing portfolio price, return, and risk metric endpoints.
"""

import math
from typing import List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Query

from data import fetch_price_data, compute_daily_returns
from metrics import compute_correlation_matrix, compute_all_metrics
from simulation import run_monte_carlo
from optimization import run_efficient_frontier, compute_portfolio_performance
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Portfolio Risk Dashboard API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_START_DATE = "2023-01-01"
BENCHMARK_TICKER = "SPY"
DEFAULT_HORIZON = 252
DEFAULT_SIMULATIONS = 1000
DEFAULT_FRONTIER_SIMULATIONS = 5000
DEFAULT_RISK_FREE_RATE = 0.04


def sanitize_json_floats(values_by_ticker: dict) -> dict:
    """Replace NaN/inf values with None so the dict is JSON-serializable."""
    return {
        ticker: [
            None if isinstance(value, float) and (math.isnan(value) or math.isinf(value)) else value
            for value in values
        ]
        for ticker, values in values_by_ticker.items()
    }


def parse_tickers(tickers: str) -> List[str]:
    parsed = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not parsed:
        raise HTTPException(status_code=400, detail="At least one ticker must be provided")
    return parsed


def parse_weights(weights: str, num_tickers: int) -> List[float]:
    parsed = [w.strip() for w in weights.split(",") if w.strip()]
    try:
        parsed_floats = [float(w) for w in parsed]
    except ValueError:
        raise HTTPException(status_code=400, detail="Weights must be numeric values")

    if len(parsed_floats) != num_tickers:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Number of weights ({len(parsed_floats)}) must match number "
                f"of tickers ({num_tickers})"
            ),
        )

    if not math.isclose(sum(parsed_floats), 1.0, abs_tol=1e-3):
        raise HTTPException(status_code=400, detail="Weights must sum to 1")

    return parsed_floats


def get_prices(tickers: List[str], start: str) -> pd.DataFrame:
    try:
        prices = fetch_price_data(tickers, start=start)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch price data: {exc}")

    if prices.empty:
        raise HTTPException(status_code=404, detail="No price data found for given tickers/date range")

    return prices


@app.get("/portfolio/prices")
def get_portfolio_prices(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. AMZN,MSFT,SPY"),
    start: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
):
    ticker_list = parse_tickers(tickers)
    prices = get_prices(ticker_list, start or DEFAULT_START_DATE)

    return {
        "tickers": list(prices.columns),
        "dates": [d.strftime("%Y-%m-%d") for d in prices.index],
        "prices": sanitize_json_floats(prices.round(4).to_dict(orient="list")),
    }


@app.get("/portfolio/returns")
def get_portfolio_returns(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. AMZN,MSFT,SPY"),
    start: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
):
    ticker_list = parse_tickers(tickers)
    prices = get_prices(ticker_list, start or DEFAULT_START_DATE)
    returns = compute_daily_returns(prices)

    return {
        "tickers": list(returns.columns),
        "dates": [d.strftime("%Y-%m-%d") for d in returns.index],
        "returns": returns.round(6).to_dict(orient="list"),
    }


@app.get("/portfolio/correlation")
def get_portfolio_correlation(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. AMZN,MSFT,SPY"),
    start: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
):
    ticker_list = parse_tickers(tickers)
    prices = get_prices(ticker_list, start or DEFAULT_START_DATE)
    returns = compute_daily_returns(prices)
    corr = compute_correlation_matrix(returns)

    return {
        "tickers": list(corr.columns),
        "correlation_matrix": corr.round(4).to_dict(orient="index"),
    }


@app.get("/portfolio/metrics")
def get_portfolio_metrics(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. AMZN,MSFT,SPY"),
    start: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
):
    ticker_list = parse_tickers(tickers)

    # Beta requires the benchmark to be present in the fetched data.
    if BENCHMARK_TICKER not in ticker_list:
        ticker_list.append(BENCHMARK_TICKER)

    try:
        metrics = compute_all_metrics(
            ticker_list, start=start or DEFAULT_START_DATE, benchmark=BENCHMARK_TICKER
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to compute metrics: {exc}")

    return metrics.round(4).to_dict(orient="index")


@app.get("/portfolio/montecarlo")
def get_portfolio_montecarlo(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. AMZN,MSFT,SPY"),
    weights: str = Query(..., description="Comma-separated weights matching tickers, must sum to 1"),
    start: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    horizon: int = Query(DEFAULT_HORIZON, description="Number of trading days to simulate forward"),
    simulations: int = Query(DEFAULT_SIMULATIONS, description="Number of simulation paths to run"),
):
    ticker_list = parse_tickers(tickers)
    weight_list = parse_weights(weights, len(ticker_list))

    try:
        result = run_monte_carlo(
            ticker_list,
            weight_list,
            start=start or DEFAULT_START_DATE,
            horizon=horizon,
            simulations=simulations,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to run Monte Carlo simulation: {exc}")

    return result


@app.get("/portfolio/frontier")
def get_portfolio_frontier(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. AMZN,MSFT,SPY"),
    start: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    simulations: int = Query(DEFAULT_FRONTIER_SIMULATIONS, description="Number of random portfolios to simulate"),
    risk_free_rate: float = Query(DEFAULT_RISK_FREE_RATE, description="Annual risk-free rate used for Sharpe ratio"),
    weights: Optional[str] = Query(None, description="Comma-separated weights matching tickers, must sum to 1"),
):
    ticker_list = parse_tickers(tickers)
    weight_list = parse_weights(weights, len(ticker_list)) if weights else None

    try:
        result = run_efficient_frontier(
            ticker_list,
            start=start or DEFAULT_START_DATE,
            simulations=simulations,
            risk_free_rate=risk_free_rate,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to compute efficient frontier: {exc}")

    if weight_list is not None:
        result["current_portfolio"] = compute_portfolio_performance(
            ticker_list, weight_list, start or DEFAULT_START_DATE, risk_free_rate
        )

    return result
