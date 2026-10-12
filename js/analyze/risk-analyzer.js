/**
 * js/analyze/risk-analyzer.js
 * Workbench 4: Portfolio & Derivative Risk Lab
 *
 * Implements:
 * 1. Multi-Asset Portfolio Covariance, Euler Risk Contribution, Diversification Benefit & Sharpe
 * 2. Parametric & Horizon-Scaled Value at Risk (VaR 95%/99%) and Expected Shortfall (CVaR 95%/99%)
 * 3. Macro Regime Stress Testing (2008 GFC, 2022 Rate Shock, Valuation Compression, FX/Commodity Shock)
 * 4. Black-Scholes Option Overlay Hedging Simulator (Protective Put, Collar, Covered Call, Put Spread Collar)
 *    with Net Position Greeks (Delta, Gamma, Vega, Theta, Rho) & HTML5 Canvas 2D Payoff Comparison Chart
 */

import {
  getActiveCompany,
  fmtMoney,
  fmtSharePrice,
  fmtPct,
  conceptPill
} from './state.js';
import { mountTargetBanner } from './hub.js';

/**
 * Standard Normal PDF and CDF
 */
function normPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2.0);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

/**
 * Black-Scholes European Option Pricer + Full Greeks (per 1 share)
 */
export function blackScholesFull(S, K, T, r, sigma, type = 'call') {
  const safeS = Math.max(0.01, S);
  const safeK = Math.max(0.01, K);
  const safeT = Math.max(0.001, T);
  const safeVol = Math.max(0.01, sigma);
  const sqrtT = Math.sqrt(safeT);

  const d1 = (Math.log(safeS / safeK) + (r + 0.5 * safeVol * safeVol) * safeT) / (safeVol * sqrtT);
  const d2 = d1 - safeVol * sqrtT;
  const df = Math.exp(-r * safeT);

  const nd1 = normCDF(d1);
  const nd2 = normCDF(d2);
  const nmd1 = normCDF(-d1);
  const nmd2 = normCDF(-d2);
  const pdf1 = normPDF(d1);

  const price = type === 'call'
    ? safeS * nd1 - safeK * df * nd2
    : safeK * df * nmd2 - safeS * nmd1;

  const delta = type === 'call' ? nd1 : nd1 - 1;
  const gamma = pdf1 / (safeS * safeVol * sqrtT);
  const vega = (safeS * pdf1 * sqrtT) / 100; // per 1% vol change
  const thetaAnnual = type === 'call'
    ? -(safeS * pdf1 * safeVol) / (2 * sqrtT) - r * safeK * df * nd2
    : -(safeS * pdf1 * safeVol) / (2 * sqrtT) + r * safeK * df * nmd2;
  const theta = thetaAnnual / 365; // per calendar day
  const rho = type === 'call'
    ? (safeK * safeT * df * nd2) / 100
    : -(safeK * safeT * df * nmd2) / 100;

  return { price, delta, gamma, vega, theta, rho, d1, d2 };
}

/**
 * 1. Pure Multi-Asset Portfolio Risk, VaR/CVaR & Macro Stress Engine
 */
export function computePortfolioRisk(company, overrides = {}) {
  const notionalValue = overrides.notionalValue ?? 100; // $100M institutional portfolio
  const horizonDays = overrides.horizonDays ?? 10; // 10-day Basel regulatory horizon (or 1, 252)
  const rf = 0.042;

  const beta1 = company.beta ?? company.profile?.beta ?? 1.05;
  const vol1 = overrides.targetVol ?? Math.min(0.55, Math.max(0.14, 0.21 * Math.pow(beta1, 0.85)));
  const mu1 = rf + beta1 * 0.052;

  // Normalize weights to sum to 1.0
  const rawW1 = overrides.wTarget ?? 0.40;
  const rawW2 = overrides.wSp500 ?? 0.30;
  const rawW3 = overrides.wBonds ?? 0.20;
  const rawW4 = overrides.wGold ?? 0.10;
  const sumW = Math.max(0.01, rawW1 + rawW2 + rawW3 + rawW4);
  const weights = [rawW1 / sumW, rawW2 / sumW, rawW3 / sumW, rawW4 / sumW];

  const assets = [
    { name: `${company.ticker} Equity`, ticker: company.ticker, mu: mu1, vol: vol1, beta: beta1, weight: weights[0] },
    { name: 'S&P 500 Core Index', ticker: 'SPY', mu: 0.092, vol: 0.160, beta: 1.00, weight: weights[1] },
    { name: '10Y IG Treasury/Corp Bonds', ticker: 'IEF/LQD', mu: 0.046, vol: 0.075, beta: 0.15, weight: weights[2] },
    { name: 'Gold & Real Asset Hedge', ticker: 'GLD', mu: 0.058, vol: 0.145, beta: 0.05, weight: weights[3] }
  ];

  // 4x4 Correlation Matrix
  const corrEquityBond = overrides.corrEquityBond ?? -0.15;
  const corrTargetSp = Math.min(0.92, Math.max(0.35, 0.65 * Math.min(1.3, beta1)));
  const corrMatrix = [
    [1.00,          corrTargetSp,  corrEquityBond, 0.05],
    [corrTargetSp,  1.00,          corrEquityBond, 0.08],
    [corrEquityBond, corrEquityBond, 1.00,         0.22],
    [0.05,          0.08,          0.22,           1.00]
  ];

  // Expected Portfolio Return & Variance (w^T Sigma w)
  let portReturn = 0;
  let weightedAvgVol = 0;
  let portBeta = 0;
  for (let i = 0; i < 4; i++) {
    portReturn += weights[i] * assets[i].mu;
    weightedAvgVol += weights[i] * assets[i].vol;
    portBeta += weights[i] * assets[i].beta;
  }

  let portVar = 0;
  const covWithPort = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const covIJ = corrMatrix[i][j] * assets[i].vol * assets[j].vol;
      portVar += weights[i] * weights[j] * covIJ;
      covWithPort[i] += weights[j] * covIJ;
    }
  }
  const portVol = Math.sqrt(Math.max(0.0001, portVar));
  const diversificationBenefit = Math.max(0, weightedAvgVol - portVol);
  const sharpeRatio = (portReturn - rf) / portVol;

  // Euler Risk Contribution per asset: RC_i = w_i * (Sigma w)_i / portVol
  const assetsWithRisk = assets.map((a, i) => {
    const mctr = covWithPort[i] / portVol; // Marginal Contribution to Risk
    const cctr = weights[i] * mctr;        // Component Contribution to Risk
    const riskSharePct = cctr / portVol;
    return { ...a, mctr, cctr, riskSharePct };
  });

  // Horizon-scaled Parametric VaR & Expected Shortfall (CVaR)
  // Scale volatility by sqrt(horizonDays / 252) and drift by (horizonDays / 252)
  const timeFrac = horizonDays / 252;
  const horizonDrift = portReturn * timeFrac;
  const horizonSigma = portVol * Math.sqrt(timeFrac);

  // Standard Normal quantiles: z_95 = 1.64485, z_99 = 2.32635
  // Expected Shortfall multiplier: phi(z_alpha) / (1 - alpha)
  const z95 = 1.64485;
  const z99 = 2.32635;
  const esMult95 = normPDF(z95) / 0.05; // ~2.0627
  const esMult99 = normPDF(z99) / 0.01; // ~2.6652

  const var95Pct = Math.max(0, z95 * horizonSigma - horizonDrift);
  const var99Pct = Math.max(0, z99 * horizonSigma - horizonDrift);
  const cvar95Pct = Math.max(0, esMult95 * horizonSigma - horizonDrift);
  const cvar99Pct = Math.max(0, esMult99 * horizonSigma - horizonDrift);

  const var95Dollar = notionalValue * var95Pct;
  const var99Dollar = notionalValue * var99Pct;
  const cvar95Dollar = notionalValue * cvar95Pct;
  const cvar99Dollar = notionalValue * cvar99Pct;

  // Historical / Macro Regime Stress Scenarios
  const scenarios = [
    {
      name: '2008 GFC Systemic Credit Crash',
      shocks: [-0.38 * Math.min(1.4, beta1), -0.37, +0.08, +0.05]
    },
    {
      name: '2022 Inflation & Rate Hike Shock (+300 bps)',
      shocks: [-0.24 * Math.min(1.4, beta1), -0.19, -0.15, -0.02]
    },
    {
      name: 'Valuation Multiple Compression (-25% Equity)',
      shocks: [-0.26 * Math.min(1.3, beta1), -0.20, +0.04, +0.03]
    },
    {
      name: 'Geopolitical Stagflation & Oil Spike',
      shocks: [-0.16 * Math.min(1.3, beta1), -0.14, -0.07, +0.18]
    }
  ].map(sc => {
    const portShockPct = sc.shocks.reduce((acc, s, idx) => acc + weights[idx] * s, 0);
    return {
      ...sc,
      portShockPct,
      portLossDollar: notionalValue * portShockPct
    };
  });

  return {
    notionalValue,
    horizonDays,
    rf,
    assets: assetsWithRisk,
    corrMatrix,
    portReturn,
    portVol,
    weightedAvgVol,
    diversificationBenefit,
    portBeta,
    sharpeRatio,
    var95Pct,
    var99Pct,
    cvar95Pct,
    cvar99Pct,
    var95Dollar,
    var99Dollar,
    cvar95Dollar,
    cvar99Dollar,
    scenarios
  };
}

/**
 * 2. Pure Option Overlay Hedging & Net Position Greeks Simulator
 *
 * Strategies:
 * - 'protective-put': Long Stock + Long OTM Put (K_put)
 * - 'collar': Long Stock + Long OTM Put (K_put) + Short OTM Call (K_call)
 * - 'covered-call': Long Stock + Short OTM Call (K_call)
 * - 'put-spread-collar': Long Stock + Long OTM Put (K_put) + Short Deep OTM Put (K_put2) + Short OTM Call (K_call)
 */
export function computeOptionOverlay(company, overrides = {}) {
  const spot = company.price ?? company.profile?.price ?? 100;
  const positionValueM = overrides.positionValueM ?? 100; // $100M concentrated stock holding
  const sharesM = positionValueM / spot; // Millions of shares
  const strategy = overrides.strategy || 'collar';
  const putOtmPct = overrides.putOtmPct ?? 0.10;   // 10% OTM Put floor (90% moneyness)
  const callOtmPct = overrides.callOtmPct ?? 0.10; // 10% OTM Call cap (110% moneyness)
  const maturityYears = overrides.maturityYears ?? 0.50; // 6 months
  const rf = 0.042;
  const beta = company.beta ?? company.profile?.beta ?? 1.05;
  const iv = overrides.iv ?? Math.min(0.60, Math.max(0.16, 0.22 * Math.pow(beta, 0.85)));

  const kPut = spot * (1 - putOtmPct);
  const kPutDeep = spot * (1 - putOtmPct - 0.12);
  const kCall = spot * (1 + callOtmPct);

  const putLeg = blackScholesFull(spot, kPut, maturityYears, rf, iv, 'put');
  const putDeepLeg = blackScholesFull(spot, kPutDeep, maturityYears, rf, iv, 'put');
  const callLeg = blackScholesFull(spot, kCall, maturityYears, rf, iv, 'call');

  let netPremiumPerShare = 0; // positive = net cost paid; negative = net credit received
  let netDeltaPerShare = 1.0; // Base stock delta = +1.00
  let netGammaPerShare = 0;
  let netVegaPerShare = 0;
  let netThetaPerShare = 0;

  if (strategy === 'protective-put') {
    netPremiumPerShare = putLeg.price;
    netDeltaPerShare = 1.0 + putLeg.delta;
    netGammaPerShare = putLeg.gamma;
    netVegaPerShare = putLeg.vega;
    netThetaPerShare = putLeg.theta;
  } else if (strategy === 'collar') {
    netPremiumPerShare = putLeg.price - callLeg.price;
    netDeltaPerShare = 1.0 + putLeg.delta - callLeg.delta;
    netGammaPerShare = putLeg.gamma - callLeg.gamma;
    netVegaPerShare = putLeg.vega - callLeg.vega;
    netThetaPerShare = putLeg.theta - callLeg.theta;
  } else if (strategy === 'covered-call') {
    netPremiumPerShare = -callLeg.price;
    netDeltaPerShare = 1.0 - callLeg.delta;
    netGammaPerShare = -callLeg.gamma;
    netVegaPerShare = -callLeg.vega;
    netThetaPerShare = -callLeg.theta;
  } else if (strategy === 'put-spread-collar') {
    netPremiumPerShare = putLeg.price - putDeepLeg.price - callLeg.price;
    netDeltaPerShare = 1.0 + putLeg.delta - putDeepLeg.delta - callLeg.delta;
    netGammaPerShare = putLeg.gamma - putDeepLeg.gamma - callLeg.gamma;
    netVegaPerShare = putLeg.vega - putDeepLeg.vega - callLeg.vega;
    netThetaPerShare = putLeg.theta - putDeepLeg.theta - callLeg.theta;
  }

  // Expiry Payoff Curve from -35% to +35% spot move
  const curve = [];
  for (let pct = -0.35; pct <= 0.3501; pct += 0.025) {
    const sT = spot * (1 + pct);
    const unhedgedPnlPct = (sT - spot) / spot;

    let optPayoff = 0;
    if (strategy === 'protective-put') {
      optPayoff = Math.max(0, kPut - sT);
    } else if (strategy === 'collar') {
      optPayoff = Math.max(0, kPut - sT) - Math.max(0, sT - kCall);
    } else if (strategy === 'covered-call') {
      optPayoff = -Math.max(0, sT - kCall);
    } else if (strategy === 'put-spread-collar') {
      optPayoff = Math.max(0, kPut - sT) - Math.max(0, kPutDeep - sT) - Math.max(0, sT - kCall);
    }

    const hedgedPnlPerShare = (sT - spot) + optPayoff - netPremiumPerShare;
    const hedgedPnlPct = hedgedPnlPerShare / spot;

    curve.push({
      spotMovePct: pct,
      spotPrice: sT,
      unhedgedPnlPct,
      hedgedPnlPct,
      unhedgedDollarM: positionValueM * unhedgedPnlPct,
      hedgedDollarM: positionValueM * hedgedPnlPct
    });
  }

  // Downside floor at -25% crash & Upside participation at +25% rally
  const crashPoint = curve.find(c => Math.abs(c.spotMovePct - (-0.25)) < 0.015) || curve[2];
  const rallyPoint = curve.find(c => Math.abs(c.spotMovePct - 0.25) < 0.015) || curve[curve.length - 3];

  return {
    spot,
    positionValueM,
    sharesM,
    strategy,
    putOtmPct,
    callOtmPct,
    maturityYears,
    iv,
    kPut,
    kPutDeep,
    kCall,
    putLeg,
    putDeepLeg,
    callLeg,
    netPremiumPerShare,
    netPremiumPct: netPremiumPerShare / spot,
    netPremiumDollarM: sharesM * netPremiumPerShare,
    netDeltaPerShare,
    netGammaPerShare,
    netVegaPerShare,
    netThetaPerShare,
    curve,
    crashPoint,
    rallyPoint
  };
}

/**
 * Draw the Option Overlay Payoff Diagram on HTML5 Canvas
 */
function drawOverlayPayoffCanvas(canvas, overlay) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(580, rect.width || 680);
  const height = 280;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const padL = 65;
  const padR = 30;
  const padT = 28;
  const padB = 38;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const minX = -0.35, maxX = 0.35;
  const minY = -0.38, maxY = 0.38;

  const xOf = (pct) => padL + ((pct - minX) / (maxX - minX)) * plotW;
  const yOf = (pnl) => padT + plotH - ((pnl - minY) / (maxY - minY)) * plotH;

  // Grid & Zero Axes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.font = '600 10px Inter, sans-serif';
  ctx.fillStyle = '#64748b';

  [-0.30, -0.20, -0.10, 0, 0.10, 0.20, 0.30].forEach(yVal => {
    const y = yOf(yVal);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.strokeStyle = yVal === 0 ? '#94a3b8' : '#e2e8f0';
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(`${yVal >= 0 ? '+' : ''}${(yVal * 100).toFixed(0)}%`, padL - 8, y + 3);
  });

  [-0.30, -0.20, -0.10, 0, 0.10, 0.20, 0.30].forEach(xVal => {
    const x = xOf(xVal);
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.strokeStyle = xVal === 0 ? '#94a3b8' : '#f1f5f9';
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillText(`${xVal >= 0 ? '+' : ''}${(xVal * 100).toFixed(0)}%`, x, padT + plotH + 18);
  });

  // Unhedged Stock Line (dashed slate)
  ctx.save();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  overlay.curve.forEach((pt, idx) => {
    const x = xOf(pt.spotMovePct);
    const y = yOf(pt.unhedgedPnlPct);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // Hedged Overlay Payoff Line (solid blue)
  ctx.save();
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();
  overlay.curve.forEach((pt, idx) => {
    const x = xOf(pt.spotMovePct);
    const y = yOf(pt.hedgedPnlPct);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  // Legend
  ctx.font = '700 11px Inter, sans-serif';
  ctx.fillStyle = '#2563eb';
  ctx.textAlign = 'left';
  ctx.fillText('━━ Hedged Option Overlay P&L', padL + 12, padT + 16);
  ctx.fillStyle = '#64748b';
  ctx.fillText('╌╌ Unhedged Stock Position P&L', padL + 215, padT + 16);
}

let activeRiskTab = 'var';
let riskTicker = null;
let portOverrides = {};
let optOverrides = {};

function renderRiskAnalyzer(company) {
  const root = document.getElementById('wb-risk-root');
  if (!root) return;

  if (riskTicker !== company.ticker) {
    riskTicker = company.ticker;
    portOverrides = {};
    optOverrides = {};
  }

  const port = computePortfolioRisk(company, portOverrides);
  const opt = computeOptionOverlay(company, optOverrides);

  root.innerHTML = `
    <!-- Top Executive Risk KPI Strip -->
    <div class="wb-kpi-grid">
      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Portfolio Volatility &amp; Sharpe</span>
          ${conceptPill('risk-return', 'Risk/Return')}
        </div>
        <div class="wb-kpi-card__value">${fmtPct(port.portVol)}</div>
        <div class="wb-kpi-card__sub">Exp. Return ${fmtPct(port.portReturn)} · Sharpe ${port.sharpeRatio.toFixed(2)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Diversification Benefit</span>
          ${conceptPill('diversification', 'Correlation')}
        </div>
        <div class="wb-kpi-card__value" style="color:#16a34a;">−${(port.diversificationBenefit * 100).toFixed(2)}%</div>
        <div class="wb-kpi-card__sub">Undiversified Vol ${fmtPct(port.weightedAvgVol)} → ${fmtPct(port.portVol)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>${port.horizonDays}-Day 95% / 99% VaR</span>
          ${conceptPill('var', 'VaR')}
        </div>
        <div class="wb-kpi-card__value" style="color:#d97706;">${fmtMoney(port.var95Dollar)}</div>
        <div class="wb-kpi-card__sub">99% VaR: ${fmtMoney(port.var99Dollar)} (${fmtPct(port.var99Pct)})</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>99% Expected Shortfall (CVaR)</span>
          ${conceptPill('expected-shortfall', 'CVaR')}
        </div>
        <div class="wb-kpi-card__value" style="color:#dc2626;">${fmtMoney(port.cvar99Dollar)}</div>
        <div class="wb-kpi-card__sub">Tail Loss Beyond 99% Cutoff (${fmtPct(port.cvar99Pct)})</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Hedged Net Delta (Δ)</span>
          ${conceptPill('greeks-delta', 'Delta')}
        </div>
        <div class="wb-kpi-card__value">${opt.netDeltaPerShare.toFixed(2)}</div>
        <div class="wb-kpi-card__sub">Reduces Equity Exposure by ${((1 - opt.netDeltaPerShare) * 100).toFixed(0)}%</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>−25% Crash Protection</span>
          ${conceptPill('corporate-hedging', 'Hedging')}
        </div>
        <div class="wb-kpi-card__value" style="color:#16a34a;">${(opt.crashPoint.hedgedPnlPct * 100).toFixed(1)}%</div>
        <div class="wb-kpi-card__sub">vs. −25.0% Unhedged (Saves ${fmtMoney(opt.crashPoint.hedgedDollarM - opt.crashPoint.unhedgedDollarM)})</div>
      </div>
    </div>

    <!-- Sub-Navigation Tabs -->
    <div class="wb-tabs" role="tablist">
      <button class="wb-tab ${activeRiskTab === 'var' ? 'active' : ''}" data-tab="var">1. Multi-Asset Portfolio VaR, CVaR &amp; Macro Stress Lab</button>
      <button class="wb-tab ${activeRiskTab === 'options' ? 'active' : ''}" data-tab="options">2. Option Overlay Hedging Simulator &amp; Net Greeks</button>
    </div>

    <!-- TAB 1: PORTFOLIO VaR, CVaR & STRESS TESTING -->
    <div id="risk-tab-var" style="display:${activeRiskTab === 'var' ? 'block' : 'none'};">
      <div class="wb-layout">
        <aside class="wb-sidebar">
          <h3 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; color:#0f172a; margin:0 0 0.85rem 0;">
            Portfolio &amp; VaR Controls
          </h3>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Risk Horizon (Trading Days)</span>
            </div>
            <select id="risk-horizon" class="target-select" style="width:100%;">
              <option value="1" ${port.horizonDays === 1 ? 'selected' : ''}>1-Day Daily Trading VaR</option>
              <option value="10" ${port.horizonDays === 10 ? 'selected' : ''}>10-Day Basel Regulatory VaR</option>
              <option value="21" ${port.horizonDays === 21 ? 'selected' : ''}>21-Day (1-Month) VaR</option>
              <option value="252" ${port.horizonDays === 252 ? 'selected' : ''}>252-Day (1-Year Annual) VaR</option>
            </select>
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>${company.ticker} Weight</span>
              <span class="wb-control-val">${(port.assets[0].weight * 100).toFixed(0)}%</span>
            </div>
            <input type="range" class="wb-range" id="risk-w1" min="0.05" max="0.85" step="0.05" value="${port.assets[0].weight}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>S&amp;P 500 Weight</span>
              <span class="wb-control-val">${(port.assets[1].weight * 100).toFixed(0)}%</span>
            </div>
            <input type="range" class="wb-range" id="risk-w2" min="0.00" max="0.70" step="0.05" value="${port.assets[1].weight}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>10Y IG Bonds Weight</span>
              <span class="wb-control-val">${(port.assets[2].weight * 100).toFixed(0)}%</span>
            </div>
            <input type="range" class="wb-range" id="risk-w3" min="0.00" max="0.60" step="0.05" value="${port.assets[2].weight}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Stock–Bond Correlation (ρ)</span>
              <span class="wb-control-val">${(portOverrides.corrEquityBond ?? -0.15).toFixed(2)}</span>
            </div>
            <input type="range" class="wb-range" id="risk-corr" min="-0.60" max="0.60" step="0.05" value="${portOverrides.corrEquityBond ?? -0.15}" />
          </div>
        </aside>

        <div>
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Multi-Asset Euler Risk Decomposition &amp; Marginal Contribution to Risk ($100M Portfolio)</h3>
                <div class="wb-panel__subtitle">Shows how much each sleeve contributes to total portfolio volatility (${fmtPct(port.portVol)})</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('diversification', 'Euler Risk')}
                ${conceptPill('efficient-frontier', 'Frontier')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>Asset Sleeve</th>
                    <th>Capital Weight</th>
                    <th>Expected Return</th>
                    <th>Standalone Vol (σᵢ)</th>
                    <th>Marginal Risk (MCTR)</th>
                    <th>% of Total Risk</th>
                  </tr>
                </thead>
                <tbody>
                  ${port.assets.map(a => `
                    <tr>
                      <td>${a.name}</td>
                      <td>${fmtPct(a.weight)}</td>
                      <td>${fmtPct(a.mu)}</td>
                      <td>${fmtPct(a.vol)}</td>
                      <td>${fmtPct(a.mctr)}</td>
                      <td style="font-weight:700; color:${a.riskSharePct > a.weight * 1.15 ? '#dc2626' : '#0f172a'};">${fmtPct(a.riskSharePct)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Historical &amp; Macro Regime Stress Test Scenarios ($100M Notional)</h3>
                <div class="wb-panel__subtitle">Comparing Parametric Tail VaR/CVaR against Non-Normal Historical Crisis Drawdowns</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('var', 'VaR')}
                ${conceptPill('expected-shortfall', 'CVaR')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>Stress Scenario / Regime</th>
                    <th>${company.ticker} Shock</th>
                    <th>S&amp;P 500 Shock</th>
                    <th>10Y Bond Shock</th>
                    <th>Portfolio Drawdown (%)</th>
                    <th>Dollar Impact ($M)</th>
                  </tr>
                </thead>
                <tbody>
                  ${port.scenarios.map(sc => `
                    <tr>
                      <td>${sc.name}</td>
                      <td class="wb-td-cagr neg">${(sc.shocks[0] * 100).toFixed(1)}%</td>
                      <td class="wb-td-cagr neg">${(sc.shocks[1] * 100).toFixed(1)}%</td>
                      <td class="wb-td-cagr ${sc.shocks[2] >= 0 ? 'pos' : 'neg'}">${sc.shocks[2] >= 0 ? '+' : ''}${(sc.shocks[2] * 100).toFixed(1)}%</td>
                      <td class="wb-td-cagr neg">${(sc.portShockPct * 100).toFixed(1)}%</td>
                      <td class="wb-td-cagr neg">${fmtMoney(sc.portLossDollar)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: OPTION OVERLAY HEDGING SIMULATOR & GREEKS -->
    <div id="risk-tab-options" style="display:${activeRiskTab === 'options' ? 'block' : 'none'};">
      <div class="wb-layout">
        <aside class="wb-sidebar">
          <h3 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; color:#0f172a; margin:0 0 0.85rem 0;">
            Option Overlay Controls
          </h3>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Overlay Strategy</span>
            </div>
            <select id="opt-strategy" class="target-select" style="width:100%;">
              <option value="collar" ${opt.strategy === 'collar' ? 'selected' : ''}>Zero-Cost / OTM Collar (Long Put + Short Call)</option>
              <option value="protective-put" ${opt.strategy === 'protective-put' ? 'selected' : ''}>Protective Put (Downside Insurance Floor)</option>
              <option value="put-spread-collar" ${opt.strategy === 'put-spread-collar' ? 'selected' : ''}>Put Spread Collar (Institutional 3-Leg)</option>
              <option value="covered-call" ${opt.strategy === 'covered-call' ? 'selected' : ''}>Covered Call Overwrite (Yield Enhancement)</option>
            </select>
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Put Floor Strike (% OTM)</span>
              <span class="wb-control-val">−${(opt.putOtmPct * 100).toFixed(0)}% ($${opt.kPut.toFixed(1)})</span>
            </div>
            <input type="range" class="wb-range" id="opt-put-otm" min="0.02" max="0.25" step="0.02" value="${opt.putOtmPct}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Call Cap Strike (% OTM)</span>
              <span class="wb-control-val">+${(opt.callOtmPct * 100).toFixed(0)}% ($${opt.kCall.toFixed(1)})</span>
            </div>
            <input type="range" class="wb-range" id="opt-call-otm" min="0.02" max="0.25" step="0.02" value="${opt.callOtmPct}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Implied Volatility (σ)</span>
              <span class="wb-control-val">${(opt.iv * 100).toFixed(1)}%</span>
            </div>
            <input type="range" class="wb-range" id="opt-iv" min="0.12" max="0.65" step="0.02" value="${opt.iv}" />
          </div>

          <hr style="border:none; border-top:1px solid #e2e8f0; margin:1rem 0;" />
          <div style="font-size:0.78rem; color:#334155; display:grid; gap:0.35rem;">
            <div style="display:flex; justify-content:space-between;"><span>Spot Price (${company.ticker}):</span><strong>$${opt.spot.toFixed(2)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Long Put Premium:</span><strong>$${opt.putLeg.price.toFixed(2)}/sh</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Short Call Credit:</span><strong>$${opt.callLeg.price.toFixed(2)}/sh</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Net Overlay Cost:</span><strong>$${opt.netPremiumPerShare.toFixed(2)}/sh (${(opt.netPremiumPct * 100).toFixed(2)}%)</strong></div>
          </div>
        </aside>

        <div>
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Executive Equity Hedging Payoff Profile (${company.ticker} @ ${fmtSharePrice(opt.spot)})</h3>
                <div class="wb-panel__subtitle">Comparing Unhedged Stock Position vs. ${opt.strategy.toUpperCase()} Overlay across ±35% Spot Shocks</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('strategy-collar', 'Collar')}
                ${conceptPill('strategy-protective-put', 'Protective Put')}
                ${conceptPill('black-scholes', 'Black-Scholes')}
              </div>
            </div>
            <div class="wb-panel__body">
              <div class="wb-canvas-wrap">
                <canvas id="overlay-payoff-canvas" style="width:100%; height:280px; display:block;"></canvas>
              </div>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Net Hedged Position Greeks &amp; Scenario Protection Table ($100M Position)</h3>
                <div class="wb-panel__subtitle">First- and Second-Order Derivative Sensitivities per Share</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('greeks-delta', 'Delta')}
                ${conceptPill('greeks-gamma', 'Gamma')}
                ${conceptPill('greeks-vega', 'Vega')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>Position Leg</th>
                    <th>Price / sh</th>
                    <th>Delta (Δ)</th>
                    <th>Gamma (Γ)</th>
                    <th>Vega (ν / 1% Vol)</th>
                    <th>Theta (Θ / day)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Underlying Stock (${company.ticker})</td>
                    <td>$${opt.spot.toFixed(2)}</td>
                    <td>+1.000</td>
                    <td>0.0000</td>
                    <td>$0.000</td>
                    <td>$0.000</td>
                  </tr>
                  <tr>
                    <td>Long Protective Put (K = $${opt.kPut.toFixed(1)})</td>
                    <td>$${opt.putLeg.price.toFixed(2)}</td>
                    <td>${opt.putLeg.delta.toFixed(3)}</td>
                    <td>+${opt.putLeg.gamma.toFixed(4)}</td>
                    <td>+$${opt.putLeg.vega.toFixed(3)}</td>
                    <td>$${opt.putLeg.theta.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td>Short OTM Call (K = $${opt.kCall.toFixed(1)})</td>
                    <td>($${opt.callLeg.price.toFixed(2)})</td>
                    <td>−${opt.callLeg.delta.toFixed(3)}</td>
                    <td>−${opt.callLeg.gamma.toFixed(4)}</td>
                    <td>−$${opt.callLeg.vega.toFixed(3)}</td>
                    <td>+$${Math.abs(opt.callLeg.theta).toFixed(3)}</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td>Net Hedged Portfolio Position (${opt.strategy})</td>
                    <td>$${(opt.spot + opt.netPremiumPerShare).toFixed(2)}</td>
                    <td>+${opt.netDeltaPerShare.toFixed(3)}</td>
                    <td>${opt.netGammaPerShare >= 0 ? '+' : ''}${opt.netGammaPerShare.toFixed(4)}</td>
                    <td>${opt.netVegaPerShare >= 0 ? '+' : ''}$${opt.netVegaPerShare.toFixed(3)}</td>
                    <td>$${opt.netThetaPerShare.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Draw Option Payoff Chart if Options tab is active
  const canvas = root.querySelector('#overlay-payoff-canvas');
  if (canvas && activeRiskTab === 'options') {
    drawOverlayPayoffCanvas(canvas, opt);
  }

  // Wire Risk Tabs
  root.querySelectorAll('.wb-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeRiskTab = btn.getAttribute('data-tab');
      renderRiskAnalyzer(company);
    });
  });

  // Wire Portfolio Controls
  const bindNum = (sel, obj, key, isFloat = true) => {
    const el = root.querySelector(sel);
    if (!el) return;
    el.addEventListener('change', (e) => {
      obj[key] = isFloat ? parseFloat(e.target.value) : e.target.value;
      renderRiskAnalyzer(company);
    });
  };
  bindNum('#risk-horizon', portOverrides, 'horizonDays');
  bindNum('#risk-w1', portOverrides, 'wTarget');
  bindNum('#risk-w2', portOverrides, 'wSp500');
  bindNum('#risk-w3', portOverrides, 'wBonds');
  bindNum('#risk-corr', portOverrides, 'corrEquityBond');

  // Wire Option Controls
  bindNum('#opt-strategy', optOverrides, 'strategy', false);
  bindNum('#opt-put-otm', optOverrides, 'putOtmPct');
  bindNum('#opt-call-otm', optOverrides, 'callOtmPct');
  bindNum('#opt-iv', optOverrides, 'iv');
}

if (typeof document !== 'undefined') {
  const initRisk = () => {
    const bannerEl = document.getElementById('analyze-target-banner');
    const rootEl = document.getElementById('wb-risk-root');
    if (!rootEl) return;

    if (bannerEl) {
      mountTargetBanner(bannerEl, (company) => {
        renderRiskAnalyzer(company);
      });
    }
    renderRiskAnalyzer(getActiveCompany());
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRisk);
  } else {
    initRisk();
  }
}
