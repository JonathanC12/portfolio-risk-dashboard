"""
Functions for fetching historical price data and computing daily returns.
"""

import yfinance as yf
from fastapi import HTTPException


def fetch_price_data(tickers, start, end=None):
    """Download adjusted close prices for a list of tickers over a date range."""
    ticker_list = tickers if isinstance(tickers, list) else [tickers]

    data = yf.download(tickers, start=start, end=end, auto_adjust=True)["Close"]

    # yfinance returns a Series (not DataFrame) when given a single ticker.
    if data.ndim == 1:
        data = data.to_frame(name=ticker_list[0])

    missing = [ticker for ticker in ticker_list if ticker not in data.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=(
                f"No data found for the following tickers: {', '.join(missing)}. "
                "They may be invalid or unsupported."
            ),
        )

    insufficient = [
        ticker for ticker in ticker_list if data[ticker].notna().sum() < 2
    ]
    if insufficient:
        data = data.drop(columns=insufficient)
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient data for the following tickers in the requested "
                f"date range: {', '.join(insufficient)}."
            ),
        )

    return data


def compute_daily_returns(price_df):
    """Convert prices into daily percentage returns."""
    returns = price_df.pct_change().dropna()
    return returns
