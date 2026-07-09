const HIGH_SHARPE_THRESHOLD = 1;
const HIGH_BETA_THRESHOLD = 1.2;
const BENCHMARK_TICKER = "SPY";

const METRIC_EXPLANATIONS = {
  Volatility:
    "Measures how much a stock's price fluctuates annually. Lower is more stable. SPY (the market) typically runs around 15-20%. Above 30% is considered high.",
  "Sharpe Ratio":
    "Return earned per unit of risk taken. Higher is better. Above 1.0 is good, above 2.0 is excellent. Below 0.5 means the returns may not justify the risk.",
  Beta: "Measures sensitivity to overall market moves. Beta of 1 means it moves with the market. Below 1 is more defensive, above 1 amplifies market moves. Above 1.5 is considered high risk.",
};

function sharpeColor(sharpe) {
  return sharpe >= HIGH_SHARPE_THRESHOLD ? "#1a7f37" : "inherit";
}

function betaColor(beta) {
  return beta >= HIGH_BETA_THRESHOLD ? "#c92a2a" : "inherit";
}

function MetricHeader({ label }) {
  return (
    <th>
      {label}
      <span className="info-tooltip" tabIndex={0}>
        <span className="info-tooltip-icon" aria-hidden="true">
          ?
        </span>
        <span className="info-tooltip-text">{METRIC_EXPLANATIONS[label]}</span>
      </span>
    </th>
  );
}

function MetricsTable({ metrics }) {
  const tickers = Object.keys(metrics);

  return (
    <table className="metrics-table">
      <thead>
        <tr>
          <th>Ticker</th>
          <MetricHeader label="Volatility" />
          <MetricHeader label="Sharpe Ratio" />
          <MetricHeader label="Beta" />
        </tr>
      </thead>
      <tbody>
        {tickers.map((ticker) => {
          const { annualized_volatility, sharpe_ratio, beta } = metrics[ticker];
          return (
            <tr key={ticker}>
              <td>
                {ticker}
                {ticker === BENCHMARK_TICKER && (
                  <span className="benchmark-label">Benchmark</span>
                )}
              </td>
              <td>{annualized_volatility.toFixed(4)}</td>
              <td style={{ color: sharpeColor(sharpe_ratio), fontWeight: 600 }}>
                {sharpe_ratio.toFixed(4)}
              </td>
              <td style={{ color: betaColor(beta), fontWeight: 600 }}>
                {beta.toFixed(4)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default MetricsTable;
