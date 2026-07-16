import Plot from "react-plotly.js";

function getOffDiagonalPairs(tickers, correlationMatrix) {
  const pairs = [];
  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      const a = tickers[i];
      const b = tickers[j];
      pairs.push({ a, b, value: correlationMatrix[a][b] });
    }
  }
  return pairs;
}

function diversificationSentence(average) {
  if (average < 0.3) return "Your portfolio is well diversified overall.";
  if (average < 0.5) return "Your portfolio has moderate diversification.";
  if (average < 0.7) return "Your portfolio has limited diversification.";
  return "Your portfolio is highly concentrated.";
}

function buildCorrelationSummary(tickers, correlationMatrix) {
  const pairs = getOffDiagonalPairs(tickers, correlationMatrix);
  if (pairs.length === 0) {
    return null;
  }

  const highest = pairs.reduce((max, p) => (p.value > max.value ? p : max), pairs[0]);
  const lowest = pairs.reduce((min, p) => (p.value < min.value ? p : min), pairs[0]);
  const average = pairs.reduce((sum, p) => sum + p.value, 0) / pairs.length;

  return (
    `${highest.a} and ${highest.b} are the most correlated pair at ${highest.value.toFixed(2)}, ` +
    `while ${lowest.a} and ${lowest.b} are the least correlated at ${lowest.value.toFixed(2)}. ` +
    diversificationSentence(average)
  );
}

function CorrelationHeatmap({ correlation }) {
  const { tickers, correlation_matrix } = correlation;

  const z = tickers.map((rowTicker) =>
    tickers.map((colTicker) => correlation_matrix[rowTicker][colTicker])
  );

  const summary = buildCorrelationSummary(tickers, correlation_matrix);

  return (
    <div className="correlation-heatmap">
      <h2>Portfolio Correlation Matrix</h2>
      <Plot
        data={[
          {
            type: "heatmap",
            x: tickers,
            y: tickers,
            z,
            zmin: -1,
            zmax: 1,
            colorscale: "RdBu",
            reversescale: true,
            text: z,
            texttemplate: "%{text:.2f}",
            textfont: { size: 12 },
            hovertemplate: "%{x} / %{y}: %{z:.4f}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 60, r: 40, t: 20, b: 60 },
        }}
        useResizeHandler
        style={{ width: "100%", height: "500px" }}
      />
      <p className="chart-description">
        Values closer to 1 indicate stocks that move together; values closer
        to 0 indicate more independent movement. Lower correlation between
        holdings means better diversification.
      </p>
      {summary && <p className="chart-description">{summary}</p>}
      <div className="correlation-guide">
        <div className="correlation-guide-item">
          <span className="correlation-swatch" style={{ background: "#08306b" }} />
          0.8 to 1.0: Very high correlation — minimal diversification benefit
        </div>
        <div className="correlation-guide-item">
          <span className="correlation-swatch" style={{ background: "#6baed6" }} />
          0.5 to 0.8: Moderate correlation — some diversification benefit
        </div>
        <div className="correlation-guide-item">
          <span className="correlation-swatch" style={{ background: "#c6dbef" }} />
          0.0 to 0.5: Low correlation — good diversification benefit
        </div>
        <div className="correlation-guide-item">
          <span className="correlation-swatch" style={{ background: "#c92a2a" }} />
          Below 0.0: Negative correlation — excellent diversification, moves
          opposite to each other
        </div>
      </div>
    </div>
  );
}

export default CorrelationHeatmap;
