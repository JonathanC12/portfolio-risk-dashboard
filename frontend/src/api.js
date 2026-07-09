import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

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

export async function getMonteCarlo(tickers, weights, start, horizon, simulations) {
  const params = buildParams(tickers, start);
  params.weights = weights;
  if (horizon) {
    params.horizon = horizon;
  }
  if (simulations) {
    params.simulations = simulations;
  }
  const response = await axios.get(`${BASE_URL}/portfolio/montecarlo`, { params });
  return response.data;
}

export async function getEfficientFrontier(tickers, start, weights, simulations, riskFreeRate) {
  const params = buildParams(tickers, start);
  if (weights) {
    params.weights = weights;
  }
  if (simulations) {
    params.simulations = simulations;
  }
  if (riskFreeRate !== undefined && riskFreeRate !== null) {
    params.risk_free_rate = riskFreeRate;
  }
  const response = await axios.get(`${BASE_URL}/portfolio/frontier`, { params });
  return response.data;
}
