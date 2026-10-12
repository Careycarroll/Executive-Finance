/**
 * black-scholes.js — Black-Scholes option pricing formulas and Greeks
 * Reference: Hull, Options, Futures, and Other Derivatives, Chapter 15.
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/**
 * Standard Normal probability density function: N'(x)
 */
export function normPdf(x) {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/**
 * Standard Normal cumulative distribution function: N(x)
 * Accurate Abramowitz & Stegun rational approximation (formula 26.2.17)
 * Maximum absolute error < 7.5e-8
 */
export function normCdf(x) {
  if (x < 0) {
    return 1 - normCdf(-x);
  }

  const p  = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const t = 1 / (1 + p * x);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;

  return 1 - normPdf(x) * poly;
}

/**
 * Calculate d1 and d2 for Black-Scholes
 * @param {number} spot Underlying spot price (S)
 * @param {number} strike Strike price (K)
 * @param {number} rate Risk-free interest rate (r, annualized, decimal e.g. 0.05)
 * @param {number} vol Volatility (sigma, annualized, decimal e.g. 0.20)
 * @param {number} time Time to expiration (T, in years e.g. 1.0)
 * @returns {{ d1: number, d2: number }}
 */
export function calcD1D2(spot, strike, rate, vol, time) {
  if (spot <= 0 || strike <= 0) {
    throw new Error('Spot and strike must be positive numbers');
  }
  if (time <= 0 || vol <= 0) {
    return { d1: spot >= strike ? Infinity : -Infinity, d2: spot >= strike ? Infinity : -Infinity };
  }

  const vt = vol * Math.sqrt(time);
  const d1 = (Math.log(spot / strike) + (rate + 0.5 * vol * vol) * time) / vt;
  const d2 = d1 - vt;

  return { d1, d2 };
}

/**
 * European Call Option Price via Black-Scholes
 */
export function blackScholesCall(spot, strike, rate, vol, time) {
  if (time <= 0) return Math.max(0, spot - strike);
  if (vol <= 0) {
    const discountedK = strike * Math.exp(-rate * time);
    return Math.max(0, spot - discountedK);
  }

  const { d1, d2 } = calcD1D2(spot, strike, rate, vol, time);
  const discountedK = strike * Math.exp(-rate * time);

  return spot * normCdf(d1) - discountedK * normCdf(d2);
}

/**
 * European Put Option Price via Black-Scholes
 */
export function blackScholesPut(spot, strike, rate, vol, time) {
  if (time <= 0) return Math.max(0, strike - spot);
  if (vol <= 0) {
    const discountedK = strike * Math.exp(-rate * time);
    return Math.max(0, discountedK - spot);
  }

  const { d1, d2 } = calcD1D2(spot, strike, rate, vol, time);
  const discountedK = strike * Math.exp(-rate * time);

  return discountedK * normCdf(-d2) - spot * normCdf(-d1);
}

/**
 * Calculate Black-Scholes Greeks
 */
export function blackScholesGreeks(spot, strike, rate, vol, time) {
  if (time <= 0 || vol <= 0) {
    const isCallITM = spot > strike;
    return {
      callDelta: isCallITM ? 1 : 0,
      putDelta: isCallITM ? 0 : -1,
      gamma: 0,
      vega: 0,
      callTheta: 0,
      putTheta: 0,
      callRho: 0,
      putRho: 0,
    };
  }

  const sqrtT = Math.sqrt(time);
  const { d1, d2 } = calcD1D2(spot, strike, rate, vol, time);
  const nd1 = normPdf(d1);
  const discountedK = strike * Math.exp(-rate * time);

  const callDelta = normCdf(d1);
  const putDelta = callDelta - 1;

  const gamma = nd1 / (spot * vol * sqrtT);
  const vega = (spot * sqrtT * nd1) / 100; // standard market convention: change per 1% vol

  // Theta (annualized; divide by 365 for daily theta)
  const term1 = -(spot * nd1 * vol) / (2 * sqrtT);
  const callThetaAnnual = term1 - rate * discountedK * normCdf(d2);
  const putThetaAnnual = term1 + rate * discountedK * normCdf(-d2);

  const callRho = (discountedK * time * normCdf(d2)) / 100; // change per 1% rate
  const putRho = (-discountedK * time * normCdf(-d2)) / 100;

  return {
    callDelta,
    putDelta,
    gamma,
    vega,
    callTheta: callThetaAnnual / 365,
    putTheta: putThetaAnnual / 365,
    callRho,
    putRho,
  };
}
