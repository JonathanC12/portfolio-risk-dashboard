import Plot from "react-plotly.js";

function CorrelationHeatmap({ correlation }) {
  const { tickers, correlation_matrix } = correlation;

  const z = tickers.map((rowTicker) =>
    tickers.map((colTicker) => correlation_matrix[rowTicker][colTicker])
  );

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
