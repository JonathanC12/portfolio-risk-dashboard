import Plot from "react-plotly.js";

function formatWeights(tickers, weights) {
  return tickers.map((ticker, idx) => ({
    ticker,
    weight: weights[idx],
  }));
}

function EfficientFrontierChart({ frontier }) {
  const {
    tickers,
    simulated_portfolios: simulatedPortfolios,
    min_variance_portfolio: minVariancePortfolio,
    max_sharpe_portfolio: maxSharpePortfolio,
    current_portfolio: currentPortfolio,
  } = frontier;

  const simulatedTrace = {
    type: "scattergl",
    mode: "markers",
    name: "Simulated Portfolios",
    x: simulatedPortfolios.volatility,
    y: simulatedPortfolios.return,
    marker: {
      size: 5,
      color: simulatedPortfolios.sharpe,
      colorscale: "Viridis",
      showscale: true,
      colorbar: { title: { text: "Sharpe" } },
    },
    hovertemplate: "Volatility: %{x:.4f}<br>Return: %{y:.4f}<br>Sharpe: %{marker.color:.4f}<extra></extra>",
  };

  const maxSharpeTrace = {
    type: "scatter",
    mode: "markers",
    name: "Max Sharpe Ratio",
    x: [maxSharpePortfolio.volatility],
    y: [maxSharpePortfolio.return],
    marker: { symbol: "star", size: 18, color: "gold", line: { color: "#333", width: 1 } },
    hovertemplate: "Volatility: %{x:.4f}<br>Return: %{y:.4f}<extra>Max Sharpe</extra>",
  };

  const minVarianceTrace = {
    type: "scatter",
    mode: "markers",
    name: "Min Variance",
    x: [minVariancePortfolio.volatility],
    y: [minVariancePortfolio.return],
    marker: { symbol: "diamond", size: 14, color: "white", line: { color: "#333", width: 1 } },
    hovertemplate: "Volatility: %{x:.4f}<br>Return: %{y:.4f}<extra>Min Variance</extra>",
  };

  const data = [simulatedTrace, maxSharpeTrace, minVarianceTrace];

  if (currentPortfolio) {
    data.push({
      type: "scatter",
      mode: "markers",
      name: "Current Portfolio",
      x: [currentPortfolio.volatility],
      y: [currentPortfolio.return],
      marker: { symbol: "circle", size: 14, color: "#c92a2a", line: { color: "#333", width: 1 } },
      hovertemplate: "Volatility: %{x:.4f}<br>Return: %{y:.4f}<extra>Current Portfolio</extra>",
    });
  }

  const maxSharpeWeights = formatWeights(tickers, maxSharpePortfolio.weights);

  return (
    <div className="efficient-frontier-chart">
      <h2>Efficient Frontier</h2>
      <p className="chart-subtitle">
        Each point is a possible portfolio allocation. The gold star is the
        optimal risk-adjusted portfolio.
      </p>
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { l: 60, r: 80, t: 50, b: 80 },
          xaxis: { title: { text: "Annualized Volatility" } },
          yaxis: { title: { text: "Annualized Return" } },
          hovermode: "closest",
          showlegend: true,
          legend: { orientation: "h", y: -0.2, x: 0.5, xanchor: "center" },
        }}
        useResizeHandler
        style={{ width: "100%", height: "500px" }}
      />
      <div className="frontier-summary">
        <h3>Max Sharpe Portfolio Weights</h3>
        <div className="frontier-summary-weights">
          {maxSharpeWeights.map(({ ticker, weight }) => (
            <div className="frontier-summary-weight-item" key={ticker}>
              <span className="frontier-summary-weight-ticker">{ticker}</span>
              <span className="frontier-summary-weight-value">
                {(weight * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="chart-description">
        Each dot represents a randomly weighted combination of your chosen
        tickers, plotted by its risk (volatility) and expected return. The
        upper-left edge of the cloud is the efficient frontier itself &mdash;
        portfolios that deliver the highest return for a given level of risk.
        The gold star marks the portfolio with the best risk-adjusted return
        (Sharpe ratio); the white diamond marks the lowest-risk portfolio.
        Use this to see whether reallocating toward the star could improve
        your risk-adjusted returns relative to your current holdings.
      </p>
    </div>
  );
}

export default EfficientFrontierChart;
