import axios from "axios";

const BASE_URL = "http://localhost:8001";

function buildParams(tickers, start) {
  const params = { tickers };
  if (start) {
    params.start = start;
  }
  return params;
}

export async function getPrices(tickers, start) {
  const response = await axios.get(`${BASE_URL}/portfolio/prices`, {
    params: buildParams(tickers, start),
  });
  return response.data;
}

export async function getReturns(tickers, start) {
  const response = await axios.get(`${BASE_URL}/portfolio/returns`, {
    params: buildParams(tickers, start),
  });
  return response.data;
}

export async function getCorrelation(tickers, start) {
  const response = await axios.get(`${BASE_URL}/portfolio/correlation`, {
    params: buildParams(tickers, start),
  });
  return response.data;
}

export async function getMetrics(tickers, start) {
  const response = await axios.get(`${BASE_URL}/portfolio/metrics`, {
    params: buildParams(tickers, start),
  });
  return response.data;
}
