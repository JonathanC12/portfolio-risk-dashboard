import { useState } from "react";

function TickerInput({ tickers, startDate, loading, onSubmit }) {
  const [tickersInput, setTickersInput] = useState(tickers);
  const [startDateInput, setStartDateInput] = useState(startDate);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(tickersInput, startDateInput);
  }

  return (
    <form className="ticker-input" onSubmit={handleSubmit}>
      <label>
        Tickers
        <input
          type="text"
          placeholder="AAPL, MSFT, SPY"
          value={tickersInput}
          onChange={(event) => setTickersInput(event.target.value)}
        />
      </label>
      <label>
        Start Date
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
