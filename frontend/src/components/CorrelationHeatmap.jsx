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
    </div>
  );
}

export default CorrelationHeatmap;
