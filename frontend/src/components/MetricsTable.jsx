const HIGH_SHARPE_THRESHOLD = 1;
const HIGH_BETA_THRESHOLD = 1.2;

function sharpeColor(sharpe) {
  return sharpe >= HIGH_SHARPE_THRESHOLD ? "#1a7f37" : "inherit";
}

function betaColor(beta) {
  return beta >= HIGH_BETA_THRESHOLD ? "#c92a2a" : "inherit";
}

function MetricsTable({ metrics }) {
  const tickers = Object.keys(metrics);

  return (
    <table className="metrics-table">
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Volatility</th>
          <th>Sharpe Ratio</th>
          <th>Beta</th>
        </tr>
      </thead>
      <tbody>
        {tickers.map((ticker) => {
          const { annualized_volatility, sharpe_ratio, beta } = metrics[ticker];
          return (
            <tr key={ticker}>
              <td>{ticker}</td>
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
