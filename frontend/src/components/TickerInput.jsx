import { useState } from "react";

function TickerInput({ tickers, startDate, weights, loading, onSubmit }) {
  const [tickersInput, setTickersInput] = useState(tickers);
  const [startDateInput, setStartDateInput] = useState(startDate);
  const [weightsInput, setWeightsInput] = useState(weights);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(tickersInput, startDateInput, weightsInput);
  }

  return (
    <form className="ticker-input" onSubmit={handleSubmit}>
      <label className="ticker-input-field ticker-input-field-tickers">
        <span className="ticker-input-label-text">Tickers</span>
        <input
          type="text"
          placeholder="AAPL, MSFT, SPY"
          value={tickersInput}
          onChange={(event) => setTickersInput(event.target.value)}
        />
      </label>
      <label className="ticker-input-field ticker-input-field-allocation">
        <span className="ticker-input-label-text">Portfolio Allocation</span>
        <input
          type="text"
          placeholder="0.4, 0.3, 0.3"
          value={weightsInput}
          onChange={(event) => setWeightsInput(event.target.value)}
        />
        <span className="input-helper-text">
          Enter your portfolio allocation as decimals that sum to 1 (e.g.
          0.4, 0.3, 0.3). Leave blank for equal allocation.
        </span>
      </label>
      <label className="ticker-input-field ticker-input-field-startdate">
        <span className="ticker-input-label-text">Start Date</span>
        <input
          type="date"
          value={startDateInput}
          onChange={(event) => setStartDateInput(event.target.value)}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </button>
    </form>
  );
}

export default TickerInput;
