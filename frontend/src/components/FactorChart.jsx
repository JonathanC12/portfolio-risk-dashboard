import Plot from "react-plotly.js";

const POSITIVE_COLOR = "#1971c2";
const NEGATIVE_COLOR = "#c92a2a";

const FACTORS = [
  { key: "Mkt-RF", label: "MKT" },
  { key: "SMB", label: "SMB" },
  { key: "HML", label: "HML" },
  { key: "RMW", label: "RMW" },
  { key: "CMA", label: "CMA" },
];

function interpretMarket(loading) {
  if (loading > 1.5) return "Strong market amplifier";
  if (loading > 1.0) return "Above-market sensitivity";
  if (loading > 0.5) return "Moderate market exposure";
  return "Defensive, low market sensitivity";
}

function interpretTilt(loading, positiveLabel, neutralLabel, negativeLabel) {
  if (loading > 0.3) return positiveLabel;
  if (loading < -0.3) return negativeLabel;
  return neutralLabel;
}

const INTERPRETERS = {
  "Mkt-RF": interpretMarket,
  SMB: (loading) => interpretTilt(loading, "Small cap tilt", "Neutral size exposure", "Large cap tilt"),
  HML: (loading) => interpretTilt(loading, "Value tilt", "Neutral value/growth", "Growth tilt"),
  RMW: (loading) =>
    interpretTilt(loading, "Profitable companies tilt", "Neutral profitability", "Unprofitable companies tilt"),
  CMA: (loading) =>
    interpretTilt(loading, "Conservative investment tilt", "Neutral investment style", "Aggressive investment tilt"),
};

function annualizeDailyReturn(dailyReturn) {
  return ((1 + dailyReturn) ** 252 - 1) * 100;
}

function buildSummary(factorLoadings, annualizedAlpha, rSquared) {
  const marketPhrase = interpretMarket(factorLoadings["Mkt-RF"]).toLowerCase();
  const sizePhrase = interpretTilt(factorLoadings.SMB, "a tilt toward small-cap stocks", "a neutral size exposure", "a tilt toward large-cap stocks");
  const valuePhrase = interpretTilt(factorLoadings.HML, "a value tilt", "a neutral value/growth exposure", "a growth tilt");
  const profitabilityPhrase = interpretTilt(
    factorLoadings.RMW,
    "a tilt toward highly profitable companies",
    "neutral exposure to profitability",
    "a tilt toward less profitable companies"
  );
  const investmentPhrase = interpretTilt(
    factorLoadings.CMA,
    "a conservative investment style",
    "a neutral investment style",
    "an aggressive investment style"
  );

  const alphaDirection = annualizedAlpha >= 0 ? "positive" : "negative";

  return (
    `This portfolio shows ${marketPhrase} to the overall market (loading of ` +
    `${factorLoadings["Mkt-RF"].toFixed(2)}), ${sizePhrase}, ${valuePhrase}, ${profitabilityPhrase}, ` +
    `and ${investmentPhrase}. The regression's ${alphaDirection} annualized alpha of ` +
    `${annualizedAlpha.toFixed(2)}% suggests the portfolio's ${alphaDirection === "positive" ? "outperformed" : "underperformed"} ` +
    `what the five factors alone would predict over this period. An R² of ${(rSquared * 100).toFixed(1)}% means the ` +
    `factor model explains ${(rSquared * 100).toFixed(1)}% of the portfolio's daily return variation, leaving the ` +
    `remainder to stock-specific or unmodeled effects.`
  );
}

function FactorChart({ factors }) {
  const { alpha, factor_loadings: factorLoadings, r_squared: rSquared } = factors;

  const barColors = FACTORS.map(({ key }) => (factorLoadings[key] >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR));
  const annualizedAlpha = annualizeDailyReturn(alpha);

  return (
    <div className="factor-chart">
      <h2>Fama-French 5-Factor Model</h2>
      <p className="chart-subtitle">
        Decomposes the portfolio's returns into exposures to five well-documented
        sources of equity risk and return.
      </p>

      <table className="metrics-table factor-table">
        <thead>
          <tr>
            <th>Factor</th>
            <th>Loading</th>
            <th>Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {FACTORS.map(({ key, label }) => (
            <tr key={key}>
              <td>{label}</td>
              <td>{factorLoadings[key].toFixed(4)}</td>
              <td>{INTERPRETERS[key](factorLoadings[key])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="montecarlo-summary">
        <div className="montecarlo-summary-item">
          <span className="montecarlo-summary-label">Alpha (Annualized)</span>
          <span className="montecarlo-summary-value">{annualizedAlpha.toFixed(2)}%</span>
        </div>
        <div className="montecarlo-summary-item">
          <span className="montecarlo-summary-label">R-Squared</span>
          <span className="montecarlo-summary-value">{(rSquared * 100).toFixed(1)}%</span>
        </div>
      </div>

      <Plot
        data={[
          {
            type: "bar",
            orientation: "h",
            x: FACTORS.map(({ key }) => factorLoadings[key]),
            y: FACTORS.map(({ label }) => label),
            marker: { color: barColors },
            hovertemplate: "%{y}: %{x:.4f}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 60, r: 40, t: 20, b: 50 },
          xaxis: { title: { text: "Factor Loading" }, zeroline: true, zerolinecolor: "#666" },
          yaxis: { autorange: "reversed" },
          showlegend: false,
        }}
        useResizeHandler
        style={{ width: "100%", height: "350px" }}
      />

      <p className="chart-description">{buildSummary(factorLoadings, annualizedAlpha, rSquared)}</p>

      <p className="chart-note">
        Note: Factor loadings are estimated via OLS regression against
        Fama-French 5-factor daily returns. Results reflect the selected
        historical period only. Higher R² indicates the model explains more
        of the portfolio's return variation.
      </p>
    </div>
  );
}

export default FactorChart;
