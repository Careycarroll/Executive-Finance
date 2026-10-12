/**
 * js/analyze/deal-workbench.js
 * Workbench 3: Executive Deal & Capital Allocation Workbench
 *
 * Implements 3 integrated executive capital allocation models seeded from the active company:
 * 1. M&A Accretion/Dilution, Synergy Break-Even & Section 338(h)(10) / 197 Tax Step-Up Shield
 * 2. 5-Year Leveraged Buyout (LBO) Debt Sweep, Value Attribution Bridge & 2-and-20 GP/LP Waterfall
 * 3. Strategic CapEx Budgeting (NPV, IRR, MIRR, PI, EVA) + Real Options (Expanded Strategic NPV)
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
import { computeStockValuation } from './stock-valuator.js';

/**
 * Normal CDF helper for Black-Scholes Real Option valuation
 */
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
 * 1. Pure M&A Accretion / Dilution & Section 338(h)(10) Tax Step-Up Engine
 */
export function computeMAAnalysis(company, overrides = {}) {
  const fsa = compute10KAnalysis(company);
  const latest = fsa.latest;

  // Allow active company to be modeled as Acquirer buying a Bolt-On Target (default 20% size of Acquirer)
  // OR as Target being acquired by a Strategic Buyer (1.8x size)
  const role = overrides.role || 'acquirer'; // 'acquirer' | 'target'
  const offerPremiumPct = overrides.offerPremiumPct ?? 0.25;
  const stockMixPct = overrides.stockMixPct ?? 0.50; // 50% stock, 50% cash/debt
  const cashMixPct = 1 - stockMixPct;
  const acqDebtRate = overrides.acqDebtRate ?? 0.055;
  const taxRate = overrides.taxRate ?? latest.effectiveTaxRate ?? 0.21;
  const elect338h10 = overrides.elect338h10 ?? true;

  let acq, tgt;
  if (role === 'acquirer') {
    const acqShares = Math.max(1, latest.sharesDiluted);
    const acqPrice = company.price || 100;
    const acqMktCap = acqPrice * acqShares;
    const acqNI = Math.max(50, latest.ni);
    acq = {
      name: `${company.name} (${company.ticker})`,
      rev: latest.rev,
      ebitda: latest.ebitda,
      ni: acqNI,
      shares: acqShares,
      price: acqPrice,
      mktCap: acqMktCap,
      eps: acqNI / acqShares,
      pe: acqMktCap / acqNI
    };
    // Strategic Bolt-On Target (~20% of Acquirer revenue, slightly lower P/E)
    const scale = overrides.targetScale ?? 0.20;
    const tgtMktCap = acqMktCap * scale * 0.85;
    const tgtNI = Math.max(10, acqNI * scale * 0.90);
    const tgtShares = 200;
    tgt = {
      name: 'Strategic Target Co.',
      rev: latest.rev * scale,
      ebitda: latest.ebitda * scale,
      ni: tgtNI,
      shares: tgtShares,
      price: tgtMktCap / tgtShares,
      mktCap: tgtMktCap,
      eps: tgtNI / tgtShares,
      pe: tgtMktCap / tgtNI,
      bookEquity: Math.max(50, latest.cse * scale),
      netDebt: Math.max(0, latest.NFO * scale)
    };
  } else {
    const tgtShares = Math.max(1, latest.sharesDiluted);
    const tgtPrice = company.price || 100;
    const tgtMktCap = tgtPrice * tgtShares;
    const tgtNI = Math.max(10, latest.ni);
    tgt = {
      name: `${company.name} (${company.ticker})`,
      rev: latest.rev,
      ebitda: latest.ebitda,
      ni: tgtNI,
      shares: tgtShares,
      price: tgtPrice,
      mktCap: tgtMktCap,
      eps: tgtNI / tgtShares,
      pe: tgtMktCap / tgtNI,
      bookEquity: Math.max(50, latest.cse),
      netDebt: latest.NFO
    };
    const acqMktCap = tgtMktCap * 2.2;
    const acqNI = tgtNI * 2.0;
    const acqShares = 1000;
    acq = {
      name: 'Strategic Acquirer Corp.',
      rev: latest.rev * 2.0,
      ebitda: latest.ebitda * 2.1,
      ni: acqNI,
      shares: acqShares,
      price: acqMktCap / acqShares,
      mktCap: acqMktCap,
      eps: acqNI / acqShares,
      pe: acqMktCap / acqNI
    };
  }

  // Deal Pricing
  const offerEquityValue = tgt.mktCap * (1 + offerPremiumPct);
  const enterpriseDealValue = offerEquityValue + Math.max(0, tgt.netDebt);
  const impliedDealEvEbitda = tgt.ebitda > 0 ? enterpriseDealValue / tgt.ebitda : 14;
  const impliedDealPE = tgt.ni > 0 ? offerEquityValue / tgt.ni : 22;

  const stockConsideration = offerEquityValue * stockMixPct;
  const cashConsideration = offerEquityValue * cashMixPct;
  const newSharesIssued = acq.price > 0 ? stockConsideration / acq.price : 0;
  const proFormaShares = acq.shares + newSharesIssued;
  const targetOwnershipPct = proFormaShares > 0 ? newSharesIssued / proFormaShares : 0;

  // Synergies & Financing Costs
  const defaultSynergies = (acq.rev + tgt.rev) * 0.015;
  const synergiesPreTax = overrides.synergiesPreTax ?? defaultSynergies;
  const afterTaxSynergies = synergiesPreTax * (1 - taxRate);
  const preTaxDebtCost = cashConsideration * acqDebtRate;
  const afterTaxDebtCost = preTaxDebtCost * (1 - taxRate);

  // Purchase Price Allocation & Section 338(h)(10) / 197 Tax Step-Up
  const excessPurchasePrice = Math.max(0, offerEquityValue - tgt.bookEquity);
  // Assume 35% of excess purchase price is allocated to identifiable finite-lived intangibles (amortized over 10 yrs for GAAP)
  const finiteIntangiblesCreated = excessPurchasePrice * 0.35;
  const goodwillCreated = excessPurchasePrice * 0.65;
  const annualGaapAmortPreTax = finiteIntangiblesCreated / 10;
  const annualGaapAmortAfterTax = annualGaapAmortPreTax * (1 - taxRate);

  // Section 338(h)(10) / Asset Purchase Tax Step-Up (IRC Section 197: 15-year straight-line amortization of full step-up)
  const annualSec197Deduction = elect338h10 ? (excessPurchasePrice / 15) : 0;
  const annualTaxShield338 = annualSec197Deduction * taxRate;
  // PV of 15-year tax shield discounted at pre-tax debt rate (or 7%)
  const discountRateShield = Math.max(0.05, acqDebtRate);
  const pvTaxShield338 = elect338h10
    ? annualTaxShield338 * ((1 - Math.pow(1 + discountRateShield, -15)) / discountRateShield)
    : 0;

  // Pro-Forma Net Income & EPS (Cash/Adjusted EPS vs GAAP EPS)
  const proFormaNetIncomeCash = acq.ni + tgt.ni + afterTaxSynergies - afterTaxDebtCost + annualTaxShield338;
  const proFormaNetIncomeGaap = proFormaNetIncomeCash - annualGaapAmortAfterTax;

  const proFormaEpsCash = proFormaNetIncomeCash / proFormaShares;
  const proFormaEpsGaap = proFormaNetIncomeGaap / proFormaShares;

  const epsAccretionDollar = proFormaEpsCash - acq.eps;
  const epsAccretionPct = acq.eps > 0 ? epsAccretionDollar / acq.eps : 0;

  // Break-Even Pre-Tax Synergies for $0.00 EPS accretion/dilution:
  // Need proFormaNetIncomeCash / proFormaShares = acq.eps
  const requiredProFormaNI = acq.eps * proFormaShares;
  const requiredAfterTaxSynergies = Math.max(0, requiredProFormaNI - (acq.ni + tgt.ni - afterTaxDebtCost + annualTaxShield338));
  const breakEvenSynergiesPreTax = requiredAfterTaxSynergies / Math.max(0.1, 1 - taxRate);

  // Value Creation (NPV of Synergies + Tax Shield vs Premium Paid)
  const premiumPaidDollars = offerEquityValue - tgt.mktCap;
  const pvSynergies = (afterTaxSynergies / 0.085); // Capitalized at ~8.5% WACC
  const netDealNPV = pvSynergies + pvTaxShield338 - premiumPaidDollars;

  return {
    role,
    acq,
    tgt,
    offerPremiumPct,
    stockMixPct,
    cashMixPct,
    acqDebtRate,
    taxRate,
    elect338h10,
    offerEquityValue,
    enterpriseDealValue,
    impliedDealEvEbitda,
    impliedDealPE,
    stockConsideration,
    cashConsideration,
    newSharesIssued,
    proFormaShares,
    targetOwnershipPct,
    synergiesPreTax,
    afterTaxSynergies,
    afterTaxDebtCost,
    excessPurchasePrice,
    goodwillCreated,
    finiteIntangiblesCreated,
    annualGaapAmortAfterTax,
    annualTaxShield338,
    pvTaxShield338,
    proFormaNetIncomeCash,
    proFormaNetIncomeGaap,
    proFormaEpsCash,
    proFormaEpsGaap,
    epsAccretionDollar,
    epsAccretionPct,
    breakEvenSynergiesPreTax,
    premiumPaidDollars,
    pvSynergies,
    netDealNPV
  };
}

/**
 * 2. Pure 5-Year Leveraged Buyout (LBO) & GP/LP Waterfall Engine
 */
export function computeLBOModel(company, overrides = {}) {
  const fsa = compute10KAnalysis(company);
  const latest = fsa.latest;

  const baseEbitda = Math.max(50, latest.ebitda);
  const entryMult = overrides.entryMult ?? 11.0;
  const debtToEbitda = overrides.debtToEbitda ?? 5.5;
  const ebitdaGrowth = overrides.ebitdaGrowth ?? 0.08;
  const exitMult = overrides.exitMult ?? 11.5;
  const fcfConversion = overrides.fcfConversion ?? 0.65; // Pre-interest, pre-tax cash flow conversion of EBITDA
  const blendedInterestRate = overrides.interestRate ?? 0.0725;
  const taxRate = latest.effectiveTaxRate || 0.21;

  // Sources & Uses
  const entryEV = baseEbitda * entryMult;
  const txFees = entryEV * 0.015;
  const totalUses = entryEV + txFees;
  const initialDebt = baseEbitda * debtToEbitda;
  const sponsorEquity = Math.max(10, totalUses - initialDebt);
  const equityContributionPct = sponsorEquity / totalUses;

  // 5-Year Debt Sweep Schedule
  let begDebt = initialDebt;
  let currEbitda = baseEbitda;
  const schedule = [];

  for (let yr = 1; yr <= 5; yr++) {
    currEbitda = currEbitda * (1 + ebitdaGrowth);
    const interest = begDebt * blendedInterestRate;
    const da = currEbitda * 0.14;
    const ebt = Math.max(0, currEbitda - da - interest);
    const taxes = ebt * taxRate;
    const preDebtCashFlow = currEbitda * fcfConversion;
    const fcfForDebtSweep = Math.max(0, preDebtCashFlow - interest - taxes);
    const debtPaydown = Math.min(begDebt, fcfForDebtSweep);
    const endDebt = Math.max(0, begDebt - debtPaydown);
    const netLeverage = currEbitda > 0 ? endDebt / currEbitda : 0;

    schedule.push({
      year: yr,
      ebitda: currEbitda,
      begDebt,
      interest,
      taxes,
      fcfForDebtSweep,
      debtPaydown,
      endDebt,
      netLeverage
    });
    begDebt = endDebt;
  }

  const exitYear = schedule[4];
  const exitEV = exitYear.ebitda * exitMult;
  const endingDebt = exitYear.endDebt;
  const exitEquityProceeds = Math.max(0, exitEV - endingDebt);

  const grossMOIC = sponsorEquity > 0 ? exitEquityProceeds / sponsorEquity : 0;
  const grossIRR = grossMOIC > 0 ? Math.pow(grossMOIC, 1 / 5) - 1 : -1;

  // Value Creation Attribution Bridge:
  // Total Equity Gain = Exit Equity - Entry Sponsor Equity
  const totalEquityGain = Math.max(1, exitEquityProceeds - sponsorEquity);
  const gainFromEbitdaGrowth = (exitYear.ebitda - baseEbitda) * entryMult;
  const gainFromMultExpansion = (exitMult - entryMult) * exitYear.ebitda;
  const gainFromDebtPaydown = (initialDebt - endingDebt) - txFees;

  // GP / LP 2-and-20 Private Equity Waterfall
  const mgmtFeeDrag5Y = sponsorEquity * 0.02 * 5; // 2% per year for 5 years
  const netProfitBeforeCarry = Math.max(0, exitEquityProceeds - sponsorEquity - mgmtFeeDrag5Y);
  const hurdleRate = 0.08;
  const preferredReturnDollar = sponsorEquity * (Math.pow(1 + hurdleRate, 5) - 1);
  const gpCarriedInterest = netProfitBeforeCarry > preferredReturnDollar
    ? netProfitBeforeCarry * 0.20
    : 0;
  const netLpProceeds = Math.max(0, exitEquityProceeds - mgmtFeeDrag5Y - gpCarriedInterest);
  const netLpMOIC = sponsorEquity > 0 ? netLpProceeds / sponsorEquity : 0;
  const netLpIRR = netLpMOIC > 0 ? Math.pow(netLpMOIC, 1 / 5) - 1 : -1;

  return {
    baseEbitda,
    entryMult,
    debtToEbitda,
    ebitdaGrowth,
    exitMult,
    blendedInterestRate,
    entryEV,
    txFees,
    totalUses,
    initialDebt,
    sponsorEquity,
    equityContributionPct,
    schedule,
    exitEV,
    endingDebt,
    exitEquityProceeds,
    grossMOIC,
    grossIRR,
    attribution: {
      totalEquityGain,
      gainFromEbitdaGrowth,
      gainFromMultExpansion,
      gainFromDebtPaydown
    },
    waterfall: {
      mgmtFeeDrag5Y,
      preferredReturnDollar,
      gpCarriedInterest,
      netLpProceeds,
      netLpMOIC,
      netLpIRR
    }
  };
}

/**
 * 3. Pure Strategic CapEx, Hurdle Rate, MIRR & Real Options Engine
 */
export function computeCapExModel(company, overrides = {}) {
  const fsa = compute10KAnalysis(company);
  const val = computeStockValuation(company);
  const latest = fsa.latest;

  const wacc = overrides.wacc ?? val.waccInputs.wacc;
  const defaultOutlay = Math.max(50, Math.round((latest.capex || latest.NOA * 0.08 || 500) * 0.25));
  const initialOutlay = overrides.initialOutlay ?? defaultOutlay;
  const year1CF = overrides.year1CF ?? Math.round(initialOutlay * 0.26);
  const cfGrowth = overrides.cfGrowth ?? 0.08;
  const projectVol = overrides.projectVol ?? 0.35; // 35% cash flow volatility for Real Option

  // 5-Year Project Cash Flow & EVA Schedule
  let pvInflows = 0;
  let terminalValueReinvested = 0; // For MIRR (reinvested at WACC to Year 5)
  const schedule = [];
  let cumulativeDiscounted = -initialOutlay;
  let paybackYear = null;

  for (let t = 1; t <= 5; t++) {
    const cf = year1CF * Math.pow(1 + cfGrowth, t - 1) + (t === 5 ? initialOutlay * 0.15 : 0); // 15% salvage in Y5
    const df = Math.pow(1 + wacc, -t);
    const pv = cf * df;
    pvInflows += pv;
    terminalValueReinvested += cf * Math.pow(1 + wacc, 5 - t);

    const prevCum = cumulativeDiscounted;
    cumulativeDiscounted += pv;
    if (paybackYear === null && cumulativeDiscounted >= 0) {
      paybackYear = (t - 1) + Math.abs(prevCum) / pv;
    }

    // Straight-line book capital for annual project EVA
    const begBookCap = initialOutlay * (1 - (t - 1) * 0.17);
    const dep = initialOutlay * 0.17;
    const nopatProj = cf - dep;
    const capCharge = begBookCap * wacc;
    const eva = nopatProj - capCharge;

    schedule.push({
      year: t,
      cf,
      df,
      pv,
      cumulativeDiscounted,
      begBookCap,
      nopatProj,
      capCharge,
      eva
    });
  }

  const staticNPV = pvInflows - initialOutlay;
  const profitabilityIndex = initialOutlay > 0 ? pvInflows / initialOutlay : 0;

  // Solve for IRR via binary search
  let lo = -0.35, hi = 1.50;
  for (let iter = 0; iter < 35; iter++) {
    const mid = (lo + hi) / 2;
    const npvTest = schedule.reduce((acc, s) => acc + s.cf * Math.pow(1 + mid, -s.year), -initialOutlay);
    if (npvTest > 0) lo = mid;
    else hi = mid;
  }
  const irr = (lo + hi) / 2;

  // Modified IRR (MIRR): (TV of inflows reinvested at WACC / Initial Outlay)^(1/5) - 1
  const mirr = initialOutlay > 0 && terminalValueReinvested > 0
    ? Math.pow(terminalValueReinvested / initialOutlay, 1 / 5) - 1
    : 0;

  // Black-Scholes Real Option to Expand (Follow-On Phase II Expansion Option at Year 3):
  // Underlying S = 60% of PV of Phase I inflows; Strike K = 55% of Initial Outlay; T = 3 years; sigma = projectVol
  const S_opt = pvInflows * 0.65;
  const K_opt = initialOutlay * 0.60;
  const T_opt = 3.0;
  const rf = 0.042;
  const d1 = (Math.log(Math.max(1, S_opt) / Math.max(1, K_opt)) + (rf + 0.5 * projectVol * projectVol) * T_opt) / (projectVol * Math.sqrt(T_opt));
  const d2 = d1 - projectVol * Math.sqrt(T_opt);
  const realOptionExpandValue = S_opt * normCDF(d1) - K_opt * Math.exp(-rf * T_opt) * normCDF(d2);

  const expandedStrategicNPV = staticNPV + realOptionExpandValue;

  return {
    wacc,
    initialOutlay,
    year1CF,
    cfGrowth,
    projectVol,
    schedule,
    pvInflows,
    staticNPV,
    profitabilityIndex,
    irr,
    mirr,
    paybackYear: paybackYear !== null ? paybackYear : 5.8,
    realOptionExpandValue,
    expandedStrategicNPV
  };
}

// State for Deal Workbench UI
let activeDealTab = 'ma';
let dealTicker = null;
let maOverrides = {};
let lboOverrides = {};
let capexOverrides = {};

function renderDealWorkbench(company) {
  const root = document.getElementById('wb-deal-root');
  if (!root) return;

  if (dealTicker !== company.ticker) {
    dealTicker = company.ticker;
    maOverrides = {};
    lboOverrides = {};
    capexOverrides = {};
  }

  const ma = computeMAAnalysis(company, maOverrides);
  const lbo = computeLBOModel(company, lboOverrides);
  const capex = computeCapExModel(company, capexOverrides);

  const accColor = ma.epsAccretionDollar >= 0 ? '#16a34a' : '#dc2626';
  const lboColor = lbo.grossIRR >= 0.18 ? '#16a34a' : '#d97706';
  const npvColor = capex.expandedStrategicNPV >= 0 ? '#16a34a' : '#dc2626';

  root.innerHTML = `
    <!-- Top Executive Deal Summary KPI Strip -->
    <div class="wb-kpi-grid">
      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>M&amp;A Deal EV &amp; EPS Impact</span>
          ${conceptPill('ma-mechanics', 'M&A')}
        </div>
        <div class="wb-kpi-card__value" style="color:${accColor};">
          ${ma.epsAccretionPct >= 0 ? '+' : ''}${(ma.epsAccretionPct * 100).toFixed(1)}% EPS
        </div>
        <div class="wb-kpi-card__sub">Deal EV ${fmtMoney(ma.enterpriseDealValue)} · ${ma.epsAccretionDollar >= 0 ? 'Accretive' : 'Dilutive'}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>§338(h)(10) Tax Shield PV</span>
          ${conceptPill('ma-tax', '§338(h)(10)')}
        </div>
        <div class="wb-kpi-card__value">${fmtMoney(ma.pvTaxShield338)}</div>
        <div class="wb-kpi-card__sub">Annual §197 Shield ${fmtMoney(ma.annualTaxShield338)}/yr</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>LBO Sponsor Gross IRR</span>
          ${conceptPill('lbo', 'LBO')}
        </div>
        <div class="wb-kpi-card__value" style="color:${lboColor};">${fmtPct(lbo.grossIRR)}</div>
        <div class="wb-kpi-card__sub">Gross MOIC ${lbo.grossMOIC.toFixed(2)}x · Debt Paid ${fmtMoney(lbo.initialDebt - lbo.endingDebt)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>PE Net LP IRR (2-and-20)</span>
          ${conceptPill('pe-fund-economics', 'GP/LP')}
        </div>
        <div class="wb-kpi-card__value">${fmtPct(lbo.waterfall.netLpIRR)}</div>
        <div class="wb-kpi-card__sub">Net LP MOIC ${lbo.waterfall.netLpMOIC.toFixed(2)}x · GP Carry ${fmtMoney(lbo.waterfall.gpCarriedInterest)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>CapEx Static NPV &amp; MIRR</span>
          ${conceptPill('npv-irr', 'CapEx')}
        </div>
        <div class="wb-kpi-card__value">${fmtMoney(capex.staticNPV)}</div>
        <div class="wb-kpi-card__sub">IRR ${fmtPct(capex.irr)} · MIRR ${fmtPct(capex.mirr)} vs WACC ${fmtPct(capex.wacc)}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Expanded Strategic NPV</span>
          ${conceptPill('real-options', 'Real Options')}
        </div>
        <div class="wb-kpi-card__value" style="color:${npvColor};">${fmtMoney(capex.expandedStrategicNPV)}</div>
        <div class="wb-kpi-card__sub">Includes +${fmtMoney(capex.realOptionExpandValue)} Expansion Option</div>
      </div>
    </div>

    <!-- 3 Deal Workbench Tabs -->
    <div class="wb-tabs" role="tablist">
      <button class="wb-tab ${activeDealTab === 'ma' ? 'active' : ''}" data-tab="ma">1. M&amp;A Accretion/Dilution &amp; §338(h)(10) Tax Structuring</button>
      <button class="wb-tab ${activeDealTab === 'lbo' ? 'active' : ''}" data-tab="lbo">2. 5-Year LBO Model &amp; GP/LP Waterfall</button>
      <button class="wb-tab ${activeDealTab === 'capex' ? 'active' : ''}" data-tab="capex">3. Strategic CapEx, MIRR/EVA &amp; Real Options</button>
    </div>

    <!-- TAB 1: M&A ACCRETION / DILUTION & SECTION 338(h)(10) -->
    <div id="deal-tab-ma" style="display:${activeDealTab === 'ma' ? 'block' : 'none'};">
      <div class="wb-layout">
        <aside class="wb-sidebar">
          <h3 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; color:#0f172a; margin:0 0 0.85rem 0;">
            M&amp;A Deal Parameters
          </h3>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>${company.ticker} Role in Deal</span>
            </div>
            <select id="ma-role" class="target-select" style="width:100%;">
              <option value="acquirer" ${ma.role === 'acquirer' ? 'selected' : ''}>Acquirer (Buying Bolt-On Target)</option>
              <option value="target" ${ma.role === 'target' ? 'selected' : ''}>Target (Being Acquired)</option>
            </select>
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Acquisition Offer Premium</span>
              <span class="wb-control-val">${(ma.offerPremiumPct * 100).toFixed(0)}%</span>
            </div>
            <input type="range" class="wb-range" id="ma-premium" min="0.05" max="0.60" step="0.05" value="${ma.offerPremiumPct}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Consideration Mix (% Stock)</span>
              <span class="wb-control-val">${(ma.stockMixPct * 100).toFixed(0)}% Stock / ${(ma.cashMixPct * 100).toFixed(0)}% Cash</span>
            </div>
            <input type="range" class="wb-range" id="ma-stock-mix" min="0" max="1" step="0.10" value="${ma.stockMixPct}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Pre-Tax Synergies ($M/yr)</span>
              <span class="wb-control-val">${fmtMoney(ma.synergiesPreTax)}</span>
            </div>
            <input type="range" class="wb-range" id="ma-synergies" min="0" max="${Math.round((ma.acq.rev + ma.tgt.rev) * 0.05)}" step="50" value="${Math.round(ma.synergiesPreTax)}" />
          </div>

          <div class="wb-control-group">
            <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; font-weight:700; color:#1e293b; cursor:pointer;">
              <input type="checkbox" id="ma-338" ${ma.elect338h10 ? 'checked' : ''} />
              <span>Elect §338(h)(10) Asset Tax Step-Up</span>
            </label>
            <div style="font-size:0.72rem; color:#64748b; margin-top:0.25rem;">
              Amortizes step-up over 15 yrs under IRC §197 (${fmtMoney(ma.annualTaxShield338)}/yr tax shield).
            </div>
          </div>
        </aside>

        <div>
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Pro-Forma M&amp;A EPS Accretion / Dilution &amp; Synergy Bridge</h3>
                <div class="wb-panel__subtitle">${ma.acq.name} acquiring ${ma.tgt.name} at ${(ma.offerPremiumPct * 100).toFixed(0)}% premium (${ma.impliedDealEvEbitda.toFixed(1)}x EV/EBITDA)</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('ma-mechanics', 'Accretion/Dilution')}
                ${conceptPill('ma-tax', '§338(h)(10) Tax')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>M&amp;A Financial Line Item</th>
                    <th>Standalone Acquirer</th>
                    <th>Standalone Target</th>
                    <th>Deal Adjustments</th>
                    <th>Pro-Forma Combined</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Revenue ($M)</td>
                    <td>${fmtMoney(ma.acq.rev)}</td>
                    <td>${fmtMoney(ma.tgt.rev)}</td>
                    <td>—</td>
                    <td>${fmtMoney(ma.acq.rev + ma.tgt.rev)}</td>
                  </tr>
                  <tr>
                    <td>Standalone Net Income ($M)</td>
                    <td>${fmtMoney(ma.acq.ni)}</td>
                    <td>${fmtMoney(ma.tgt.ni)}</td>
                    <td>—</td>
                    <td>${fmtMoney(ma.acq.ni + ma.tgt.ni)}</td>
                  </tr>
                  <tr>
                    <td>+ After-Tax Operating Synergies</td>
                    <td>—</td>
                    <td>—</td>
                    <td class="wb-td-cagr pos">+${fmtMoney(ma.afterTaxSynergies)}</td>
                    <td>+${fmtMoney(ma.afterTaxSynergies)}</td>
                  </tr>
                  <tr>
                    <td>− After-Tax Acquisition Debt Interest</td>
                    <td>—</td>
                    <td>—</td>
                    <td class="wb-td-cagr neg">(${fmtMoney(ma.afterTaxDebtCost)})</td>
                    <td>(${fmtMoney(ma.afterTaxDebtCost)})</td>
                  </tr>
                  <tr>
                    <td>+ Annual §338(h)(10) / §197 Tax Shield</td>
                    <td>—</td>
                    <td>—</td>
                    <td class="wb-td-cagr pos">+${fmtMoney(ma.annualTaxShield338)}</td>
                    <td>+${fmtMoney(ma.annualTaxShield338)}</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td>Pro-Forma Cash Net Income ($M)</td>
                    <td>${fmtMoney(ma.acq.ni)}</td>
                    <td>${fmtMoney(ma.tgt.ni)}</td>
                    <td>${fmtMoney(ma.afterTaxSynergies - ma.afterTaxDebtCost + ma.annualTaxShield338)}</td>
                    <td>${fmtMoney(ma.proFormaNetIncomeCash)}</td>
                  </tr>
                  <tr>
                    <td>Diluted Shares (Millions)</td>
                    <td>${ma.acq.shares.toFixed(1)}M</td>
                    <td>${ma.tgt.shares.toFixed(1)}M</td>
                    <td>+${ma.newSharesIssued.toFixed(1)}M new</td>
                    <td>${ma.proFormaShares.toFixed(1)}M</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td>Diluted Cash EPS ($/sh)</td>
                    <td>$${ma.acq.eps.toFixed(2)}</td>
                    <td>$${ma.tgt.eps.toFixed(2)}</td>
                    <td class="wb-td-cagr ${ma.epsAccretionDollar >= 0 ? 'pos' : 'neg'}">
                      ${ma.epsAccretionDollar >= 0 ? '+' : ''}$${ma.epsAccretionDollar.toFixed(2)} (${ma.epsAccretionPct >= 0 ? '+' : ''}${(ma.epsAccretionPct * 100).toFixed(1)}%)
                    </td>
                    <td>$${ma.proFormaEpsCash.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="wb-panel__body" style="border-top:1px solid #e2e8f0; background:#f8fafc;">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; font-size:0.8rem; color:#334155;">
                <div>
                  <strong>Break-Even Pre-Tax Synergies:</strong><br/>
                  Requires <strong>${fmtMoney(ma.breakEvenSynergiesPreTax)}/yr</strong> in pre-tax synergies for $0.00 EPS dilution.
                </div>
                <div>
                  <strong>§338(h)(10) Step-Up Basis:</strong><br/>
                  Purchase Step-Up = <strong>${fmtMoney(ma.excessPurchasePrice)}</strong> · PV of 15Y Tax Shield = <strong>${fmtMoney(ma.pvTaxShield338)}</strong>.
                </div>
                <div>
                  <strong>Deal Value Creation (Net NPV):</strong><br/>
                  PV(Synergies + Tax Shield) − Premium Paid = <strong style="color:${ma.netDealNPV >= 0 ? '#15803d' : '#b91c1c'};">${fmtMoney(ma.netDealNPV)}</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: 5-YEAR LEVERAGED BUYOUT (LBO) & GP/LP WATERFALL -->
    <div id="deal-tab-lbo" style="display:${activeDealTab === 'lbo' ? 'block' : 'none'};">
      <div class="wb-layout">
        <aside class="wb-sidebar">
          <h3 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; color:#0f172a; margin:0 0 0.85rem 0;">
            LBO Sponsor Assumptions
          </h3>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Entry EV / EBITDA Multiple</span>
              <span class="wb-control-val">${lbo.entryMult.toFixed(1)}x</span>
            </div>
            <input type="range" class="wb-range" id="lbo-entry-mult" min="6" max="18" step="0.5" value="${lbo.entryMult}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Initial Debt / EBITDA</span>
              <span class="wb-control-val">${lbo.debtToEbitda.toFixed(1)}x</span>
            </div>
            <input type="range" class="wb-range" id="lbo-leverage" min="2.0" max="7.5" step="0.5" value="${lbo.debtToEbitda}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Annual EBITDA Growth</span>
              <span class="wb-control-val">${(lbo.ebitdaGrowth * 100).toFixed(1)}%</span>
            </div>
            <input type="range" class="wb-range" id="lbo-growth" min="0.00" max="0.20" step="0.01" value="${lbo.ebitdaGrowth}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Year 5 Exit EV / EBITDA</span>
              <span class="wb-control-val">${lbo.exitMult.toFixed(1)}x</span>
            </div>
            <input type="range" class="wb-range" id="lbo-exit-mult" min="6" max="20" step="0.5" value="${lbo.exitMult}" />
          </div>

          <hr style="border:none; border-top:1px solid #e2e8f0; margin:1rem 0;" />
          <div style="font-size:0.78rem; color:#334155; display:grid; gap:0.35rem;">
            <div style="display:flex; justify-content:space-between;"><span>Entry EV:</span><strong>${fmtMoney(lbo.entryEV)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Initial Debt:</span><strong>${fmtMoney(lbo.initialDebt)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Sponsor Equity (${(lbo.equityContributionPct * 100).toFixed(0)}%):</span><strong>${fmtMoney(lbo.sponsorEquity)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Year 5 Exit Equity:</span><strong>${fmtMoney(lbo.exitEquityProceeds)}</strong></div>
          </div>
        </aside>

        <div>
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">5-Year LBO Debt Sweep Schedule &amp; De-Leveraging Path ($ Millions)</h3>
                <div class="wb-panel__subtitle">Gross IRR = ${fmtPct(lbo.grossIRR)} (${lbo.grossMOIC.toFixed(2)}x MOIC) · Net LP IRR after 2-and-20 Waterfall = ${fmtPct(lbo.waterfall.netLpIRR)} (${lbo.waterfall.netLpMOIC.toFixed(2)}x)</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('lbo', 'LBO Model')}
                ${conceptPill('pe-fund-economics', '2-and-20 Waterfall')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>LBO Schedule Line Item ($M)</th>
                    ${lbo.schedule.map(s => `<th>Year ${s.year}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr class="wb-row-total">
                    <td>Projected EBITDA</td>
                    ${lbo.schedule.map(s => `<td>${fmtMoney(s.ebitda)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Beginning Total Debt</td>
                    ${lbo.schedule.map(s => `<td>${fmtMoney(s.begDebt)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Cash Interest Expense (${(lbo.blendedInterestRate * 100).toFixed(2)}%)</td>
                    ${lbo.schedule.map(s => `<td>(${fmtMoney(s.interest)})</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Free Cash Flow Available for Debt Sweep</td>
                    ${lbo.schedule.map(s => `<td>${fmtMoney(s.fcfForDebtSweep)}</td>`).join('')}
                  </tr>
                  <tr class="wb-row-total">
                    <td>Ending Total Debt</td>
                    ${lbo.schedule.map(s => `<td>${fmtMoney(s.endDebt)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Net Debt / EBITDA Leverage Ratio</td>
                    ${lbo.schedule.map(s => `<td>${s.netLeverage.toFixed(2)}x</td>`).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="wb-panel__body" style="border-top:1px solid #e2e8f0; background:#f8fafc;">
              <div class="wb-formula-breakdown" style="margin-top:0;">
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">EBITDA Growth Gain</div>
                  <div class="wb-formula-box__val">${fmtMoney(lbo.attribution.gainFromEbitdaGrowth)}</div>
                </div>
                <div class="wb-formula-op">+</div>
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">Debt Paydown (De-lev)</div>
                  <div class="wb-formula-box__val">${fmtMoney(lbo.attribution.gainFromDebtPaydown)}</div>
                </div>
                <div class="wb-formula-op">+</div>
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">Multiple Expansion</div>
                  <div class="wb-formula-box__val">${fmtMoney(lbo.attribution.gainFromMultExpansion)}</div>
                </div>
                <div class="wb-formula-op">−</div>
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">GP Carry + Fees</div>
                  <div class="wb-formula-box__val">${fmtMoney(lbo.waterfall.gpCarriedInterest + lbo.waterfall.mgmtFeeDrag5Y)}</div>
                </div>
                <div class="wb-formula-op">=</div>
                <div class="wb-formula-box" style="border-color:#86efac; background:#f0fdf4;">
                  <div class="wb-formula-box__label">Net LP Proceeds (${lbo.waterfall.netLpMOIC.toFixed(2)}x)</div>
                  <div class="wb-formula-box__val" style="color:#15803d;">${fmtMoney(lbo.waterfall.netLpProceeds)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: STRATEGIC CAPEX, MIRR/EVA & REAL OPTIONS -->
    <div id="deal-tab-capex" style="display:${activeDealTab === 'capex' ? 'block' : 'none'};">
      <div class="wb-layout">
        <aside class="wb-sidebar">
          <h3 style="font-size:0.85rem; font-weight:800; text-transform:uppercase; color:#0f172a; margin:0 0 0.85rem 0;">
            CapEx &amp; Real Option Inputs
          </h3>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Initial CapEx Outlay ($M)</span>
              <span class="wb-control-val">${fmtMoney(capex.initialOutlay)}</span>
            </div>
            <input type="range" class="wb-range" id="capex-outlay" min="50" max="${Math.max(1000, capex.initialOutlay * 3)}" step="25" value="${capex.initialOutlay}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Year 1 Cash Flow ($M)</span>
              <span class="wb-control-val">${fmtMoney(capex.year1CF)}</span>
            </div>
            <input type="range" class="wb-range" id="capex-cf1" min="10" max="${Math.max(500, capex.initialOutlay)}" step="10" value="${capex.year1CF}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Cash Flow Growth Rate</span>
              <span class="wb-control-val">${(capex.cfGrowth * 100).toFixed(1)}%</span>
            </div>
            <input type="range" class="wb-range" id="capex-growth" min="-0.05" max="0.25" step="0.01" value="${capex.cfGrowth}" />
          </div>

          <div class="wb-control-group">
            <div class="wb-control-label">
              <span>Project Volatility (σ for Real Option)</span>
              <span class="wb-control-val">${(capex.projectVol * 100).toFixed(0)}%</span>
            </div>
            <input type="range" class="wb-range" id="capex-vol" min="0.15" max="0.70" step="0.05" value="${capex.projectVol}" />
          </div>
        </aside>

        <div>
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Capital Budgeting Schedule (NPV, IRR, MIRR, EVA) &amp; Real Option Valuation</h3>
                <div class="wb-panel__subtitle">Hurdle Rate (WACC) = ${fmtPct(capex.wacc)} · Discounted Payback = ${capex.paybackYear.toFixed(1)} yrs · Profitability Index = ${capex.profitabilityIndex.toFixed(2)}x</div>
              </div>
              <div style="display:flex; gap:0.4rem;">
                ${conceptPill('capital-budgeting', 'CapEx')}
                ${conceptPill('real-options', 'Real Options')}
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>CapEx Metric ($M)</th>
                    <th>Year 0</th>
                    ${capex.schedule.map(s => `<th>Year ${s.year}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr class="wb-row-total">
                    <td>Project Free Cash Flow</td>
                    <td class="wb-td-cagr neg">(${fmtMoney(capex.initialOutlay)})</td>
                    ${capex.schedule.map(s => `<td>${fmtMoney(s.cf)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Present Value at WACC (${fmtPct(capex.wacc)})</td>
                    <td>(${fmtMoney(capex.initialOutlay)})</td>
                    ${capex.schedule.map(s => `<td>${fmtMoney(s.pv)}</td>`).join('')}
                  </tr>
                  <tr>
                    <td>Cumulative Discounted Cash Flow</td>
                    <td>(${fmtMoney(capex.initialOutlay)})</td>
                    ${capex.schedule.map(s => `<td>${fmtMoney(s.cumulativeDiscounted)}</td>`).join('')}
                  </tr>
                  <tr class="wb-row-total">
                    <td>Annual Project EVA (NOPAT − WACC × Capital)</td>
                    <td>—</td>
                    ${capex.schedule.map(s => `<td>${fmtMoney(s.eva)}</td>`).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="wb-panel__body" style="border-top:1px solid #e2e8f0; background:#f8fafc;">
              <div class="wb-formula-breakdown" style="margin-top:0;">
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">Static DCF NPV</div>
                  <div class="wb-formula-box__val">${fmtMoney(capex.staticNPV)}</div>
                </div>
                <div class="wb-formula-op">+</div>
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">Phase II Expansion Real Option</div>
                  <div class="wb-formula-box__val">+${fmtMoney(capex.realOptionExpandValue)}</div>
                </div>
                <div class="wb-formula-op">=</div>
                <div class="wb-formula-box" style="border-color:#86efac; background:#f0fdf4;">
                  <div class="wb-formula-box__label">Expanded Strategic NPV (eNPV)</div>
                  <div class="wb-formula-box__val" style="color:#15803d;">${fmtMoney(capex.expandedStrategicNPV)}</div>
                </div>
                <div class="wb-formula-box">
                  <div class="wb-formula-box__label">IRR vs. MIRR</div>
                  <div class="wb-formula-box__val">${fmtPct(capex.irr)} / ${fmtPct(capex.mirr)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire Deal Tabs
  root.querySelectorAll('.wb-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDealTab = btn.getAttribute('data-tab');
      renderDealWorkbench(company);
    });
  });

  // Wire M&A Controls
  const bindVal = (sel, obj, key, isFloat = true) => {
    const el = root.querySelector(sel);
    if (!el) return;
    el.addEventListener('change', (e) => {
      obj[key] = isFloat ? parseFloat(e.target.value) : e.target.value;
      renderDealWorkbench(company);
    });
  };
  bindVal('#ma-role', maOverrides, 'role', false);
  bindVal('#ma-premium', maOverrides, 'offerPremiumPct');
  bindVal('#ma-stock-mix', maOverrides, 'stockMixPct');
  bindVal('#ma-synergies', maOverrides, 'synergiesPreTax');
  const chk338 = root.querySelector('#ma-338');
  if (chk338) {
    chk338.addEventListener('change', (e) => {
      maOverrides.elect338h10 = e.target.checked;
      renderDealWorkbench(company);
    });
  }

  // Wire LBO Controls
  bindVal('#lbo-entry-mult', lboOverrides, 'entryMult');
  bindVal('#lbo-leverage', lboOverrides, 'debtToEbitda');
  bindVal('#lbo-growth', lboOverrides, 'ebitdaGrowth');
  bindVal('#lbo-exit-mult', lboOverrides, 'exitMult');

  // Wire CapEx Controls
  bindVal('#capex-outlay', capexOverrides, 'initialOutlay');
  bindVal('#capex-cf1', capexOverrides, 'year1CF');
  bindVal('#capex-growth', capexOverrides, 'cfGrowth');
  bindVal('#capex-vol', capexOverrides, 'projectVol');
}

if (typeof document !== 'undefined') {
  const initDeal = () => {
    const bannerEl = document.getElementById('analyze-target-banner');
    const rootEl = document.getElementById('wb-deal-root');
    if (!rootEl) return;

    if (bannerEl) {
      mountTargetBanner(bannerEl, (company) => {
        renderDealWorkbench(company);
      });
    }
    renderDealWorkbench(getActiveCompany());
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeal);
  } else {
    initDeal();
  }
}
