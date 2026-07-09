import Plot from "react-plotly.js";

function buildAllPathsTrace(paths, xValues) {
  const xAll = [];
  const yAll = [];

  paths.forEach((path) => {
    xValues.forEach((x, idx) => {
      xAll.push(x);
      yAll.push(path[idx]);
    });
    xAll.push(null);
    yAll.push(null);
  });

  return {
    type: "scattergl",
    mode: "lines",
    x: xAll,
    y: yAll,
    line: { color: "rgba(150, 150, 150, 0.03)", width: 1 },
    hoverinfo: "skip",
    showlegend: false,
  };
}

function MonteCarloChart({ monteCarlo }) {
  const {
    paths,
    percentile_5: percentile5,
    percentile_50: percentile50,
    percentile_95: percentile95,
    final_value_stats: finalValueStats,
    value_at_risk_95: valueAtRisk95,
  } = monteCarlo;

  const xValues = percentile50.map((_, idx) => idx);
  const horizonYears = (percentile50.length - 1) / 252;

  const data = [
    buildAllPathsTrace(paths, xValues),
    {
      type: "scatter",
      mode: "lines",
      name: "5th Percentile",
      x: xValues,
      y: percentile5,
      line: { color: "#c92a2a", width: 2 },
    },
    {
      type: "scatter",
      mode: "lines",
      name: "50th Percentile (Median)",
      x: xValues,
      y: percentile50,
      line: { color: "#1971c2", width: 2 },
    },
    {
      type: "scatter",
      mode: "lines",
      name: "95th Percentile",
      x: xValues,
      y: percentile95,
      line: { color: "#2f9e44", width: 2 },
    },
  ];

  return (
    <div className="montecarlo-chart">
      <h2>Monte Carlo Simulation</h2>
      <p className="chart-subtitle">
        {paths.length.toLocaleString()} simulated paths over a{" "}
        {horizonYears.toFixed(2)}-year horizon (indexed to 100 at start).
      </p>
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { l: 60, r: 40, t: 20, b: 60 },
          xaxis: { title: { text: "Trading Days" } },
          yaxis: { title: { text: "Indexed Value" } },
          hovermode: "closest",
          showlegend: true,
        }}
        useResizeHandler
        style={{ width: "100%", height: "500px" }}
      />
      <div className="montecarlo-summary">
        <div className="montecarlo-summary-item">
          <span className="montecarlo-summary-label">Mean Expected Value</span>
          <span className="montecarlo-summary-value">
            {finalValueStats.mean.toFixed(2)}
          </span>
        </div>
        <div className="montecarlo-summary-item">
          <span className="montecarlo-summary-label">
            Max Expected Loss (95% Confidence)
          </span>
          <span className="montecarlo-summary-value">
            {valueAtRisk95.toFixed(2)}
          </span>
        </div>
        <div className="montecarlo-summary-item">
          <span className="montecarlo-summary-label">5th-95th Percentile Range</span>
          <span className="montecarlo-summary-value">
            {finalValueStats.percentile_5.toFixed(2)} - {finalValueStats.percentile_95.toFixed(2)}
          </span>
        </div>
      </div>
      <p className="chart-description">
        Each faint line is one simulated path; bold lines mark the 5th, 50th,
        and 95th percentile outcomes across all simulations.
      </p>
      <div className="montecarlo-interpretation">
        The shaded fan shows 1,000 possible futures based on historical
        returns. The blue line is the median (most likely) outcome. There is
        a 90% probability the portfolio ends between the red and green lines
        at the end of the horizon.
      </div>
    </div>
  );
}

export default MonteCarloChart;
