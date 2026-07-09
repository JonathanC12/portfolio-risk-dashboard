import { useState } from "react";
import TickerInput from "./components/TickerInput";
import MetricsTable from "./components/MetricsTable";
import CorrelationHeatmap from "./components/CorrelationHeatmap";
import PriceChart from "./components/PriceChart";
import MonteCarloChart from "./components/MonteCarloChart";
import EfficientFrontierChart from "./components/EfficientFrontierChart";
import {
  getPrices,
  getReturns,
  getCorrelation,
  getMetrics,
  getMonteCarlo,
  getEfficientFrontier,
} from "./api";
import "./App.css";

function getErrorMessage(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  return err.message;
}

function buildEqualWeights(tickers) {
  const tickerCount = tickers
    .split(",")
    .map((ticker) => ticker.trim())
    .filter(Boolean).length;

  if (tickerCount === 0) {
    return "";
  }

  return Array(tickerCount).fill(1 / tickerCount).join(",");
}

function App() {
  const [tickers, setTickers] = useState("AAPL, MSFT, SPY");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [weights, setWeights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prices, setPrices] = useState(null);
  const [returns, setReturns] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [monteCarlo, setMonteCarlo] = useState(null);
  const [frontier, setFrontier] = useState(null);

  async function handleSubmit(newTickers, newStartDate, newWeights) {
    setTickers(newTickers);
    setStartDate(newStartDate);
    setWeights(newWeights);
    setLoading(true);
    setError(null);

    const resolvedWeights = newWeights.trim()
      ? newWeights
      : buildEqualWeights(newTickers);

    try {
      const [
        pricesData,
        returnsData,
        correlationData,
        metricsData,
        monteCarloData,
        frontierData,
      ] = await Promise.all([
        getPrices(newTickers, newStartDate),
        getReturns(newTickers, newStartDate),
        getCorrelation(newTickers, newStartDate),
        getMetrics(newTickers, newStartDate),
        getMonteCarlo(newTickers, resolvedWeights, newStartDate),
        getEfficientFrontier(newTickers, newStartDate, resolvedWeights),
      ]);
      setPrices(pricesData);
      setReturns(returnsData);
      setCorrelation(correlationData);
      setMetrics(metricsData);
      setMonteCarlo(monteCarloData);
      setFrontier(frontierData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const hasData = prices && returns && correlation && metrics;

  return (
    <div className="app">
      <h1>Portfolio Risk Dashboard</h1>

      <div className="app-intro">
        <p>
          Analyze the risk and performance of any stock portfolio by entering
          a set of tickers and a start date.
        </p>
        <ul>
          <li>
            Compare normalized price performance across holdings and against
            the S&amp;P 500 benchmark
          </li>
          <li>
            Measure diversification through a correlation matrix — lower
            correlation between holdings means better risk-adjusted returns
          </li>
          <li>
            Evaluate each holding's risk profile through annualized
            volatility, Sharpe ratio, and market beta
          </li>
        </ul>
      </div>

      <div className="disclaimer-box">
        All analysis is based on historical data. Past performance does not
        guarantee future results. The Efficient Frontier and metrics reflect
        your selected date range only and may not represent typical market
        conditions. Monte Carlo simulations model a range of possible future
        outcomes based on historical return distributions, they are not
        predictions. Nothing on this dashboard constitutes investment advice.
      </div>

      <TickerInput
        tickers={tickers}
        startDate={startDate}
        weights={weights}
        loading={loading}
        onSubmit={handleSubmit}
      />

      {error && <p className="error">{error}</p>}

      {hasData && (
        <div className="dashboard">
          <PriceChart prices={prices} />
          <CorrelationHeatmap correlation={correlation} />
          <MetricsTable metrics={metrics} />
          {monteCarlo && <MonteCarloChart monteCarlo={monteCarlo} />}
          {frontier && <EfficientFrontierChart frontier={frontier} />}
        </div>
      )}
    </div>
  );
}

export default App;
