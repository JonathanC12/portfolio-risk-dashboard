import Plot from "react-plotly.js";

function CorrelationHeatmap({ correlation }) {
  const { tickers, correlation_matrix } = correlation;

  const z = tickers.map((rowTicker) =>
    tickers.map((colTicker) => correlation_matrix[rowTicker][colTicker])
  );

  return (
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
          hovertemplate: "%{x} / %{y}: %{z:.4f}<extra></extra>",
        },
      ]}
      layout={{
        title: "Correlation Matrix",
        autosize: true,
        margin: { l: 60, r: 40, t: 50, b: 60 },
      }}
      useResizeHandler
      style={{ width: "100%", height: "500px" }}
    />
  );
}

export default CorrelationHeatmap;
