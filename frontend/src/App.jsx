import { useState } from "react";
import TickerInput from "./components/TickerInput";
import MetricsTable from "./components/MetricsTable";
import CorrelationHeatmap from "./components/CorrelationHeatmap";
import PriceChart from "./components/PriceChart";
import { getPrices, getReturns, getCorrelation, getMetrics } from "./api";
import "./App.css";

function getErrorMessage(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  return err.message;
}

function App() {
  const [tickers, setTickers] = useState("AAPL, MSFT, SPY");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prices, setPrices] = useState(null);
  const [returns, setReturns] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [metrics, setMetrics] = useState(null);

  async function handleSubmit(newTickers, newStartDate) {
    setTickers(newTickers);
    setStartDate(newStartDate);
    setLoading(true);
    setError(null);

    try {
      const [pricesData, returnsData, correlationData, metricsData] = await Promise.all([
        getPrices(newTickers, newStartDate),
        getReturns(newTickers, newStartDate),
        getCorrelation(newTickers, newStartDate),
        getMetrics(newTickers, newStartDate),
      ]);
      setPrices(pricesData);
      setReturns(returnsData);
      setCorrelation(correlationData);
      setMetrics(metricsData);
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

      <TickerInput
        tickers={tickers}
        startDate={startDate}
        loading={loading}
        onSubmit={handleSubmit}
      />

      {error && <p className="error">{error}</p>}

      {hasData && (
        <div className="dashboard">
          <PriceChart prices={prices} />
          <CorrelationHeatmap correlation={correlation} />
          <MetricsTable metrics={metrics} />
        </div>
      )}
    </div>
  );
}

export default App;
