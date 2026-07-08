import Plot from "react-plotly.js";

function normalize(series) {
  const base = series.find((value) => value !== null && value !== undefined);
  if (!base) {
    return series;
  }
  return series.map((value) =>
    value === null || value === undefined ? null : (value / base) * 100
  );
}

function PriceChart({ prices }) {
  const { tickers, dates, prices: priceSeries } = prices;

  const data = tickers.map((ticker) => ({
    type: "scatter",
    mode: "lines",
    name: ticker,
    x: dates,
    y: normalize(priceSeries[ticker]),
    hovertemplate: "%{x}<br>" + ticker + ": %{y:.2f}<extra></extra>",
  }));

  return (
    <div className="price-chart">
      <h2>Normalized Price Performance (Base = 100)</h2>
      <p className="chart-subtitle">
        All prices indexed to 100 at the start date. Values above 100
        indicate positive returns from that point.
      </p>
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { l: 60, r: 40, t: 20, b: 60 },
          xaxis: { title: "Date" },
          yaxis: { title: "Indexed Value" },
          hovermode: "closest",
        }}
        useResizeHandler
        style={{ width: "100%", height: "500px" }}
      />
      <p className="chart-description">
        Hover over the lines to see exact indexed values.
      </p>
    </div>
  );
}

export default PriceChart;
