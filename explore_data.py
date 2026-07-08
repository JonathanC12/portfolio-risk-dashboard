"""
Pull historical prices for a handful of tickers,
compute daily returns, and print a correlation matrix.
"""

import yfinance as yf
import pandas as pd
import plotly.graph_objects as go

# ---- 1. Define your sample portfolio ----
TICKERS = ["VOO", "QQQ", "RVI", "NVDA", "CRWV", "SPY"]

# SPY is included as a market benchmark 

START_DATE = "2023-01-01"
END_DATE = "2026-06-29"  # today's date


def fetch_price_data(tickers, start, end):
    """Download adjusted close prices for a list of tickers."""
    print(f"Downloading data for {tickers}...")
    data = yf.download(tickers, start=start, end=end, auto_adjust=True)["Close"]
    return data


def compute_daily_returns(price_df):
    """Convert prices into daily percentage returns."""
    returns = price_df.pct_change().dropna()
    return returns


def plot_correlation_heatmap(corr_matrix):
    """Render the correlation matrix as an interactive Plotly heatmap."""
    fig = go.Figure(data=go.Heatmap(
        z=corr_matrix.values,
        x=corr_matrix.columns,
        y=corr_matrix.index,
        colorscale="RdBu",
        zmin=-1, zmax=1,
        text=corr_matrix.round(2).values,
        texttemplate="%{text}",
        textfont={"size": 12},
        colorbar=dict(title="Correlation"),
    ))
    fig.update_layout(
        title="Portfolio Correlation Matrix",
        xaxis_title="Ticker",
        yaxis_title="Ticker",
        width=700,
        height=600,
    )
    fig.show()


def main():
    # Step 1: Get the raw price data
    prices = fetch_price_data(TICKERS, START_DATE, END_DATE)

    print("\n--- Price Data Preview ---")
    print(prices.head())
    print(f"\nShape: {prices.shape[0]} trading days, {prices.shape[1]} tickers")

    # Step 2: Compute daily returns
    returns = compute_daily_returns(prices)

    print("\n--- Daily Returns Preview ---")
    print(returns.head())

    # Step 3: Basic summary stats (mean daily return, daily volatility)
    print("\n--- Summary Stats (Daily) ---")
    summary = pd.DataFrame({
        "Mean Daily Return": returns.mean(),
        "Daily Volatility (Std Dev)": returns.std(),
    })
    # Annualize for more intuitive numbers (252 trading days/year)
    summary["Annualized Return"] = summary["Mean Daily Return"] * 252
    summary["Annualized Volatility"] = summary["Daily Volatility (Std Dev)"] * (252 ** 0.5)
    print(summary)

    # Step 4: Correlation matrix 
    print("\n--- Correlation Matrix ---")
    corr_matrix = returns.corr()
    print(corr_matrix)

    # Step 5: Visualize it as an interactive heatmap (opens in your browser)
    plot_correlation_heatmap(corr_matrix)

    # Save outputs for later use (FastAPI will eventually serve this data)
    prices.to_csv("prices.csv")
    returns.to_csv("daily_returns.csv")
    corr_matrix.to_csv("correlation_matrix.csv")
    print("\nSaved prices.csv, daily_returns.csv, and correlation_matrix.csv")


if __name__ == "__main__":
    main()