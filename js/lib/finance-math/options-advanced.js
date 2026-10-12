/**
 * options-advanced.js — Advanced Greeks (Charm, Vanna) and CRR Binomial Tree Engine
 * References: Hull Chapters 13 & 19; Natenberg Chapters 8 & 11.
 */

import { normCdf, normPdf, calcD1D2 } from './black-scholes.js';

/**
 * Calculate Charm (dDelta / dt — Delta decay over time)
 * @returns {number} Daily charm
 */
export function calcCharm(spot, strike, rate, vol, time, isCall = true) {
  if (time <= 0 || vol <= 0) return 0;

  const { d1, d2 } = calcD1D2(spot, strike, rate, vol, time);
  const nd1 = normPdf(d1);
  const sqrtT = Math.sqrt(time);

  const term1 = nd1 * (2 * rate * time - d2 * vol * sqrtT) / (2 * time * vol * sqrtT);
  const annualCharm = isCall ? -term1 : -term1; // for puts, dDelta/dt is similar magnitude

  return annualCharm / 365;
}

/**
 * Calculate Vanna (dDelta / dVol — Delta sensitivity to Volatility)
 * @returns {number} Vanna per 1% vol change
 */
export function calcVanna(spot, strike, rate, vol, time) {
  if (time <= 0 || vol <= 0) return 0;

  const { d1, d2 } = calcD1D2(spot, strike, rate, vol, time);
  const nd1 = normPdf(d1);

  // Vanna = -N'(d1) * d2 / vol
  const rawVanna = -(nd1 * d2) / vol;
  return rawVanna / 100; // standard per 1% vol convention
}

/**
 * Cox-Ross-Rubinstein (CRR) Binomial Tree Option Pricing
 * @param {Object} params
 * @param {number} params.spot Underlying asset spot price
 * @param {number} params.strike Strike price
 * @param {number} params.rate Risk-free rate (annual decimal)
 * @param {number} params.vol Volatility (annual decimal)
 * @param {number} params.time Time to expiry (in years)
 * @param {number} [params.steps=4] Number of lattice steps
 * @param {boolean} [params.isCall=true] True for Call, false for Put
 * @param {boolean} [params.isAmerican=true] True for American early exercise, false for European
 * @returns {{ price: number, tree: Array<Array<{ step: number, node: number, spot: number, optionVal: number, intrinsic: number, isExercised: boolean }>> }}
 */
export function binomialCRR({
  spot = 100,
  strike = 100,
  rate = 0.05,
  vol = 0.20,
  time = 1.0,
  steps = 4,
  isCall = true,
  isAmerican = true,
}) {
  const n = Math.max(1, Math.min(20, Math.round(steps)));
  const dt = time / n;
  const u = Math.exp(vol * Math.sqrt(dt));
  const d = 1 / u;
  const disc = Math.exp(-rate * dt);
  const p = (Math.exp(rate * dt) - d) / (u - d);

  // Initialize node matrices
  const tree = [];

  // Forward pass: calculate stock prices at each node
  for (let i = 0; i <= n; i++) {
    tree[i] = [];
    for (let j = 0; j <= i; j++) {
      // j is number of up moves, (i - j) is down moves
      const nodeSpot = spot * Math.pow(u, j) * Math.pow(d, i - j);
      const intrinsic = isCall ? Math.max(0, nodeSpot - strike) : Math.max(0, strike - nodeSpot);
      tree[i][j] = {
        step: i,
        node: j,
        spot: nodeSpot,
        intrinsic,
        optionVal: 0,
        isExercised: false,
      };
    }
  }

  // Terminal payoff at step n
  for (let j = 0; j <= n; j++) {
    tree[n][j].optionVal = tree[n][j].intrinsic;
  }

  // Backward induction
  for (let i = n - 1; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      const contVal = disc * (p * tree[i + 1][j + 1].optionVal + (1 - p) * tree[i + 1][j].optionVal);
      const intrinsic = tree[i][j].intrinsic;

      if (isAmerican && intrinsic > contVal + 1e-7) {
        tree[i][j].optionVal = intrinsic;
        tree[i][j].isExercised = true;
      } else {
        tree[i][j].optionVal = contVal;
        tree[i][j].isExercised = false;
      }
    }
  }

  return {
    price: tree[0][0].optionVal,
    tree,
    u,
    d,
    p,
    dt,
  };
}

