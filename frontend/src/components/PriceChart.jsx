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
  }));

  return (
    <Plot
      data={data}
      layout={{
        title: "Normalized Price History (Base = 100)",
        autosize: true,
        margin: { l: 60, r: 40, t: 50, b: 60 },
        xaxis: { title: "Date" },
        yaxis: { title: "Normalized Price" },
      }}
      useResizeHandler
      style={{ width: "100%", height: "500px" }}
    />
  );
}

export default PriceChart;
