const HIGH_SHARPE_THRESHOLD = 1;
const HIGH_BETA_THRESHOLD = 1.2;
const HIGH_BETA_AMPLIFIER_THRESHOLD = 1.5;
const REDUNDANT_CORRELATION_THRESHOLD = 0.8;
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

function formatList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function getTopByMetric(tickers, metrics, metricKey) {
  if (tickers.length === 0) return null;
  return tickers.reduce(
    (best, ticker) => (metrics[ticker][metricKey] > metrics[best][metricKey] ? ticker : best),
    tickers[0]
  );
}

function getRedundantPairs(tickers, correlationData) {
  if (!correlationData) return [];
  const { correlation_matrix: correlationMatrix } = correlationData;
  const candidates = tickers.filter((ticker) => ticker !== BENCHMARK_TICKER);
  const pairs = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      const value = correlationMatrix?.[a]?.[b];
      if (typeof value === "number" && value > REDUNDANT_CORRELATION_THRESHOLD) {
        pairs.push({ a, b, value });
      }
    }
  }
  return pairs;
}

function buildMetricsSummary(tickers, metrics, correlationData) {
  const nonBenchmarkTickers = tickers.filter((ticker) => ticker !== BENCHMARK_TICKER);
  const sentences = [];

  const topSharpeTicker = getTopByMetric(nonBenchmarkTickers, metrics, "sharpe_ratio");
  const topVolatilityTicker = getTopByMetric(tickers, metrics, "annualized_volatility");

  if (topSharpeTicker && topVolatilityTicker) {
    sentences.push(
      `${topSharpeTicker} has the best risk-adjusted return among your holdings ` +
        `(Sharpe ratio of ${metrics[topSharpeTicker].sharpe_ratio.toFixed(2)}), while ` +
        `${topVolatilityTicker} shows the highest volatility at ` +
        `${(metrics[topVolatilityTicker].annualized_volatility * 100).toFixed(1)}%.`
    );
  } else if (topVolatilityTicker) {
    sentences.push(
      `${topVolatilityTicker} shows the highest volatility at ` +
        `${(metrics[topVolatilityTicker].annualized_volatility * 100).toFixed(1)}%.`
    );
  }

  const highBetaTickers = tickers.filter((ticker) => metrics[ticker].beta > HIGH_BETA_AMPLIFIER_THRESHOLD);
  if (highBetaTickers.length > 0) {
    sentences.push(
      `${formatList(highBetaTickers)} ${highBetaTickers.length > 1 ? "have" : "has"} a beta above 1.5, ` +
        "amplifying market moves."
    );
  }

  const redundantPairs = getRedundantPairs(tickers, correlationData);
  if (redundantPairs.length > 0) {
    const { a, b, value } = redundantPairs[0];
    sentences.push(
      `${a} and ${b} are highly correlated (${value.toFixed(2)}) and may be providing redundant ` +
        "diversification benefit."
    );
  }

  return sentences.length > 0 ? sentences.join(" ") : null;
}

function MetricsTable({ metrics, correlationData }) {
  const tickers = Object.keys(metrics);
  const summary = buildMetricsSummary(tickers, metrics, correlationData);

  return (
    <div className="metrics-table-container">
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
      <p className="chart-note">
        Note: Sharpe ratios are calculated using a 0% risk-free rate.
        Comparing against a realistic risk-free rate of 4-5% would produce
        lower Sharpe values across all holdings.
      </p>
      {summary && <p className="chart-description">{summary}</p>}
    </div>
  );
}

export default MetricsTable;
