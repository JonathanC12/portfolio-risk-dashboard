# Portfolio Risk Dashboard

A full-stack quantitative finance web application that allows users to analyze the risk and performance of any stock portfolio. Users enter a set of tickers, portfolio allocations, and a start date to generate interactive visualizations including historical price performance, correlation analysis, risk metrics, Monte Carlo simulation, and Efficient Frontier optimization.

## Live Demo

**[https://portfolio-risk-dashboard-sigma.vercel.app/](https://portfolio-risk-dashboard-sigma.vercel.app/)**

> Note: The backend is hosted on Render's free tier, which spins down after periods of inactivity. The first load may take 30-60 seconds while the backend wakes from idle.

## Features

- **Normalized Price Performance Chart** — compare returns across holdings indexed to 100 at the start date
- **Portfolio Correlation Matrix** — interactive heatmap showing diversification across holdings
- **Risk Metrics Table** — annualized volatility, Sharpe ratio, and market beta for each holding
- **Monte Carlo Simulation** — 1,000 simulated portfolio paths over a 1-year horizon with 5th/50th/95th percentile outcomes and Value at Risk
- **Efficient Frontier** — 5,000 randomly weighted portfolios plotted by risk and return, with optimal max Sharpe and minimum variance portfolios identified via scipy constrained optimization
- **Fama-French 5-Factor Model** — OLS regression of portfolio returns against the Fama-French 5 factors (Market, SMB, HML, RMW, CMA) using statsmodels, with factor loadings table, horizontal bar chart, annualized alpha, R-squared, and a dynamically generated plain-English interpretation of the portfolio's factor exposures

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Plotly.js, Axios |
| Backend | Python, FastAPI, Uvicorn |
| Data | yfinance, pandas, numpy |
| Quantitative Finance | scipy.optimize (Efficient Frontier), Monte Carlo simulation (normal distribution sampling), Fama-French 5-Factor OLS Regression (statsmodels) |
| Deployment | Vercel (frontend), Render (backend) |

## Project Structure

```
portfolio-risk-dashboard/
├── backend/
│   ├── main.py         # FastAPI app and route definitions
│   ├── data.py         # yfinance data fetching and return calculations
│   ├── metrics.py      # Beta, volatility, Sharpe ratio calculations
│   ├── simulation.py   # Monte Carlo simulation engine
│   ├── optimization.py # Efficient Frontier via scipy.optimize
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ # React chart components
│   │   ├── api.js      # API calls to FastAPI backend
│   │   └── App.jsx     # Root component and state management
│   └── package.json
└── README.md
```

## Running Locally

**Prerequisites:** Python 3.11+, Node.js 18+

### Backend setup

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Frontend setup (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

## Methodology Notes

**Monte Carlo:** Simulations sample daily returns from a normal distribution fit to the portfolio's historical data and compound them forward over 252 trading days (1 trading year) to generate 1,000 possible future portfolio paths.

**Efficient Frontier:** 5,000 random weight combinations are generated using Dirichlet sampling to ensure even coverage of the allocation space. scipy's SLSQP optimizer is then used to solve for the minimum variance and maximum Sharpe ratio portfolios subject to the constraint that weights sum to 1.

**Limitations:** All outputs are backward-looking and based on historical return distributions, which are not guaranteed to predict future performance. Short date ranges may produce unintuitive or statistically unreliable results. Nothing in this application constitutes investment advice.

**Fama-French Factor Model:** Daily factor returns are downloaded directly from Kenneth French's data library at Dartmouth. Portfolio excess returns are regressed against the five factors using OLS via statsmodels. Factor loadings indicate the portfolio's exposure to each risk premium. R-squared measures how much of the portfolio's return variation is explained by the five factors combined.

## Author

**Jonathan Corll**
[LinkedIn](https://www.linkedin.com/in/jonathan-corll-19a0412a5/
) · [GitHub](https://github.com/JonathanC12)
