"""
Fama-French 5-factor regression analysis of portfolio returns.
"""

import io
import zipfile

import numpy as np
import pandas as pd
import requests
import statsmodels.api as sm

from data import fetch_price_data, compute_daily_returns

FAMA_FRENCH_5_FACTOR_URL = (
    "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/"
    "F-F_Research_Data_5_Factors_2x3_daily_CSV.zip"
)

FACTOR_COLUMNS = ["Mkt-RF", "SMB", "HML", "RMW", "CMA"]


def fetch_fama_french_factors():
    """Download and parse the Fama-French 5-factor daily dataset.

    Returns a DataFrame indexed by date with columns Mkt-RF, SMB, HML,
    RMW, CMA, and RF, expressed as decimal (not percentage) returns.
    """
    response = requests.get(FAMA_FRENCH_5_FACTOR_URL, timeout=30)
    response.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        csv_name = archive.namelist()[0]
        with archive.open(csv_name) as csv_file:
            raw_text = csv_file.read().decode("utf-8")

    # The file has a header banner and a monthly section appended after the
    # daily data. The daily rows are the ones whose first column is an
    # 8-digit date (YYYYMMDD); everything else is preamble or trailing notes.
    lines = raw_text.splitlines()
    data_lines = [line for line in lines if line.strip()[:8].isdigit() and "," in line]

    factors = pd.read_csv(
        io.StringIO("\n".join(data_lines)),
        header=None,
        names=["Date", "Mkt-RF", "SMB", "HML", "RMW", "CMA", "RF"],
    )

    factors.columns = [col.strip() for col in factors.columns]
    factors["Date"] = pd.to_datetime(factors["Date"], format="%Y%m%d")
    factors = factors.set_index("Date")

    for column in FACTOR_COLUMNS + ["RF"]:
        factors[column] = factors[column].astype(float) / 100.0

    return factors


def run_factor_model(tickers, weights, start):
    """Regress portfolio excess returns against the Fama-French 5 factors.

    Returns a dict with alpha, factor loadings, r_squared, and p_values.
    """
    prices = fetch_price_data(tickers, start=start)
    returns = compute_daily_returns(prices)

    weights_array = np.array(weights)
    portfolio_returns = returns[tickers].dot(weights_array)
    portfolio_returns.name = "portfolio_return"

    factors = fetch_fama_french_factors()

    merged = pd.merge(
        portfolio_returns,
        factors,
        left_index=True,
        right_index=True,
        how="inner",
    )

    excess_returns = merged["portfolio_return"] - merged["RF"]

    independent = sm.add_constant(merged[FACTOR_COLUMNS])
    model = sm.OLS(excess_returns, independent).fit()

    return {
        "alpha": float(model.params["const"]),
        "factor_loadings": {
            factor: float(model.params[factor]) for factor in FACTOR_COLUMNS
        },
        "r_squared": float(model.rsquared),
        "p_values": {
            "alpha": float(model.pvalues["const"]),
            **{factor: float(model.pvalues[factor]) for factor in FACTOR_COLUMNS},
        },
    }
