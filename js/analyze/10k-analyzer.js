/**
 * js/analyze/10k-analyzer.js
 * Workbench 1: 10-K & Penman Financial Statement Analyzer
 *
 * Implements:
 * 1. Multi-year (5Y) Reported Financial Statements & CAGR calculation
 * 2. Penman Reformulated Balance Sheet (OA, OL, NOA, FA, FO, NFO, CSE) & Income Statement (NOPAT/OI, NFE, Tax Shield)
 * 3. Dual ROE Decomposition:
 *    - Penman: ROE = RNOA + FLEV * (RNOA - NBC), with RNOA = OPM * NOAT
 *    - Hawawini & Viallet 5-Factor DuPont:EBIT/Sales * Sales/Assets * EBT/EBIT * NI/EBT * Assets/Equity
 * 4. Working Capital & Cash Conversion Cycle (DSO, DIO, DPO, CCC, WCR/Sales)
 * 5. Sloan Accrual Ratio & Cash Conversion Diagnostics
 * 6. Automated Executive Red Flags & 0-100 Financial Health Scorecard
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

/**
 * Compute compound annual growth rate (CAGR) between oldest and newest positive values
 */
export function calcCAGR(oldestVal, newestVal, periods) {
  if (!oldestVal || !newestVal || periods <= 0 || oldestVal <= 0 || newestVal <= 0) {
    return null;
  }
  return Math.pow(newestVal / oldestVal, 1 / periods) - 1;
}

/**
 * Pure computation engine for 10-K & Penman FSA analysis.
 * Exported for unit testing and reuse across workbenches.
 *
 * @param {object} company - Normalized company snapshot
 * @param {object} [opts] - Optional overrides (e.g. operatingCashPctSales = 0.015)
 */
export function compute10KAnalysis(company, opts = {}) {
  const opCashPctSales = opts.operatingCashPctSales ?? 0.015;
  const rawAnnual = (company?.financials?.annual || []).slice(0, 5);
  // Chronological order (oldest -> newest) for multi-year table display
  const yearsAsc = [...rawAnnual].reverse();
  const numYears = yearsAsc.length;
  const periods = Math.max(1, numYears - 1);

  const byYear = yearsAsc.map((y, idx) => {
    const rev = y.revenue || 0;
    const cogs = y.cogs || Math.max(0, rev - (y.grossProfit || 0));
    const gp = y.grossProfit ?? (rev - cogs);
    const rd = y.rd || 0;
    const sga = y.sga || 0;
    const ebit = y.operatingIncome || 0;
    const da = y.depreciation || 0;
    const ebitda = ebit + da;
    const intExp = Math.max(0, y.interestExpense || 0);
    const ebt = y.pretaxIncome ?? (ebit - intExp);
    const taxExp = y.taxExpense || 0;
    const ni = y.netIncome || 0;
    const sbc = y.sbc || 0;

    // Effective tax rate (clamped between 5% and 40%, default 21%)
    const effectiveTaxRate = ebt > 0 && taxExp >= 0
      ? Math.min(0.40, Math.max(0.05, taxExp / ebt))
      : 0.21;

    // Balance sheet items
    const totalCash = (y.cash || 0) + (y.shortTermInvestments || 0);
    const ar = y.accountsReceivable || 0;
    const inv = y.inventory || 0;
    const ca = y.currentAssets || (totalCash + ar + inv);
    const ppe = y.ppeNet || 0;
    const gwIntang = (y.goodwill || 0) + (y.intangibles || 0);
    const ta = y.totalAssets || 1;
    const ap = y.accountsPayable || 0;
    const std = y.shortTermDebt || 0;
    const cl = y.currentLiabilities || (ap + std);
    const ltd = y.longTermDebt || 0;
    const tl = y.totalLiabilities || (cl + ltd);
    const cse = y.stockholdersEquity ?? (ta - tl);

    // Cash flow items
    const ocf = y.operatingCashFlow || 0;
    const capex = Math.abs(y.capex || 0);
    const fcf = y.freeCashFlow ?? (ocf - capex);
    const divs = Math.abs(y.dividendsPaid || 0);
    const buybacks = Math.abs(y.shareRepurchases || 0);

    // Penman Reformulation:
    // Operating cash = min(totalCash, opCashPctSales * revenue)
    const operatingCash = Math.min(totalCash, Math.max(0, rev * opCashPctSales));
    const FA = Math.max(0, totalCash - operatingCash); // Financial Assets (excess cash & marketable securities)
    const OA = Math.max(1, ta - FA);                   // Operating Assets
    const FO = std + ltd;                              // Financial Obligations (total debt)
    const OL = Math.max(0, tl - FO);                   // Operating Liabilities (non-interest-bearing)
    const NOA = OA - OL;                               // Net Operating Assets
    const NFO = FO - FA;                               // Net Financial Obligations (Net Debt)

    // Penman Reformulated Income Statement:
    // Tax shield on interest = Interest * statutory/effective tax rate
    const taxShield = intExp * effectiveTaxRate;
    const NOPAT = ebit * (1 - effectiveTaxRate);       // Operating Income after tax (OI)
    const NFE = NOPAT - ni;                            // Net Financial Expense after tax (reconciles OI - NFE = NI)

    // Penman ratios (use positive denominator protection)
    const noaDenom = Math.abs(NOA) > 10 ? NOA : Math.max(100, OA * 0.25);
    const cseDenom = Math.abs(cse) > 10 ? cse : 100;
    const OPM = rev > 0 ? NOPAT / rev : 0;             // Operating Profit Margin after tax
    const NOAT = noaDenom > 0 ? rev / noaDenom : 0;    // Net Operating Asset Turnover
    const RNOA = noaDenom !== 0 ? NOPAT / noaDenom : 0;
    const FLEV = cse > 0 ? NFO / cseDenom : 0;
    const NBC = Math.abs(NFO) > 25 ? NFE / NFO : (FO > 0 ? (intExp * (1 - effectiveTaxRate)) / FO : 0.04);
    const SPREAD = RNOA - NBC;
    const ROE = cse > 0 ? ni / cseDenom : (ni / Math.max(100, ta * 0.15));
    const levGain = FLEV * SPREAD;

    // Penman Free Cash Flow: OI - delta NOA
    const prevNOA = idx > 0 ? null : null; // filled in second pass

    // Hawawini & Viallet 5-Factor DuPont:
    const ebitMargin = rev > 0 ? ebit / rev : 0;
    const assetTurnover = ta > 0 ? rev / ta : 0;
    const interestBurden = ebit !== 0 ? ebt / ebit : 1;
    const taxBurden = ebt !== 0 ? ni / ebt : (1 - effectiveTaxRate);
    const equityMultiplier = cse > 0 ? ta / cse : 0;

    // Working Capital & Cash Conversion Cycle:
    const dso = rev > 0 ? (ar / rev) * 365 : 0;
    const dio = cogs > 0 ? (inv / cogs) * 365 : 0;
    const dpo = cogs > 0 ? (ap / cogs) * 365 : 0;
    const ccc = dso + dio - dpo;
    const wcr = ar + inv - ap; // Working Capital Requirement (Hawawini Ch. 4)
    const wcrToSales = rev > 0 ? wcr / rev : 0;
    const nlc = totalCash - std; // Net Liquid Balance (NLB = Cash - Short-term debt, verify WCR + NLB = NWC)

    // Liquidity & Solvency Ratios:
    const currentRatio = cl > 0 ? ca / cl : 0;
    const quickRatio = cl > 0 ? (totalCash + ar) / cl : 0;
    const cashRatio = cl > 0 ? totalCash / cl : 0;
    const debtToEquity = cse > 0 ? FO / cse : (FO > 0 ? 9.99 : 0);
    const netDebtToEbitda = ebitda > 0 ? NFO / ebitda : 0;
    const interestCoverage = intExp > 0 ? ebit / intExp : (ebit > 0 ? 50 : 0);

    // Profitability & Quality Ratios:
    const grossMargin = rev > 0 ? gp / rev : 0;
    const netMargin = rev > 0 ? ni / rev : 0;
    const roa = ta > 0 ? ni / ta : 0;
    const fcfMargin = rev > 0 ? fcf / rev : 0;
    const ocfToNi = ni > 0 ? ocf / ni : (ocf > 0 ? 1.5 : 0);
    const sbcPctRev = rev > 0 ? sbc / rev : 0;
    const sbcAdjustedOpMargin = rev > 0 ? (ebit - sbc) / rev : 0;

    // Sloan Accrual Quality:
    // Total Accruals = Net Income - Operating Cash Flow
    const totalAccruals = ni - ocf;
    const sloanAccrualRatio = OA > 0 ? totalAccruals / OA : 0;
    const goodwillPctAssets = ta > 0 ? gwIntang / ta : 0;

    return {
      year: y.year,
      // Reported IS
      rev, cogs, gp, rd, sga, ebit, da, ebitda, intExp, ebt, taxExp, ni, sbc,
      epsDiluted: y.epsDiluted || (y.sharesDiluted ? ni / y.sharesDiluted : 0),
      sharesDiluted: y.sharesDiluted || 1,
      effectiveTaxRate,
      // Reported BS
      totalCash, ar, inv, ca, ppe, gwIntang, ta, ap, std, cl, ltd, tl, cse,
      // Reported CF
      ocf, capex, fcf, divs, buybacks,
      // Penman Reformulated
      operatingCash, FA, OA, FO, OL, NOA, NFO,
      taxShield, NOPAT, NFE,
      OPM, NOAT, RNOA, FLEV, NBC, SPREAD, ROE, levGain,
      // DuPont 5-Factor
      ebitMargin, assetTurnover, interestBurden, taxBurden, equityMultiplier,
      // Working Capital & CCC
      dso, dio, dpo, ccc, wcr, wcrToSales, nlc,
      // Ratios
      currentRatio, quickRatio, cashRatio,
      debtToEquity, netDebtToEbitda, interestCoverage,
      grossMargin, netMargin, roa, fcfMargin, ocfToNi,
      sbcPctRev, sbcAdjustedOpMargin,
      totalAccruals, sloanAccrualRatio, goodwillPctAssets
    };
  });

  // Second pass: compute delta NOA and Penman FCF = OI - dNOA
  for (let i = 0; i < byYear.length; i++) {
    if (i === 0) {
      byYear[i].deltaNOA = 0;
      byYear[i].penmanFCF = byYear[i].fcf;
    } else {
      byYear[i].deltaNOA = byYear[i].NOA - byYear[i - 1].NOA;
      byYear[i].penmanFCF = byYear[i].NOPAT - byYear[i].deltaNOA;
    }
  }

  const oldest = byYear[0] || {};
  const latest = byYear[byYear.length - 1] || {};
  const prev = byYear.length >= 2 ? byYear[byYear.length - 2] : latest;

  // CAGRs across the 5-year window
  const cagrs = {
    rev: calcCAGR(oldest.rev, latest.rev, periods),
    gp: calcCAGR(oldest.gp, latest.gp, periods),
    ebit: calcCAGR(oldest.ebit, latest.ebit, periods),
    ni: calcCAGR(oldest.ni, latest.ni, periods),
    ocf: calcCAGR(oldest.ocf, latest.ocf, periods),
    fcf: calcCAGR(oldest.fcf, latest.fcf, periods),
    ta: calcCAGR(oldest.ta, latest.ta, periods),
    NOA: calcCAGR(oldest.NOA, latest.NOA, periods)
  };

  // Automated Executive Red Flags & Diagnostic Engine
  const flags = [];
  let healthPoints = 0;
  let maxPoints = 0;

  // 1. Operating Profitability (RNOA vs WACC hurdle ~9%)
  maxPoints += 20;
  if (latest.RNOA >= 0.18) {
    healthPoints += 20;
    flags.push({
      severity: 'positive',
      title: `High Operating Return on Net Operating Assets (RNOA = ${(latest.RNOA * 100).toFixed(1)}%)`,
      detail: `Core operations generate ${(latest.RNOA * 100).toFixed(1)}% after-tax return on net operating capital—well above typical cost of capital (~8–10%), indicating durable economic moat and positive Economic Value Added (EVA).`,
      concept: 'roe-decomposition'
    });
  } else if (latest.RNOA >= 0.09) {
    healthPoints += 14;
    flags.push({
      severity: 'positive',
      title: `Solid Operating Return (RNOA = ${(latest.RNOA * 100).toFixed(1)}%)`,
      detail: `Operating return clears standard cost-of-capital hurdles, driven by ${(latest.OPM * 100).toFixed(1)}% NOPAT margin and ${latest.NOAT.toFixed(2)}x NOA turnover.`,
      concept: 'roe-decomposition'
    });
  } else {
    healthPoints += 5;
    flags.push({
      severity: 'warning',
      title: `Compressed Operating Return (RNOA = ${(latest.RNOA * 100).toFixed(1)}%)`,
      detail: `RNOA is near or below typical WACC hurdles. Growth in NOA without margin expansion risks destroying shareholder value.`,
      concept: 'residual-income'
    });
  }

  // 2. Earnings Quality & Sloan Accrual Anomaly
  maxPoints += 20;
  if (latest.sloanAccrualRatio > 0.05 || (latest.ni > 0 && latest.ocf < latest.ni * 0.75)) {
    healthPoints += 6;
    flags.push({
      severity: 'danger',
      title: `Elevated Accounting Accruals (Sloan Ratio = ${(latest.sloanAccrualRatio * 100).toFixed(1)}%, OCF/NI = ${latest.ocfToNi.toFixed(2)}x)`,
      detail: `GAAP Net Income exceeds Operating Cash Flow or relies heavily on non-cash working capital accruals. Under Sloan's (1996) accrual anomaly, high-accrual firms experience lower future earnings persistence.`,
      concept: 'accrual-quality'
    });
  } else {
    healthPoints += 20;
    flags.push({
      severity: 'positive',
      title: `High Cash Earnings Quality (Sloan Accrual Ratio = ${(latest.sloanAccrualRatio * 100).toFixed(1)}%)`,
      detail: `Operating Cash Flow ($${fmtMoney(latest.ocf)}) strongly backs reported Net Income ($${fmtMoney(latest.ni)}), signaling conservative revenue recognition and strong cash conversion.`,
      concept: 'accrual-quality'
    });
  }

  // 3. Stock-Based Compensation (SBC) Dilution Check
  maxPoints += 15;
  if (latest.sbcPctRev > 0.08) {
    healthPoints += 4;
    flags.push({
      severity: 'danger',
      title: `Heavy Stock-Based Compensation Dilution (SBC = ${(latest.sbcPctRev * 100).toFixed(1)}% of Revenue)`,
      detail: `SBC ($${fmtMoney(latest.sbc)}) consumes ${(latest.sbc / Math.max(1, latest.ocf) * 100).toFixed(0)}% of Operating Cash Flow. Treating SBC as a real economic expense reduces Operating Margin to ${(latest.sbcAdjustedOpMargin * 100).toFixed(1)}%.`,
      concept: 'stock-comp'
    });
  } else if (latest.sbcPctRev > 0.04) {
    healthPoints += 10;
    flags.push({
      severity: 'warning',
      title: `Moderate Stock-Based Compensation (${(latest.sbcPctRev * 100).toFixed(1)}% of Revenue)`,
      detail: `Equity compensation ($${fmtMoney(latest.sbc)}) represents a meaningful recurring claim on equity value; ensure DCF models deduct SBC rather than adding it back unadjusted.`,
      concept: 'stock-comp'
    });
  } else {
    healthPoints += 15;
  }

  // 4. Solvency, Interest Coverage & Financial Leverage
  maxPoints += 20;
  if (latest.interestCoverage < 3.0 || latest.netDebtToEbitda > 3.5) {
    healthPoints += 7;
    flags.push({
      severity: 'danger',
      title: `Elevated Leverage / Tight Coverage (Net Debt/EBITDA = ${latest.netDebtToEbitda.toFixed(2)}x, EBIT/Int = ${latest.interestCoverage.toFixed(1)}x)`,
      detail: `Net Financial Obligations ($${fmtMoney(latest.NFO)}) create significant fixed financial burden. Rising refinancing rates could compress Net Income via higher NFE.`,
      concept: 'capital-structure'
    });
  } else if (latest.NFO <= 0) {
    healthPoints += 20;
    flags.push({
      severity: 'positive',
      title: `Net Cash Fortress (NFO = $${fmtMoney(latest.NFO)})`,
      detail: `Financial Assets ($${fmtMoney(latest.FA)}) exceed total debt ($${fmtMoney(latest.FO)}), giving the firm negative Net Financial Obligations and strategic flexibility.`,
      concept: 'reformulated-bs'
    });
  } else {
    healthPoints += 16;
    flags.push({
      severity: 'positive',
      title: `Prudent Debt Coverage (EBIT / Interest = ${latest.interestCoverage.toFixed(1)}x, Net Debt / EBITDA = ${latest.netDebtToEbitda.toFixed(2)}x)`,
      detail: `Positive operating spread (RNOA - NBC = ${(latest.SPREAD * 100).toFixed(1)}%) allows financial leverage to accretively amplify ROE.`,
      concept: 'tax-shield'
    });
  }

  // 5. Working Capital & Cash Conversion Cycle Efficiency
  maxPoints += 15;
  const arGrowth = prev.ar > 0 ? (latest.ar - prev.ar) / prev.ar : 0;
  const revGrowth = prev.rev > 0 ? (latest.rev - prev.rev) / prev.rev : 0;
  if (arGrowth - revGrowth > 0.08) {
    healthPoints += 6;
    flags.push({
      severity: 'warning',
      title: `Receivables Growing Faster Than Revenue (+${(arGrowth * 100).toFixed(1)}% vs +${(revGrowth * 100).toFixed(1)}%)`,
      detail: `DSO expanded to ${latest.dso.toFixed(1)} days. When Accounts Receivable outpaces revenue growth, inspect 10-K footnotes for extended customer credit terms or channel stuffing.`,
      concept: 'revenue-recognition'
    });
  } else if (latest.ccc <= 15) {
    healthPoints += 15;
    flags.push({
      severity: 'positive',
      title: `Negative / Ultra-Fast Cash Conversion Cycle (CCC = ${latest.ccc.toFixed(1)} days)`,
      detail: `Supplier trade credit (DPO = ${latest.dpo.toFixed(0)}d) finances working capital (DSO = ${latest.dso.toFixed(0)}d, DIO = ${latest.dio.toFixed(0)}d), keeping WCR/Sales at ${(latest.wcrToSales * 100).toFixed(1)}%.`,
      concept: 'working-capital'
    });
  } else {
    healthPoints += 12;
  }

  // 6. Goodwill & Intangible Asset Bloat
  maxPoints += 10;
  if (latest.goodwillPctAssets > 0.30) {
    healthPoints += 4;
    flags.push({
      severity: 'warning',
      title: `High Acquisition Goodwill & Intangibles (${(latest.goodwillPctAssets * 100).toFixed(1)}% of Total Assets)`,
      detail: `Goodwill & intangibles ($${fmtMoney(latest.gwIntang)}) inflate Operating Assets (OA), depressing NOAT and creating impairment risk if acquired units underperform.`,
      concept: 'ma-mechanics'
    });
  } else {
    healthPoints += 10;
  }

  const healthScore = Math.round((healthPoints / maxPoints) * 100);
  const grade =
    healthScore >= 90 ? 'A+' :
    healthScore >= 82 ? 'A' :
    healthScore >= 75 ? 'B+' :
    healthScore >= 68 ? 'B' :
    healthScore >= 58 ? 'C+' : 'C';

  return {
    company,
    opCashPctSales,
    yearsAsc,
    byYear,
    latest,
    prev,
    oldest,
    cagrs,
    flags,
    healthScore,
    grade
  };
}

/**
 * Render the 10-K & Penman FSA Analyzer UI
 */
function render10KAnalyzer(company, opCashPct = 0.015) {
  const root = document.getElementById('wb-10k-root');
  if (!root) return;

  const model = compute10KAnalysis(company, { operatingCashPctSales: opCashPct });
  const { byYear, latest, cagrs, flags, healthScore, grade } = model;

  const scoreColor = healthScore >= 80 ? '#16a34a' : healthScore >= 65 ? '#d97706' : '#dc2626';

  const fmtCagrCell = (c) => {
    if (c === null || c === undefined || Number.isNaN(c)) return `<td class="wb-td-cagr">—</td>`;
    const cls = c >= 0 ? 'pos' : 'neg';
    return `<td class="wb-td-cagr ${cls}">${c >= 0 ? '+' : ''}${(c * 100).toFixed(1)}%</td>`;
  };

  root.innerHTML = `
    <!-- Top Executive KPI Strip -->
    <div class="wb-kpi-grid">
      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Financial Health Score</span>
          ${conceptPill('cash-flow-analysis', 'FSA')}
        </div>
        <div class="wb-kpi-card__value" style="color: ${scoreColor};">${healthScore}/100 (${grade})</div>
        <div class="wb-kpi-card__sub">${flags.filter(f => f.severity === 'positive').length} strengths · ${flags.filter(f => f.severity !== 'positive').length} watch items</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Penman RNOA (${latest.year})</span>
          ${conceptPill('roe-decomposition', 'RNOA')}
        </div>
        <div class="wb-kpi-card__value">${fmtPct(latest.RNOA)}</div>
        <div class="wb-kpi-card__sub">OPM ${fmtPct(latest.OPM)} × NOAT ${latest.NOAT.toFixed(2)}x</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Net Operating Assets (NOA)</span>
          ${conceptPill('reformulated-bs', 'NOA')}
        </div>
        <div class="wb-kpi-card__value">${fmtMoney(latest.NOA)}</div>
        <div class="wb-kpi-card__sub">OA ${fmtMoney(latest.OA)} − OL ${fmtMoney(latest.OL)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Net Fin. Obligations (NFO)</span>
          ${conceptPill('reformulated-bs', 'NFO')}
        </div>
        <div class="wb-kpi-card__value">${fmtMoney(latest.NFO)}</div>
        <div class="wb-kpi-card__sub">${latest.NFO <= 0 ? 'Net Cash Position' : `FLEV ${latest.FLEV.toFixed(2)}x · NBC ${fmtPct(latest.NBC)}`}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Free Cash Flow (${latest.year})</span>
          ${conceptPill('fcf', 'FCF')}
        </div>
        <div class="wb-kpi-card__value">${fmtMoney(latest.fcf)}</div>
        <div class="wb-kpi-card__sub">FCF Margin ${fmtPct(latest.fcfMargin)} · OCF/NI ${latest.ocfToNi.toFixed(2)}x</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Sloan Accrual Ratio</span>
          ${conceptPill('accrual-quality', 'Accruals')}
        </div>
        <div class="wb-kpi-card__value" style="color: ${latest.sloanAccrualRatio > 0.05 ? '#dc2626' : '#16a34a'};">${fmtPct(latest.sloanAccrualRatio)}</div>
        <div class="wb-kpi-card__sub">Total Accruals ${fmtMoney(latest.totalAccruals)}</div>
      </div>
    </div>

    <!-- Sub-Navigation Tabs -->
    <div class="wb-tabs" role="tablist">
      <button class="wb-tab active" data-tab="penman">1. Penman Reformulation &amp; ROE</button>
      <button class="wb-tab" data-tab="statements">2. 5-Year 10-K Statements &amp; CAGR</button>
      <button class="wb-tab" data-tab="ratios">3. Executive Ratio Suite &amp; Working Capital</button>
      <button class="wb-tab" data-tab="diagnostics">4. Red Flags &amp; Earnings Quality (${flags.length})</button>
    </div>

    <!-- TAB 1: PENMAN REFORMULATION & DUAL ROE DECOMPOSITION -->
    <div id="tab-penman" class="wb-tab-pane">
      <div class="wb-grid-2">
        <!-- Penman ROE Bridge Card -->
        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Penman Operating vs. Financing ROE Decomposition (${latest.year})</h3>
              <div class="wb-panel__subtitle">ROE = RNOA + FLEV × (RNOA − NBC) &nbsp;·&nbsp; Separates core operating return from debt leverage</div>
            </div>
            ${conceptPill('roe-decomposition', 'Penman ROE')}
          </div>
          <div class="wb-panel__body">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
              <label for="op-cash-slider" style="font-size: 0.78rem; font-weight: 700; color: #334155;">
                Operating Cash Assumption (% of Revenue): <span id="op-cash-val" style="color: #1e40af; font-family: var(--font-mono);">${(opCashPct * 100).toFixed(1)}%</span>
              </label>
              <input id="op-cash-slider" type="range" min="0" max="0.10" step="0.005" value="${opCashPct}" style="width: 180px;" />
            </div>

            <div class="wb-formula-breakdown" style="margin-top: 0;">
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Operating Margin (OPM)</div>
                <div class="wb-formula-box__val">${fmtPct(latest.OPM)}</div>
                <div style="font-size:0.68rem; color:#64748b;">NOPAT / Sales</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">NOA Turnover (NOAT)</div>
                <div class="wb-formula-box__val">${latest.NOAT.toFixed(2)}x</div>
                <div style="font-size:0.68rem; color:#64748b;">Sales / NOA</div>
              </div>
              <div class="wb-formula-op">=</div>
              <div class="wb-formula-box" style="border-color:#93c5fd; background:#eff6ff;">
                <div class="wb-formula-box__label">Operating Return (RNOA)</div>
                <div class="wb-formula-box__val" style="color:#1e40af;">${fmtPct(latest.RNOA)}</div>
                <div style="font-size:0.68rem; color:#1e40af;">NOPAT / NOA</div>
              </div>
            </div>

            <div class="wb-formula-breakdown" style="margin-top: 0.75rem;">
              <div class="wb-formula-box" style="border-color:#93c5fd; background:#eff6ff;">
                <div class="wb-formula-box__label">RNOA</div>
                <div class="wb-formula-box__val" style="color:#1e40af;">${fmtPct(latest.RNOA)}</div>
              </div>
              <div class="wb-formula-op">+</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">FLEV (NFO/CSE)</div>
                <div class="wb-formula-box__val">${latest.FLEV.toFixed(2)}x</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">SPREAD (RNOA − NBC)</div>
                <div class="wb-formula-box__val">${fmtPct(latest.SPREAD)}</div>
              </div>
              <div class="wb-formula-op">=</div>
              <div class="wb-formula-box" style="border-color:#86efac; background:#f0fdf4;">
                <div class="wb-formula-box__label">Return on Equity (ROE)</div>
                <div class="wb-formula-box__val" style="color:#15803d;">${fmtPct(latest.ROE)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hawawini & Viallet 5-Factor DuPont Card -->
        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Hawawini &amp; Viallet 5-Factor DuPont Decomposition (${latest.year})</h3>
              <div class="wb-panel__subtitle">ROE = EBIT/Sales × Sales/Assets × EBT/EBIT × NI/EBT × Assets/Equity</div>
            </div>
            ${conceptPill('dupont', '5-Factor DuPont')}
          </div>
          <div class="wb-panel__body">
            <div class="wb-formula-breakdown" style="margin-top: 0;">
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">EBIT Margin</div>
                <div class="wb-formula-box__val">${fmtPct(latest.ebitMargin)}</div>
                <div style="font-size:0.68rem; color:#64748b;">EBIT / Sales</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Asset Turnover</div>
                <div class="wb-formula-box__val">${latest.assetTurnover.toFixed(2)}x</div>
                <div style="font-size:0.68rem; color:#64748b;">Sales / Assets</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Interest Burden</div>
                <div class="wb-formula-box__val">${fmtPct(latest.interestBurden)}</div>
                <div style="font-size:0.68rem; color:#64748b;">EBT / EBIT</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Tax Burden</div>
                <div class="wb-formula-box__val">${fmtPct(latest.taxBurden)}</div>
                <div style="font-size:0.68rem; color:#64748b;">NI / EBT</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Equity Mult.</div>
                <div class="wb-formula-box__val">${latest.equityMultiplier.toFixed(2)}x</div>
                <div style="font-size:0.68rem; color:#64748b;">Assets / Equity</div>
              </div>
            </div>

            <div style="margin-top: 1rem; padding: 0.85rem 1rem; background: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0; font-size: 0.8rem; color: #334155; line-height: 1.5;">
              <strong>Why Compare Penman vs. Traditional DuPont?</strong><br/>
              Traditional DuPont mixes excess cash into Total Assets (depressing Asset Turnover) and lumps non-interest-bearing trade payables (<code>AP</code>) with interest-bearing debt inside the Equity Multiplier. Penman's reformulation isolates <strong>Operating Assets (OA)</strong> and nets out free <strong>Operating Liabilities (OL)</strong> to reveal true operating productivity (<strong>RNOA = ${fmtPct(latest.RNOA)}</strong> vs. traditional ROA = <strong>${fmtPct(latest.roa)}</strong>).
            </div>
          </div>
        </div>
      </div>

      <!-- 5-Year Penman Reformulated Balance Sheet & Income Statement Table -->
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">5-Year Penman Reformulated Balance Sheet &amp; Income Statement ($ Millions)</h3>
            <div class="wb-panel__subtitle">Identity Check: NOA (OA − OL) − NFO (FO − FA) = Common Stockholders' Equity (CSE) &nbsp;|&nbsp; OI (NOPAT) − NFE = Net Income</div>
          </div>
          <div style="display:flex; gap:0.4rem;">
            ${conceptPill('reformulated-bs', 'Reformulated BS')}
            ${conceptPill('reformulated-is', 'Reformulated IS')}
          </div>
        </div>
        <div class="wb-table-wrap">
          <table class="wb-table">
            <thead>
              <tr>
                <th>Reformulated Line Item ($M)</th>
                <th>Concept</th>
                ${byYear.map(y => `<th>FY ${y.year}</th>`).join('')}
                <th>5Y CAGR</th>
              </tr>
            </thead>
            <tbody>
              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Reformulated Balance Sheet (NOA − NFO = CSE)</td></tr>
              <tr>
                <td>Operating Assets (OA = Total Assets − FA)</td>
                <td>${conceptPill('reformulated-bs', 'OA')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.OA)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.OA, latest.OA, byYear.length - 1))}
              </tr>
              <tr>
                <td>Less: Operating Liabilities (OL = Total Liab. − Debt)</td>
                <td>${conceptPill('reformulated-bs', 'OL')}</td>
                ${byYear.map(y => `<td>(${fmtMoney(y.OL)})</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.OL, latest.OL, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Net Operating Assets (NOA = OA − OL)</td>
                <td>${conceptPill('reformulated-bs', 'NOA')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NOA)}</td>`).join('')}
                ${fmtCagrCell(cagrs.NOA)}
              </tr>
              <tr>
                <td>Financial Obligations (FO = Short + Long-Term Debt)</td>
                <td>${conceptPill('reformulated-bs', 'FO')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.FO)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.FO, latest.FO, byYear.length - 1))}
              </tr>
              <tr>
                <td>Less: Financial Assets (FA = Excess Cash &amp; ST Inv.)</td>
                <td>${conceptPill('reformulated-bs', 'FA')}</td>
                ${byYear.map(y => `<td>(${fmtMoney(y.FA)})</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.FA, latest.FA, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Net Financial Obligations (NFO = FO − FA)</td>
                <td>${conceptPill('reformulated-bs', 'NFO')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NFO)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Common Stockholders' Equity (CSE = NOA − NFO)</td>
                <td>${conceptPill('reformulated-bs', 'CSE')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cse)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cse, latest.cse, byYear.length - 1))}
              </tr>

              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Reformulated Income Statement &amp; Penman Ratios</td></tr>
              <tr>
                <td>Operating Income before Tax (EBIT)</td>
                <td>${conceptPill('reformulated-is', 'EBIT')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ebit)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ebit)}
              </tr>
              <tr>
                <td>Effective Tax Rate (τ) &amp; Interest Tax Shield (Int × τ)</td>
                <td>${conceptPill('tax-shield', 'Tax Shield')}</td>
                ${byYear.map(y => `<td>${(y.effectiveTaxRate * 100).toFixed(1)}% / ${fmtMoney(y.taxShield)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>NOPAT / Operating Income After Tax (OI)</td>
                <td>${conceptPill('reformulated-is', 'NOPAT')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NOPAT)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.NOPAT, latest.NOPAT, byYear.length - 1))}
              </tr>
              <tr>
                <td>Less: Net Financial Expense After Tax (NFE)</td>
                <td>${conceptPill('reformulated-is', 'NFE')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NFE)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Net Income to Common (NI = OI − NFE)</td>
                <td>${conceptPill('reformulated-is', 'NI')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ni)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ni)}
              </tr>
              <tr>
                <td>Operating Profit Margin (OPM = OI / Sales)</td>
                <td>${conceptPill('roe-decomposition', 'OPM')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.OPM)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Net Operating Asset Turnover (NOAT = Sales / NOA)</td>
                <td>${conceptPill('roe-decomposition', 'NOAT')}</td>
                ${byYear.map(y => `<td>${y.NOAT.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Return on Net Operating Assets (RNOA = OPM × NOAT)</td>
                <td>${conceptPill('roe-decomposition', 'RNOA')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.RNOA)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Financial Leverage (FLEV = NFO / CSE)</td>
                <td>${conceptPill('roe-decomposition', 'FLEV')}</td>
                ${byYear.map(y => `<td>${y.FLEV.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Operating Spread (SPREAD = RNOA − NBC)</td>
                <td>${conceptPill('roe-decomposition', 'SPREAD')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.SPREAD)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Return on Common Equity (ROE = RNOA + FLEV × SPREAD)</td>
                <td>${conceptPill('roe-decomposition', 'ROE')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ROE)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: 5-YEAR REPORTED 10-K STATEMENTS & CAGR -->
    <div id="tab-statements" class="wb-tab-pane" style="display:none;">
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">5-Year Reported 10-K Financial Statements ($ Millions)</h3>
            <div class="wb-panel__subtitle">Standardized GAAP Income Statement, Balance Sheet &amp; Cash Flow Statement with 5-Year CAGR</div>
          </div>
          ${conceptPill('cash-flow-analysis', '10-K Statements')}
        </div>
        <div class="wb-table-wrap">
          <table class="wb-table">
            <thead>
              <tr>
                <th>10-K Line Item ($ Millions)</th>
                <th>Concept</th>
                ${byYear.map(y => `<th>FY ${y.year}</th>`).join('')}
                <th>5Y CAGR</th>
              </tr>
            </thead>
            <tbody>
              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Income Statement</td></tr>
              <tr class="wb-row-total">
                <td>Revenue / Net Sales</td>
                <td>${conceptPill('revenue-recognition', 'Revenue')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.rev)}</td>`).join('')}
                ${fmtCagrCell(cagrs.rev)}
              </tr>
              <tr>
                <td>Cost of Goods Sold (COGS)</td>
                <td>${conceptPill('reformulated-is', 'COGS')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cogs)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cogs, latest.cogs, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Gross Profit</td>
                <td>${conceptPill('reformulated-is', 'Gross Profit')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.gp)}</td>`).join('')}
                ${fmtCagrCell(cagrs.gp)}
              </tr>
              <tr>
                <td>Research &amp; Development (R&amp;D)</td>
                <td>${conceptPill('reformulated-is', 'R&D')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.rd)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.rd, latest.rd, byYear.length - 1))}
              </tr>
              <tr>
                <td>Selling, General &amp; Administrative (SG&amp;A)</td>
                <td>${conceptPill('reformulated-is', 'SG&A')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.sga)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.sga, latest.sga, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Operating Income (EBIT)</td>
                <td>${conceptPill('reformulated-is', 'EBIT')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ebit)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ebit)}
              </tr>
              <tr>
                <td>Interest Expense</td>
                <td>${conceptPill('cost-of-debt', 'Interest')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.intExp)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Income Tax Expense</td>
                <td>${conceptPill('deferred-tax-fsa', 'Taxes')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.taxExp)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>GAAP Net Income</td>
                <td>${conceptPill('reformulated-is', 'Net Income')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ni)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ni)}
              </tr>
              <tr>
                <td>Diluted EPS ($/share)</td>
                <td>${conceptPill('multiples', 'EPS')}</td>
                ${byYear.map(y => `<td>$${y.epsDiluted.toFixed(2)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.epsDiluted, latest.epsDiluted, byYear.length - 1))}
              </tr>

              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Balance Sheet Summary</td></tr>
              <tr>
                <td>Cash &amp; Short-Term Investments</td>
                <td>${conceptPill('working-capital', 'Liquidity')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.totalCash)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.totalCash, latest.totalCash, byYear.length - 1))}
              </tr>
              <tr>
                <td>Accounts Receivable</td>
                <td>${conceptPill('working-capital', 'AR')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ar)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ar, latest.ar, byYear.length - 1))}
              </tr>
              <tr>
                <td>Inventory</td>
                <td>${conceptPill('working-capital', 'Inventory')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.inv)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.inv, latest.inv, byYear.length - 1))}
              </tr>
              <tr>
                <td>Net Property, Plant &amp; Equipment (PP&amp;E)</td>
                <td>${conceptPill('capital-budgeting', 'PP&E')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ppe)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ppe, latest.ppe, byYear.length - 1))}
              </tr>
              <tr>
                <td>Goodwill &amp; Intangible Assets</td>
                <td>${conceptPill('ma-mechanics', 'Goodwill')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.gwIntang)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Total Assets</td>
                <td>${conceptPill('reformulated-bs', 'Assets')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ta)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ta)}
              </tr>
              <tr>
                <td>Total Debt (Short-Term + Long-Term)</td>
                <td>${conceptPill('capital-structure', 'Debt')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.FO)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.FO, latest.FO, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Stockholders' Equity</td>
                <td>${conceptPill('reformulated-bs', 'Equity')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cse)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cse, latest.cse, byYear.length - 1))}
              </tr>

              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Cash Flow Statement &amp; Capital Allocation</td></tr>
              <tr class="wb-row-total">
                <td>Operating Cash Flow (OCF)</td>
                <td>${conceptPill('cash-flow-analysis', 'OCF')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ocf)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ocf)}
              </tr>
              <tr>
                <td>Capital Expenditures (CapEx)</td>
                <td>${conceptPill('capital-budgeting', 'CapEx')}</td>
                ${byYear.map(y => `<td>(${fmtMoney(y.capex)})</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.capex, latest.capex, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Free Cash Flow (FCF = OCF − CapEx)</td>
                <td>${conceptPill('fcf', 'FCF')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.fcf)}</td>`).join('')}
                ${fmtCagrCell(cagrs.fcf)}
              </tr>
              <tr>
                <td>Stock-Based Compensation (SBC)</td>
                <td>${conceptPill('stock-comp', 'SBC')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.sbc)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.sbc, latest.sbc, byYear.length - 1))}
              </tr>
              <tr>
                <td>Dividends + Share Repurchases</td>
                <td>${conceptPill('dividend-policy', 'Payouts')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.divs + y.buybacks)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: EXECUTIVE RATIO SUITE & WORKING CAPITAL -->
    <div id="tab-ratios" class="wb-tab-pane" style="display:none;">
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">5-Year Executive Financial Ratio Suite &amp; Working Capital Structure</h3>
            <div class="wb-panel__subtitle">Profitability, Hawawini Working Capital Requirement (WCR), Cash Conversion Cycle, Liquidity &amp; Coverage</div>
          </div>
          ${conceptPill('working-capital', 'WCR & Ratios')}
        </div>
        <div class="wb-table-wrap">
          <table class="wb-table">
            <thead>
              <tr>
                <th>Financial Metric / Ratio</th>
                <th>Concept Link</th>
                ${byYear.map(y => `<th>FY ${y.year}</th>`).join('')}
                <th>5Y Delta</th>
              </tr>
            </thead>
            <tbody>
              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Profitability &amp; SBC-Adjusted Margins</td></tr>
              <tr>
                <td>Gross Profit Margin</td>
                <td>${conceptPill('reformulated-is', 'Gross Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.grossMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${((latest.grossMargin - byYear[0].grossMargin) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>GAAP Operating Margin (EBIT / Sales)</td>
                <td>${conceptPill('dupont', 'EBIT Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ebitMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${((latest.ebitMargin - byYear[0].ebitMargin) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>SBC-Adjusted Operating Margin ((EBIT − SBC) / Sales)</td>
                <td>${conceptPill('stock-comp', 'SBC Burden')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.sbcAdjustedOpMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${((latest.sbcAdjustedOpMargin - byYear[0].sbcAdjustedOpMargin) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Net Profit Margin (NI / Sales)</td>
                <td>${conceptPill('dupont', 'Net Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.netMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${((latest.netMargin - byYear[0].netMargin) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Free Cash Flow Margin (FCF / Sales)</td>
                <td>${conceptPill('fcf', 'FCF Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.fcfMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${((latest.fcfMargin - byYear[0].fcfMargin) * 100).toFixed(1)}%</td>
              </tr>

              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Working Capital Requirement (WCR) &amp; Cash Conversion Cycle</td></tr>
              <tr>
                <td>Working Capital Requirement (WCR = AR + Inv − AP)</td>
                <td>${conceptPill('working-capital', 'WCR')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.wcr)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>WCR Intensity (WCR / Sales)</td>
                <td>${conceptPill('working-capital', 'WCR/Sales')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.wcrToSales)}</td>`).join('')}
                <td class="wb-td-cagr">${((latest.wcrToSales - byYear[0].wcrToSales) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Days Sales Outstanding (DSO)</td>
                <td>${conceptPill('working-capital', 'DSO')}</td>
                ${byYear.map(y => `<td>${y.dso.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${(latest.dso - byYear[0].dso).toFixed(1)}d</td>
              </tr>
              <tr>
                <td>Days Inventory Outstanding (DIO)</td>
                <td>${conceptPill('working-capital', 'DIO')}</td>
                ${byYear.map(y => `<td>${y.dio.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${(latest.dio - byYear[0].dio).toFixed(1)}d</td>
              </tr>
              <tr>
                <td>Days Payable Outstanding (DPO)</td>
                <td>${conceptPill('working-capital', 'DPO')}</td>
                ${byYear.map(y => `<td>${y.dpo.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${(latest.dpo - byYear[0].dpo).toFixed(1)}d</td>
              </tr>
              <tr class="wb-row-total">
                <td>Cash Conversion Cycle (CCC = DSO + DIO − DPO)</td>
                <td>${conceptPill('working-capital', 'CCC')}</td>
                ${byYear.map(y => `<td>${y.ccc.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${(latest.ccc - byYear[0].ccc).toFixed(1)}d</td>
              </tr>

              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Liquidity, Solvency &amp; Earnings Quality</td></tr>
              <tr>
                <td>Current Ratio (CA / CL)</td>
                <td>${conceptPill('working-capital', 'Liquidity')}</td>
                ${byYear.map(y => `<td>${y.currentRatio.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">${(latest.currentRatio - byYear[0].currentRatio).toFixed(2)}x</td>
              </tr>
              <tr>
                <td>Quick Ratio ((Cash + AR) / CL)</td>
                <td>${conceptPill('working-capital', 'Quick Ratio')}</td>
                ${byYear.map(y => `<td>${y.quickRatio.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">${(latest.quickRatio - byYear[0].quickRatio).toFixed(2)}x</td>
              </tr>
              <tr>
                <td>Net Debt / EBITDA (NFO / EBITDA)</td>
                <td>${conceptPill('capital-structure', 'Net Debt/EBITDA')}</td>
                ${byYear.map(y => `<td>${y.netDebtToEbitda.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">${(latest.netDebtToEbitda - byYear[0].netDebtToEbitda).toFixed(2)}x</td>
              </tr>
              <tr>
                <td>Interest Coverage (EBIT / Interest Expense)</td>
                <td>${conceptPill('credit-spreads', 'Coverage')}</td>
                ${byYear.map(y => `<td>${y.interestCoverage.toFixed(1)}x</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Cash Conversion Ratio (OCF / Net Income)</td>
                <td>${conceptPill('cash-flow-analysis', 'OCF/NI')}</td>
                ${byYear.map(y => `<td>${y.ocfToNi.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">${(latest.ocfToNi - byYear[0].ocfToNi).toFixed(2)}x</td>
              </tr>
              <tr class="wb-row-total">
                <td>Sloan Accrual Ratio ((NI − OCF) / OA)</td>
                <td>${conceptPill('accrual-quality', 'Sloan Ratio')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.sloanAccrualRatio)}</td>`).join('')}
                <td class="wb-td-cagr">${((latest.sloanAccrualRatio - byYear[0].sloanAccrualRatio) * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: AUTOMATED EXECUTIVE RED FLAGS & EARNINGS QUALITY -->
    <div id="tab-diagnostics" class="wb-tab-pane" style="display:none;">
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">Automated Executive Red Flags &amp; Accounting Quality Audit (${company.ticker})</h3>
            <div class="wb-panel__subtitle">Composite Health Score: ${healthScore}/100 (Grade ${grade}) — Evaluates Penman RNOA, Sloan Accruals, SBC Dilution, Coverage &amp; WCR</div>
          </div>
          ${conceptPill('accrual-quality', 'Forensic FSA')}
        </div>
        <div class="wb-panel__body">
          <div class="wb-flag-list">
            ${flags.map(f => `
              <div class="wb-flag wb-flag--${f.severity}">
                <div style="font-size: 1.25rem; line-height: 1;">
                  ${f.severity === 'positive' ? '✅' : f.severity === 'warning' ? '⚠️' : '🚨'}
                </div>
                <div style="flex: 1;">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                    <div class="wb-flag__title">${f.title}</div>
                    ${conceptPill(f.concept, 'Review Concept')}
                  </div>
                  <div class="wb-flag__desc">${f.detail}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire Tab Switching
  const tabs = root.querySelectorAll('.wb-tab');
  const panes = {
    penman: root.querySelector('#tab-penman'),
    statements: root.querySelector('#tab-statements'),
    ratios: root.querySelector('#tab-ratios'),
    diagnostics: root.querySelector('#tab-diagnostics')
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

  // Wire Operating Cash % Slider
  const slider = root.querySelector('#op-cash-slider');
  if (slider) {
    slider.addEventListener('change', (e) => {
      render10KAnalyzer(company, parseFloat(e.target.value));
    });
    slider.addEventListener('input', (e) => {
      const label = root.querySelector('#op-cash-val');
      if (label) label.textContent = `${(parseFloat(e.target.value) * 100).toFixed(1)}%`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const bannerEl = document.getElementById('analyze-target-banner');
  const rootEl = document.getElementById('wb-10k-root');
  if (!rootEl) return;

  if (bannerEl) {
    mountTargetBanner(bannerEl, (company) => {
      render10KAnalyzer(company, 0.015);
    });
  }
  render10KAnalyzer(getActiveCompany(), 0.015);
});
