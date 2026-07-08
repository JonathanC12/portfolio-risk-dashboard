"""
Functions for fetching historical price data and computing daily returns.
"""

import yfinance as yf


def fetch_price_data(tickers, start, end=None):
    """Download adjusted close prices for a list of tickers over a date range."""
    data = yf.download(tickers, start=start, end=end, auto_adjust=True)["Close"]

    # yfinance returns a Series (not DataFrame) when given a single ticker.
    if data.ndim == 1:
        data = data.to_frame(name=tickers[0] if isinstance(tickers, list) else tickers)

    return data


def compute_daily_returns(price_df):
    """Convert prices into daily percentage returns."""
    returns = price_df.pct_change().dropna()
    return returns
