"""
FastAPI application exposing portfolio price, return, and risk metric endpoints.
"""

from typing import List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, Query

from data import fetch_price_data, compute_daily_returns
from metrics import compute_correlation_matrix, compute_all_metrics

app = FastAPI(title="Portfolio Risk Dashboard API")

DEFAULT_START_DATE = "2023-01-01"
BENCHMARK_TICKER = "SPY"


def parse_tickers(tickers: str) -> List[str]:
    parsed = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not parsed:
        raise HTTPException(status_code=400, detail="At least one ticker must be provided")
    return parsed


def get_prices(tickers: List[str], start: str) -> pd.DataFrame:
    try:
        prices = fetch_price_data(tickers, start=start)
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
        "prices": prices.round(4).to_dict(orient="list"),
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
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to compute metrics: {exc}")

    return metrics.round(4).to_dict(orient="index")
