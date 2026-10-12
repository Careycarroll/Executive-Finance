/**
 * js/analyze/stock-valuator.js
 * Workbench 2: Multi-Method Stock & Valuation Triangulator
 *
 * Implements:
 * 1. Interactive WACC & Hamada Beta Unlever/Relever Builder
 * 2. 2-Stage FCFF Discounted Cash Flow (DCF) + Exit Multiple TV + 5x5 Sensitivity Matrix + Reverse DCF Implied Growth Solver
 * 3. Penman Residual Operating Income (ReOI / EVA) Valuation & Clean-Surplus DCF Reconciliation
 * 4. Earnings Power Value (Greenwald EPV), Benjamin Graham Intrinsic Formula, and Tobin's Q
 * 5. Relative Multiples Valuation (EV/EBITDA, P/E, EV/Sales, P/FCF)
 * 6. HTML5 Canvas 2D Valuation Football Field Chart & Weighted Executive Target Price
 */

import {
  getActiveCompany,
  fmtMoney,
  fmtSharePrice,
  fmtPct,
  fmtMult,
  conceptPill
} from './state.js';
import { mountTargetBanner } from './hub.js';
import { compute10KAnalysis } from './10k-analyzer.js';

/**
 * Pure multi-method stock valuation engine.
 * Exported for unit testing and Hub preview integration.
 *
 * @param {object} company - Normalized company object
 * @param {object} [overrides] - Optional user slider overrides
 */
export function computeStockValuation(company, overrides = {}) {
  const fsa = compute10KAnalysis(company);
  const latest = fsa.latest;
  const cagrs = fsa.cagrs;

  const shares = Math.max(1, latest.sharesDiluted || company.sharesOut || 1000);
  const currentPrice = company.price || (company.marketCap ? company.marketCap / shares : 100);
  const marketCap = currentPrice * shares;
  const totalDebt = latest.FO;
  const excessCash = latest.FA;
  const netDebt = latest.NFO; // FO - FA
  const enterpriseValueMarket = marketCap + netDebt;

  // 1. WACC & Hamada Beta Parameters
  const rf = overrides.rf ?? 0.042; // 4.2% 10Y Treasury
  const erp = overrides.erp ?? 0.050; // 5.0% Equity Risk Premium
  const taxRate = overrides.taxRate ?? latest.effectiveTaxRate ?? 0.21;
  const observedBeta = company.beta || 1.05;

  // Unlever observed beta at current market D/E, then relever at target D/E
  const currentDE = marketCap > 0 ? totalDebt / marketCap : 0.2;
  const unleveredBeta = observedBeta / (1 + (1 - taxRate) * currentDE);
  const targetDebtWeight = overrides.targetDebtWeight ?? (totalDebt / Math.max(1, marketCap + totalDebt));
  const targetEquityWeight = Math.max(0.15, 1 - targetDebtWeight);
  const targetDE = targetDebtWeight / targetEquityWeight;
  const releveredBeta = overrides.beta ?? (unleveredBeta * (1 + (1 - taxRate) * targetDE));

  const costOfEquity = rf + releveredBeta * erp;
  // Estimate pre-tax cost of debt from interest coverage synthetic rating spread
  const syntheticSpread =
    latest.interestCoverage > 15 ? 0.0085 :
    latest.interestCoverage > 8  ? 0.0125 :
    latest.interestCoverage > 4  ? 0.0195 : 0.0325;
  const preTaxCostOfDebt = overrides.costOfDebt ?? Math.max(rf + 0.005, rf + syntheticSpread);
  const afterTaxCostOfDebt = preTaxCostOfDebt * (1 - taxRate);

  const wacc = overrides.wacc ?? Math.max(
    0.055,
    costOfEquity * targetEquityWeight + afterTaxCostOfDebt * targetDebtWeight
  );

  // 2. Stage 1 & Terminal Growth Defaults
  const defaultG1 = Math.min(0.18, Math.max(0.03, cagrs.fcf || cagrs.rev || 0.08));
  const g1 = overrides.g1 ?? defaultG1;
  const gTerminal = overrides.gTerminal ?? 0.025;
  const exitEbitdaMult = overrides.exitEbitdaMult ?? Math.min(25, Math.max(8, enterpriseValueMarket / Math.max(1, latest.ebitda)));

  // Base normalized FCF (if latest FCF is negative or depressed by CapEx spike, blend with NOPAT * 0.75)
  const baseFCF = latest.fcf > 0 ? latest.fcf : Math.max(latest.NOPAT * 0.65, latest.rev * 0.06);

  // Helper to run 5-year 2-stage DCF for any (rWacc, gStage1, gTerm)
  function runDCF(rWacc, gStage1, gTerm) {
    const safeWacc = Math.max(gTerm + 0.015, rWacc);
    let fcfT = baseFCF;
    let pvExplicit = 0;
    const schedule = [];

    for (let t = 1; t <= 5; t++) {
      // Linearly fade growth slightly toward terminal in years 4-5
      const stepG = t <= 3 ? gStage1 : gStage1 - ((t - 3) / 3) * (gStage1 - gTerm) * 0.5;
      fcfT = fcfT * (1 + stepG);
      const df = Math.pow(1 + safeWacc, -t);
      const pv = fcfT * df;
      pvExplicit += pv;
      schedule.push({ yearOffset: t, growth: stepG, fcf: fcfT, df, pv });
    }

    const terminalFCF = fcfT * (1 + gTerm);
    const terminalValueGGM = terminalFCF / (safeWacc - gTerm);
    const pvTerminalGGM = terminalValueGGM * Math.pow(1 + safeWacc, -5);
    const evGGM = pvExplicit + pvTerminalGGM;
    const eqValGGM = Math.max(0, evGGM - netDebt);
    const sharePriceGGM = eqValGGM / shares;

    // Exit Multiple Terminal Value comparison
    const projEbitda5 = Math.max(1, latest.ebitda) * Math.pow(1 + gStage1 * 0.85, 5);
    const terminalValueMult = projEbitda5 * exitEbitdaMult;
    const pvTerminalMult = terminalValueMult * Math.pow(1 + safeWacc, -5);
    const evMult = pvExplicit + pvTerminalMult;
    const sharePriceMult = Math.max(0, evMult - netDebt) / shares;

    return {
      schedule,
      pvExplicit,
      terminalFCF,
      terminalValueGGM,
      pvTerminalGGM,
      evGGM,
      eqValGGM,
      sharePriceGGM,
      terminalValueMult,
      pvTerminalMult,
      evMult,
      sharePriceMult,
      tvPctOfEV: evGGM > 0 ? pvTerminalGGM / evGGM : 0
    };
  }

  const dcf = runDCF(wacc, g1, gTerminal);

  // Reverse DCF: solve for implied 5-year Stage 1 growth rate that yields currentPrice
  let lo = -0.15;
  let hi = 0.45;
  for (let iter = 0; iter < 32; iter++) {
    const mid = (lo + hi) / 2;
    const testPrice = runDCF(wacc, mid, gTerminal).sharePriceGGM;
    if (testPrice < currentPrice) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const impliedGrowthRate = (lo + hi) / 2;

  // 5x5 Sensitivity Matrix (WACC vs Terminal Growth Rate)
  const waccSteps = [-0.01, -0.005, 0, 0.005, 0.01].map(d => Math.max(0.045, wacc + d));
  const gTermSteps = [-0.01, -0.005, 0, 0.005, 0.01].map(d => Math.max(0.005, Math.min(wacc - 0.02, gTerminal + d)));
  const sensitivityMatrix = waccSteps.map(r => ({
    wacc: r,
    cells: gTermSteps.map(gt => ({
      gTerm: gt,
      price: runDCF(r, g1, gt).sharePriceGGM
    }))
  }));

  // 3. Method 2: Penman Residual Operating Income (ReOI / EVA) Valuation
  // Clean-surplus reconciliation: Forecast NOA_t growing at g1 (fading to gTerminal),
  // with NOPAT_t = FCF_t + (NOA_t - NOA_{t-1}) so that ReOI_t = NOPAT_t - WACC * NOA_{t-1}
  // produces the EXACT same Enterprise Value as DCF!
  const noa0 = latest.NOA;
  let prevNOA = noa0;
  let pvReOI = 0;
  const reoiSchedule = dcf.schedule.map((row) => {
    const nextNOA = prevNOA * (1 + row.growth);
    const deltaNOA = nextNOA - prevNOA;
    const impliedNOPAT = row.fcf + deltaNOA; // Clean-surplus operating identity: OI_t = FCF_t + dNOA_t
    const capitalCharge = prevNOA * wacc;
    const reoi = impliedNOPAT - capitalCharge; // EVA_t = OI_t - WACC * NOA_{t-1}
    const pv = reoi * row.df;
    pvReOI += pv;
    const item = {
      yearOffset: row.yearOffset,
      begNOA: prevNOA,
      endNOA: nextNOA,
      nopat: impliedNOPAT,
      capitalCharge,
      reoi,
      pv
    };
    prevNOA = nextNOA;
    return item;
  });

  // Continuing Value of ReOI at Year 5:
  // CV_5 = (NOPAT_6 - WACC * NOA_5) / (WACC - gTerminal)
  // where NOPAT_6 = FCF_6 + gTerminal * NOA_5
  const nopat6 = dcf.terminalFCF + gTerminal * prevNOA;
  const reoi6 = nopat6 - wacc * prevNOA;
  const cvReOI = reoi6 / Math.max(0.015, wacc - gTerminal);
  const pvCvReOI = cvReOI * Math.pow(1 + wacc, -5);
  const evReOI = noa0 + pvReOI + pvCvReOI;
  const eqValReOI = Math.max(0, evReOI - netDebt);
  const sharePriceReOI = eqValReOI / shares;

  // Also compute constant-RNOA Penman Fundamental Value (based on historical RNOA persisting)
  const sustainableRNOA = Math.min(0.32, Math.max(wacc, latest.RNOA));
  const fundamentalReOI1 = noa0 * (sustainableRNOA - wacc);
  const evPenmanFundamental = noa0 + fundamentalReOI1 / Math.max(0.02, wacc - gTerminal * 0.7);
  const sharePricePenmanFundamental = Math.max(0, evPenmanFundamental - netDebt) / shares;

  // 4. Method 3: Greenwald Earnings Power Value (EPV), Graham Formula & Tobin's Q
  // Greenwald EPV = No-growth sustainable NOPAT / WACC
  const maintenanceCapex = Math.min(latest.capex, latest.da * 1.05 || latest.capex * 0.75);
  const growthCapex = Math.max(0, latest.capex - maintenanceCapex);
  const sustainableNOPAT = latest.NOPAT + growthCapex * 0.5;
  const evEPV = sustainableNOPAT / wacc;
  const eqValEPV = Math.max(0, evEPV - netDebt);
  const sharePriceEPV = eqValEPV / shares;
  const franchiseValuePerShare = Math.max(0, dcf.sharePriceGGM - sharePriceEPV);

  // Benjamin Graham Number & Growth Formula
  const eps = Math.max(0.1, latest.epsDiluted);
  const bvps = Math.max(1, latest.cse / shares);
  const grahamNumber = Math.sqrt(22.5 * eps * bvps);
  const aaaYield = 4.8; // 4.8% corporate AAA yield
  const grahamGrowthPrice = (eps * (8.5 + 2 * (g1 * 100)) * 4.4) / aaaYield;

  // Tobin's Q
  const replacementAssets = latest.ta + (latest.rd * 2.5); // Capitalize 2.5 yrs of R&D
  const tobinsQ = (marketCap + totalDebt) / Math.max(1, replacementAssets);

  // 5. Method 4: Relative Multiples & Sector Comps
  const currentPE = eps > 0 ? currentPrice / eps : 20;
  const currentEvEbitda = latest.ebitda > 0 ? enterpriseValueMarket / latest.ebitda : 14;
  const currentEvSales = latest.rev > 0 ? enterpriseValueMarket / latest.rev : 4;
  const currentPriceFCF = baseFCF > 0 ? marketCap / baseFCF : 20;

  // Sector benchmark median multiples (blended from sector norms + company quality premium)
  const qualityMult = latest.RNOA > 0.20 ? 1.15 : latest.RNOA > 0.12 ? 1.0 : 0.85;
  const sectorMedianEvEbitda = 15.5 * qualityMult;
  const sectorMedianPE = 21.0 * qualityMult;
  const sectorMedianPFCF = 22.0 * qualityMult;

  const priceFromEvEbitda = Math.max(0, (latest.ebitda * sectorMedianEvEbitda - netDebt) / shares);
  const priceFromPE = eps * sectorMedianPE;
  const priceFromPFCF = (baseFCF * sectorMedianPFCF) / shares;
  const compsMedianPrice = (priceFromEvEbitda * 0.4 + priceFromPE * 0.3 + priceFromPFCF * 0.3);

  // 6. Football Field Ranges & Weighted Composite Target Price
  const footballRanges = [
    {
      name: '2-Stage DCF (Gordon Growth)',
      concept: 'dcf',
      weight: 0.35,
      low: runDCF(wacc + 0.0075, g1 * 0.85, gTerminal - 0.005).sharePriceGGM,
      base: dcf.sharePriceGGM,
      high: runDCF(Math.max(0.05, wacc - 0.0075), g1 * 1.15, gTerminal + 0.005).sharePriceGGM,
      color: '#2563eb'
    },
    {
      name: '2-Stage DCF (Exit Multiple)',
      concept: 'terminal-value',
      weight: 0.20,
      low: dcf.sharePriceMult * 0.86,
      base: dcf.sharePriceMult,
      high: dcf.sharePriceMult * 1.14,
      color: '#4f46e5'
    },
    {
      name: 'Penman Residual Income (ReOI)',
      concept: 'residual-income',
      weight: 0.20,
      low: Math.min(sharePriceReOI, sharePricePenmanFundamental) * 0.90,
      base: (sharePriceReOI * 0.6 + sharePricePenmanFundamental * 0.4),
      high: Math.max(sharePriceReOI, sharePricePenmanFundamental) * 1.12,
      color: '#0d9488'
    },
    {
      name: 'Sector Multiples (EV/EBITDA, P/E)',
      concept: 'comparables',
      weight: 0.15,
      low: compsMedianPrice * 0.82,
      base: compsMedianPrice,
      high: compsMedianPrice * 1.18,
      color: '#d97706'
    },
    {
      name: 'Greenwald EPV & Graham Value',
      concept: 'valuation-reconciliation',
      weight: 0.10,
      low: Math.min(sharePriceEPV, grahamGrowthPrice * 0.85),
      base: (sharePriceEPV * 0.55 + grahamGrowthPrice * 0.45),
      high: Math.max(sharePriceEPV * 1.15, grahamGrowthPrice),
      color: '#7c3aed'
    }
  ];

  const compositeTargetPrice = footballRanges.reduce((acc, r) => acc + r.base * r.weight, 0);
  const upsidePct = currentPrice > 0 ? (compositeTargetPrice - currentPrice) / currentPrice : 0;
  const marginOfSafetyPct = compositeTargetPrice > 0 ? (compositeTargetPrice - currentPrice) / compositeTargetPrice : 0;
  const verdict =
    upsidePct >= 0.12 ? 'UNDERVALUED' :
    upsidePct <= -0.12 ? 'OVERVALUED' : 'FAIRLY VALUED';

  return {
    company,
    shares,
    currentPrice,
    marketCap,
    totalDebt,
    excessCash,
    netDebt,
    enterpriseValueMarket,
    waccInputs: {
      rf,
      erp,
      taxRate,
      observedBeta,
      unleveredBeta,
      releveredBeta,
      targetDebtWeight,
      targetEquityWeight,
      costOfEquity,
      preTaxCostOfDebt,
      afterTaxCostOfDebt,
      wacc
    },
    growthInputs: {
      g1,
      gTerminal,
      exitEbitdaMult,
      baseFCF
    },
    dcf,
    impliedGrowthRate,
    sensitivityMatrix,
    waccSteps,
    gTermSteps,
    reoi: {
      noa0,
      schedule: reoiSchedule,
      pvReOI,
      cvReOI,
      pvCvReOI,
      evReOI,
      eqValReOI,
      sharePriceReOI,
      sharePricePenmanFundamental,
      dcfReOIReconciliationDiff: Math.abs(dcf.evGGM - evReOI)
    },
    epvGraham: {
      sustainableNOPAT,
      evEPV,
      sharePriceEPV,
      franchiseValuePerShare,
      grahamNumber,
      grahamGrowthPrice,
      tobinsQ
    },
    multiples: {
      currentPE,
      currentEvEbitda,
      currentEvSales,
      currentPriceFCF,
      priceFromEvEbitda,
      priceFromPE,
      priceFromPFCF,
      compsMedianPrice
    },
    footballRanges,
    compositeTargetPrice,
    upsidePct,
    marginOfSafetyPct,
    verdict
  };
}

/**
 * Draw the Valuation Football Field horizontal range chart on an HTML5 Canvas
 */
function drawFootballFieldChart(canvas, valModel) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(600, rect.width || 720);
  const height = 290;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const ranges = valModel.footballRanges;
  const allVals = [
    valModel.currentPrice,
    valModel.compositeTargetPrice,
    ...ranges.flatMap(r => [r.low, r.base, r.high])
  ].filter(v => Number.isFinite(v) && v > 0);

  const minP = Math.max(0, Math.min(...allVals) * 0.82);
  const maxP = Math.max(...allVals) * 1.15;

  const padL = 225;
  const padR = 45;
  const padT = 36;
  const padB = 38;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xOf = (p) => padL + ((p - minP) / Math.max(1, maxP - minP)) * plotW;

  // Background grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.font = '600 11px Inter, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';

  const ticks = 6;
  for (let i = 0; i <= ticks; i++) {
    const val = minP + (i / ticks) * (maxP - minP);
    const x = xOf(val);
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
    ctx.fillText(`$${val.toFixed(0)}`, x, padT + plotH + 20);
  }

  // Draw each valuation method bar
  const rowH = plotH / ranges.length;
  ranges.forEach((r, idx) => {
    const cy = padT + idx * rowH + rowH / 2;
    const barH = 18;
    const xLow = xOf(r.low);
    const xBase = xOf(r.base);
    const xHigh = xOf(r.high);

    // Label on left
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(r.name, padL - 14, cy + 4);

    // Range bar
    ctx.fillStyle = r.color + '28';
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(xLow, cy - barH / 2, Math.max(6, xHigh - xLow), barH, 5);
    ctx.fill();
    ctx.stroke();

    // Base point diamond / marker
    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.arc(xBase, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Low / Base / High labels
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    ctx.fillText(`$${r.low.toFixed(0)}`, xLow - 5, cy + 3);
    ctx.textAlign = 'left';
    ctx.fillText(`$${r.high.toFixed(0)}`, xHigh + 5, cy + 3);
  });

  // Current Market Price vertical dashed line
  const xMkt = xOf(valModel.currentPrice);
  ctx.save();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(xMkt, padT - 8);
  ctx.lineTo(xMkt, padT + plotH);
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Market: $${valModel.currentPrice.toFixed(2)}`, xMkt, padT - 13);
  ctx.restore();

  // Weighted Composite Target Price vertical line
  const xTarget = xOf(valModel.compositeTargetPrice);
  ctx.save();
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(xTarget, padT - 4);
  ctx.lineTo(xTarget, padT + plotH);
  ctx.stroke();
  ctx.fillStyle = '#15803d';
  ctx.font = '800 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  const offsetLabelY = Math.abs(xTarget - xMkt) < 95 ? padT + plotH + 34 : padT - 13;
  ctx.fillText(`Target: $${valModel.compositeTargetPrice.toFixed(2)}`, xTarget, offsetLabelY);
  ctx.restore();
}

// Keep current user slider overrides in memory while viewing the same company
let currentTicker = null;
let currentOverrides = {};

function renderStockValuator(company) {
  const root = document.getElementById('wb-valuator-root');
  if (!root) return;

  if (currentTicker !== company.ticker) {
    currentTicker = company.ticker;
    currentOverrides = {};
  }

  const val = computeStockValuation(company, currentOverrides);
  const { waccInputs, growthInputs, dcf, reoi, epvGraham, multiples } = val;

  const upsideColor = val.upsidePct >= 0.05 ? '#16a34a' : val.upsidePct <= -0.05 ? '#dc2626' : '#d97706';

  root.innerHTML = `
    <!-- Executive Valuation Summary KPI Strip -->
    <div class="wb-kpi-grid">
      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Current Market Price</span>
          ${conceptPill('market-efficiency', 'Market')}
        </div>
        <div class="wb-kpi-card__value">${fmtSharePrice(val.currentPrice)}</div>
        <div class="wb-kpi-card__sub">Mkt Cap ${fmtMoney(val.marketCap)} · EV ${fmtMoney(val.enterpriseValueMarket)}</div>
      </div>

      <div class="wb-kpi-card" style="border-color:#93c5fd; background:#f8fafc;">
        <div class="wb-kpi-card__label">
          <span>Triangulated Target Price</span>
          ${conceptPill('valuation-reconciliation', 'Composite')}
        </div>
        <div class="wb-kpi-card__value" style="color:${upsideColor};">${fmtSharePrice(val.compositeTargetPrice)}</div>
        <div class="wb-kpi-card__sub" style="color:${upsideColor}; font-weight:700;">
          ${val.upsidePct >= 0 ? '+' : ''}${(val.upsidePct * 100).toFixed(1)}% (${val.verdict})
        </div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>2-Stage DCF Value</span>
          ${conceptPill('dcf', 'DCF')}
        </div>
        <div class="wb-kpi-card__value">${fmtSharePrice(dcf.sharePriceGGM)}</div>
        <div class="wb-kpi-card__sub">EV ${fmtMoney(dcf.evGGM)} · TV ${(dcf.tvPctOfEV * 100).toFixed(0)}% of EV</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Penman ReOI / EVA Value</span>
          ${conceptPill('residual-income', 'ReOI')}
        </div>
        <div class="wb-kpi-card__value">${fmtSharePrice(reoi.sharePriceReOI)}</div>
        <div class="wb-kpi-card__sub">NOA₀ ${fmtMoney(reoi.noa0)} + PV(EVA) ${fmtMoney(reoi.pvReOI + reoi.pvCvReOI)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>WACC &amp; Relevered Beta</span>
          ${conceptPill('wacc', 'WACC')}
        </div>
        <div class="wb-kpi-card__value">${fmtPct(waccInputs.wacc)}</div>
        <div class="wb-kpi-card__sub">Ke ${fmtPct(waccInputs.costOfEquity)} (βL ${waccInputs.releveredBeta.toFixed(2)}) · Kd(1−τ) ${fmtPct(waccInputs.afterTaxCostOfDebt)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Reverse DCF Implied Growth</span>
          ${conceptPill('scenario-analysis', 'Reverse DCF')}
        </div>
        <div class="wb-kpi-card__value">${fmtPct(val.impliedGrowthRate)}</div>
        <div class="wb-kpi-card__sub">5Y FCF CAGR priced in at ${fmtSharePrice(val.currentPrice)}</div>
      </div>
    </div>

    <!-- Interactive Valuation Controls + Football Field Chart -->
    <div class="wb-layout">
      <!-- Left Sidebar Controls -->
      <aside class="wb-sidebar">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
          <h3 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#0f172a; margin:0;">
            Valuation Assumptions
          </h3>
          <button id="val-reset-btn" style="font-size:0.72rem; font-weight:700; color:#2563eb; background:none; border:none; cursor:pointer;">Reset Defaults</button>
        </div>

        <div class="wb-control-group">
          <div class="wb-control-label">
            <span>WACC Discount Rate</span>
            <span class="wb-control-val">${(waccInputs.wacc * 100).toFixed(2)}%</span>
          </div>
          <input type="range" class="wb-range" id="ctrl-wacc" min="0.05" max="0.15" step="0.0025" value="${waccInputs.wacc}" />
        </div>

        <div class="wb-control-group">
          <div class="wb-control-label">
            <span>Stage 1 Growth (Y1–Y5)</span>
            <span class="wb-control-val">${(growthInputs.g1 * 100).toFixed(1)}%</span>
          </div>
          <input type="range" class="wb-range" id="ctrl-g1" min="-0.02" max="0.25" step="0.005" value="${growthInputs.g1}" />
        </div>

        <div class="wb-control-group">
          <div class="wb-control-label">
            <span>Terminal Growth (g₂)</span>
            <span class="wb-control-val">${(growthInputs.gTerminal * 100).toFixed(2)}%</span>
          </div>
          <input type="range" class="wb-range" id="ctrl-gterm" min="0.01" max="0.045" step="0.0025" value="${growthInputs.gTerminal}" />
        </div>

        <div class="wb-control-group">
          <div class="wb-control-label">
            <span>Exit EV/EBITDA Multiple</span>
            <span class="wb-control-val">${growthInputs.exitEbitdaMult.toFixed(1)}x</span>
          </div>
          <input type="range" class="wb-range" id="ctrl-exit-mult" min="6" max="30" step="0.5" value="${growthInputs.exitEbitdaMult}" />
        </div>

        <hr style="border:none; border-top:1px solid #e2e8f0; margin:1rem 0;" />

        <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:#475569; margin-bottom:0.5rem;">
          Hamada Beta &amp; CAPM Breakdown ${conceptPill('cost-of-equity', 'CAPM')}
        </div>
        <div style="font-size:0.78rem; color:#334155; display:grid; gap:0.35rem;">
          <div style="display:flex; justify-content:space-between;"><span>Risk-Free Rate (Rf):</span><strong>${fmtPct(waccInputs.rf)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Equity Risk Premium:</span><strong>${fmtPct(waccInputs.erp)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Unlevered Beta (βU):</span><strong>${waccInputs.unleveredBeta.toFixed(2)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Levered Beta (βL):</span><strong>${waccInputs.releveredBeta.toFixed(2)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Cost of Equity (Ke):</span><strong>${fmtPct(waccInputs.costOfEquity)}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>After-Tax Cost of Debt:</span><strong>${fmtPct(waccInputs.afterTaxCostOfDebt)}</strong></div>
        </div>
      </aside>

      <!-- Right Main Workspace -->
      <div>
        <!-- Football Field Chart Panel -->
        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Executive Valuation Football Field (${company.ticker})</h3>
              <div class="wb-panel__subtitle">Triangulating Intrinsic Value across 5 Methodologies vs. Current Market Price (${fmtSharePrice(val.currentPrice)})</div>
            </div>
            ${conceptPill('valuation-reconciliation', 'Triangulation')}
          </div>
          <div class="wb-panel__body">
            <div class="wb-canvas-wrap">
              <canvas id="football-field-canvas" style="width:100%; height:290px; display:block;"></canvas>
            </div>
          </div>
        </div>

        <!-- Sub-Tabs for Detailed Model Breakdowns -->
        <div class="wb-tabs" role="tablist">
          <button class="wb-tab active" data-tab="dcf">1. 2-Stage DCF &amp; 5×5 Sensitivity</button>
          <button class="wb-tab" data-tab="reoi">2. Penman Residual Income (ReOI) Reconciliation</button>
          <button class="wb-tab" data-tab="epv">3. Multiples, Greenwald EPV &amp; Graham</button>
        </div>

        <!-- TAB 1: DCF & 5x5 SENSITIVITY -->
        <div id="val-tab-dcf">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">5-Year Explicit FCFF Forecast &amp; Enterprise-to-Equity Bridge ($ Millions)</h3>
                <div class="wb-panel__subtitle">Base FCF = ${fmtMoney(growthInputs.baseFCF)} · WACC = ${fmtPct(waccInputs.wacc)} · Stage 1 Growth = ${fmtPct(growthInputs.g1)} · Terminal Growth = ${fmtPct(growthInputs.gTerminal)}</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('dcf', 'DCF')}
                ${conceptPill('terminal-value', 'Terminal Value')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>DCF Component</th>
                    ${dcf.schedule.map(s => `<th>Year +${s.yearOffset}</th>`).join('')}
                    <th>Terminal Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Projected Growth Rate (%)</td>
                    ${dcf.schedule.map(s => `<td>${fmtPct(s.growth)}</td>`).join('')}
                    <td>${fmtPct(growthInputs.gTerminal)} (Perpetuity)</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td>Projected Free Cash Flow (FCFF)</td>
                    ${dcf.schedule.map(s => `<td>${fmtMoney(s.fcf)}</td>`).join('')}
                    <td>${fmtMoney(dcf.terminalValueGGM)}</td>
                  </tr>
                  <tr>
                    <td>Discount Factor (1 + WACC)⁻ᵗ</td>
                    ${dcf.schedule.map(s => `<td>${s.df.toFixed(3)}</td>`).join('')}
                    <td>${dcf.schedule[4].df.toFixed(3)}</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td>Present Value of Cash Flows ($M)</td>
                    ${dcf.schedule.map(s => `<td>${fmtMoney(s.pv)}</td>`).join('')}
                    <td>${fmtMoney(dcf.pvTerminalGGM)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="wb-panel__body" style="border-top:1px solid #e2e8f0; background:#f8fafc;">
              <div class="wb-formula-breakdown" style="margin-top:0;">
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">PV Explicit (Y1–Y5)</div>
                  <div class="wb-formula-box__val">${fmtMoney(dcf.pvExplicit)}</div>
                </div>
                <div class="wb-formula-op">+</div>
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">PV Terminal Value</div>
                  <div class="wb-formula-box__val">${fmtMoney(dcf.pvTerminalGGM)}</div>
                </div>
                <div class="wb-formula-op">=</div>
                <div class="wb-formula-box" style="border-color:#93c5fd; background:#eff6ff;">
                  <div class="wb-formula-box__label">Enterprise Value (EV)</div>
                  <div class="wb-formula-box__val" style="color:#1e40af;">${fmtMoney(dcf.evGGM)}</div>
                </div>
                <div class="wb-formula-op">−</div>
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">Net Debt (NFO)</div>
                  <div class="wb-formula-box__val">${fmtMoney(val.netDebt)}</div>
                </div>
                <div class="wb-formula-op">=</div>
                <div class="wb-formula-box" style="border-color:#86efac; background:#f0fdf4;">
                  <div class="wb-formula-box__label">Intrinsic Share Price</div>
                  <div class="wb-formula-box__val" style="color:#15803d;">${fmtSharePrice(dcf.sharePriceGGM)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5x5 Sensitivity Matrix -->
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">5×5 DCF Intrinsic Share Price Sensitivity Matrix (WACC vs. Terminal Growth g₂)</h3>
                <div class="wb-panel__subtitle">Green cells indicate upside vs. current market price (${fmtSharePrice(val.currentPrice)}); highlighted cell is current base case</div>
              </div>
              ${conceptPill('scenario-analysis', 'Sensitivity')}
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>WACC \\ Terminal g₂</th>
                    ${val.gTermSteps.map(gt => `<th>g₂ = ${(gt * 100).toFixed(2)}%</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${val.sensitivityMatrix.map((row, rIdx) => `
                    <tr>
                      <td style="font-weight:700;">WACC = ${(row.wacc * 100).toFixed(2)}%</td>
                      ${row.cells.map((cell, cIdx) => {
                        const isCenter = rIdx === 2 && cIdx === 2;
                        const up = cell.price >= val.currentPrice;
                        const bg = isCenter ? '#dbeafe' : up ? '#f0fdf4' : '#fef2f2';
                        const col = isCenter ? '#1e40af' : up ? '#15803d' : '#b91c1c';
                        return `<td style="background:${bg}; color:${col}; font-weight:${isCenter ? '800' : '600'}; border:${isCenter ? '2px solid #2563eb' : '1px solid #e2e8f0'};">${fmtSharePrice(cell.price)}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB 2: PENMAN RESIDUAL OPERATING INCOME (ReOI) & EVA RECONCILIATION -->
        <div id="val-tab-reoi" style="display:none;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Penman Residual Operating Income (ReOI / EVA) Valuation &amp; DCF Equivalence</h3>
                <div class="wb-panel__subtitle">EV = NOA₀ + ∑ PV(NOPATₜ − WACC × NOAₜ₋₁) + PV(CV) &nbsp;·&nbsp; Exact mathematical equivalence to FCFF DCF</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('residual-income', 'Penman ReOI')}
                ${conceptPill('valuation-reconciliation', 'DCF ≡ ReOI')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>Residual Income Line Item ($M)</th>
                    ${reoi.schedule.map(s => `<th>Year +${s.yearOffset}</th>`).join('')}
                    <th>Continuing Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Beginning Net Operating Assets (NOAₜ₋₁)</td>
                    ${reoi.schedule.map(s => `<td>${fmtMoney(s.begNOA)}</td>`).join('')}
                    <td>${fmtMoney(reoi.schedule[4].endNOA)}</td>
                  </tr>
                  <tr>
                    <td>Clean-Surplus NOPAT (OIₜ = FCFₜ + ΔNOAₜ)</td>
                    ${reoi.schedule.map(s => `<td>${fmtMoney(s.nopat)}</td>`).join('')}
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>Less: Capital Charge (WACC × NOAₜ₋₁)</td>
                    ${reoi.schedule.map(s => `<td>(${fmtMoney(s.capitalCharge)})</td>`).join('')}
                    <td>—</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td>Residual Operating Income (ReOIₜ / EVAₜ)</td>
                    ${reoi.schedule.map(s => `<td>${fmtMoney(s.reoi)}</td>`).join('')}
                    <td>${fmtMoney(reoi.cvReOI)}</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td>Present Value of ReOI ($M)</td>
                    ${reoi.schedule.map(s => `<td>${fmtMoney(s.pv)}</td>`).join('')}
                    <td>${fmtMoney(reoi.pvCvReOI)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="wb-panel__body" style="border-top:1px solid #e2e8f0; background:#f8fafc;">
              <div style="font-size:0.82rem; color:#334155; line-height:1.55;">
                <strong>Clean-Surplus Reconciliation Proof:</strong> Starting from book Net Operating Assets <strong>NOA₀ = ${fmtMoney(reoi.noa0)}</strong> and adding the Present Value of 5-year Economic Value Added (<strong>${fmtMoney(reoi.pvReOI)}</strong>) plus Continuing Value (<strong>${fmtMoney(reoi.pvCvReOI)}</strong>) yields Enterprise Value = <strong>${fmtMoney(reoi.evReOI)}</strong> (Share Price = <strong>${fmtSharePrice(reoi.sharePriceReOI)}</strong>)—matching the 2-Stage FCFF DCF Enterprise Value (<strong>${fmtMoney(dcf.evGGM)}</strong>) to within <strong>$${reoi.dcfReOIReconciliationDiff.toFixed(2)}M</strong>! Unlike DCF (where ${(dcf.tvPctOfEV * 100).toFixed(0)}% of value sits in Terminal Value), Penman ReOI anchors valuation on audited balance sheet NOA₀.
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: MULTIPLES, GREENWALD EPV & GRAHAM -->
        <div id="val-tab-epv" style="display:none;">
          <div class="wb-grid-2">
            <div class="wb-panel">
              <div class="wb-panel__header">
                <div>
                  <h3 class="wb-panel__title">Greenwald Earnings Power Value (EPV) &amp; Graham</h3>
                  <div class="wb-panel__subtitle">Separating No-Growth Earnings Power from Franchise Growth Value</div>
                </div>
                ${conceptPill('valuation-reconciliation', 'EPV')}
              </div>
              <div class="wb-table-wrap">
                <table class="wb-table">
                  <thead>
                    <tr>
                      <th>Benchmark Model</th>
                      <th>Implied Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="text-align:left;">Sustainable No-Growth NOPAT</td>
                      <td>${fmtMoney(epvGraham.sustainableNOPAT)}</td>
                    </tr>
                    <tr class="wb-row-total">
                      <td style="text-align:left;">Greenwald EPV Share Price (Zero Growth)</td>
                      <td>${fmtSharePrice(epvGraham.sharePriceEPV)}</td>
                    </tr>
                    <tr>
                      <td style="text-align:left;">Implied Franchise / Growth Value per Share</td>
                      <td>${fmtSharePrice(epvGraham.franchiseValuePerShare)}</td>
                    </tr>
                    <tr>
                      <td style="text-align:left;">Benjamin Graham Number √(22.5 × EPS × BVPS)</td>
                      <td>${fmtSharePrice(epvGraham.grahamNumber)}</td>
                    </tr>
                    <tr class="wb-row-total">
                      <td style="text-align:left;">Graham Intrinsic Growth Formula</td>
                      <td>${fmtSharePrice(epvGraham.grahamGrowthPrice)}</td>
                    </tr>
                    <tr>
                      <td style="text-align:left;">Tobin's Q (Market EV / R&amp;D-Adjusted Assets)</td>
                      <td>${epvGraham.tobinsQ.toFixed(2)}x</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="wb-panel">
              <div class="wb-panel__header">
                <div>
                  <h3 class="wb-panel__title">Relative Multiples &amp; Peer Comps</h3>
                  <div class="wb-panel__subtitle">Current Trading Multiples vs. Quality-Adjusted Sector Medians</div>
                </div>
                ${conceptPill('comparables', 'Multiples')}
              </div>
              <div class="wb-table-wrap">
                <table class="wb-table">
                  <thead>
                    <tr>
                      <th>Multiple Metric</th>
                      <th>Current</th>
                      <th>Implied Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>EV / EBITDA ${conceptPill('multiples', 'EV/EBITDA')}</td>
                      <td>${multiples.currentEvEbitda.toFixed(1)}x</td>
                      <td>${fmtSharePrice(multiples.priceFromEvEbitda)}</td>
                    </tr>
                    <tr>
                      <td>Price / Earnings (P/E) ${conceptPill('multiples', 'P/E')}</td>
                      <td>${multiples.currentPE.toFixed(1)}x</td>
                      <td>${fmtSharePrice(multiples.priceFromPE)}</td>
                    </tr>
                    <tr>
                      <td>Price / Free Cash Flow (P/FCF) ${conceptPill('fcf', 'P/FCF')}</td>
                      <td>${multiples.currentPriceFCF.toFixed(1)}x</td>
                      <td>${fmtSharePrice(multiples.priceFromPFCF)}</td>
                    </tr>
                    <tr class="wb-row-total">
                      <td>Blended Comps Implied Share Price</td>
                      <td>—</td>
                      <td>${fmtSharePrice(multiples.compsMedianPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Draw Football Field Canvas
  const canvas = root.querySelector('#football-field-canvas');
  drawFootballFieldChart(canvas, val);

  // Wire Sub-Tabs
  const tabs = root.querySelectorAll('.wb-tab');
  const panes = {
    dcf: root.querySelector('#val-tab-dcf'),
    reoi: root.querySelector('#val-tab-reoi'),
    epv: root.querySelector('#val-tab-epv')
  };
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      Object.entries(panes).forEach(([k, el]) => {
        if (el) el.style.display = k === target ? 'block' : 'none';
      });
    });
  });

  // Wire Sliders
  const bindSlider = (id, key) => {
    const el = root.querySelector(id);
    if (!el) return;
    el.addEventListener('change', (e) => {
      currentOverrides[key] = parseFloat(e.target.value);
      renderStockValuator(company);
    });
  };
  bindSlider('#ctrl-wacc', 'wacc');
  bindSlider('#ctrl-g1', 'g1');
  bindSlider('#ctrl-gterm', 'gTerminal');
  bindSlider('#ctrl-exit-mult', 'exitEbitdaMult');

  const resetBtn = root.querySelector('#val-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentOverrides = {};
      renderStockValuator(company);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const bannerEl = document.getElementById('analyze-target-banner');
  const rootEl = document.getElementById('wb-valuator-root');
  if (!rootEl) return;

  if (bannerEl) {
    mountTargetBanner(bannerEl, (company) => {
      renderStockValuator(company);
    });
  }
  renderStockValuator(getActiveCompany());

  window.addEventListener('resize', () => {
    const canvas = document.getElementById('football-field-canvas');
    if (canvas) {
      drawFootballFieldChart(canvas, computeStockValuation(getActiveCompany(), currentOverrides));
    }
  });
});
