/**
 * js/analyze/consulting-workbench.js
 * Workbench 5: Management Consulting & Business Case Studio
 *
 * Implements 4 integrated management consulting & corporate strategy engines:
 * 1. Capital Budgeting & Business Case Builder (NPV, IRR, MIRR, ROI, Profitability Index, Payback & J-Curve)
 * 2. EBITDA Bridge Waterfall & Value Driver Tree (Pricing, Volume, COGS Procurement & SG&A Levers + EV Uplift)
 * 3. Break-Even, Pricing Power & Customer Unit Economics Simulator (CVP, Price Elasticity Matrix, DOL, LTV/CAC)
 * 4. Tornado Sensitivity & Consulting Engagement Fee / Value-Share Structurer (Bear/Base/Bull + Fee Models)
 */

import {
  getActiveCompany,
  fmtMoney,
  fmtSharePrice,
  fmtPct,
  fmtMult,
  conceptPill,
  highlightNegativeTableCells
} from './state.js';
import { mountTargetBanner } from './hub.js';
import { compute10KAnalysis } from './10k-analyzer.js';
import { computeStockValuation } from './stock-valuator.js';

/**
 * Built-in Management Consulting Case Archetypes
 * Ratios scale dynamically to the active company's revenue/EBITDA baseline
 */
export const CONSULTING_TEMPLATES = {
  digital: {
    id: 'digital',
    name: 'AI & Cloud ERP Digital Transformation',
    badge: 'Tech & SG&A Automation',
    summary: 'Enterprise cloud migration and AI workflow automation reducing SG&A overhead and accelerating revenue cycle throughput.',
    capexPctRev: 0.022,        // 2.2% of revenue upfront investment
    feePctCapex: 0.15,         // Consulting & change-management fee as % of CapEx
    yr1BenefitPctRev: 0.014,   // 1.4% of revenue Year 1 gross benefit
    benefitGrowthRate: 0.18,   // 18% annual ramp in benefits as adoption scales
    ongoingOpexPctRev: 0.003,  // 0.3% of revenue annual cloud/license run-rate OpEx
    horizonYears: 5,
    priceUpliftPct: 0.015,
    volumeGrowthPct: 0.025,
    cogsSavingsPct: 0.020,
    sgaSavingsPct: 0.085
  },
  pricing: {
    id: 'pricing',
    name: 'Commercial Pricing & Margin Turnaround',
    badge: 'Rapid Payback · Commercial Excellence',
    summary: 'Price-pack architecture, discount leakage governance, and direct procurement renegotiation with rapid <12 month payback.',
    capexPctRev: 0.008,
    feePctCapex: 0.25,
    yr1BenefitPctRev: 0.018,
    benefitGrowthRate: 0.10,
    ongoingOpexPctRev: 0.0015,
    horizonYears: 5,
    priceUpliftPct: 0.035,
    volumeGrowthPct: 0.010,
    cogsSavingsPct: 0.035,
    sgaSavingsPct: 0.030
  },
  automation: {
    id: 'automation',
    name: 'Smart Factory & Supply Chain Automation',
    badge: 'Industrial CapEx & COGS',
    summary: 'Robotics, predictive maintenance, and inventory footprint optimization unlocking unit COGS reductions and working capital.',
    capexPctRev: 0.038,
    feePctCapex: 0.12,
    yr1BenefitPctRev: 0.016,
    benefitGrowthRate: 0.14,
    ongoingOpexPctRev: 0.004,
    horizonYears: 6,
    priceUpliftPct: 0.005,
    volumeGrowthPct: 0.020,
    cogsSavingsPct: 0.065,
    sgaSavingsPct: 0.025
  },
  market: {
    id: 'market',
    name: 'New Market & Product Expansion (GTM)',
    badge: 'Growth Strategy & LTV/CAC',
    summary: 'Adjacent vertical entry and salesforce effectiveness program driving top-line volume acceleration and customer LTV expansion.',
    capexPctRev: 0.028,
    feePctCapex: 0.18,
    yr1BenefitPctRev: 0.015,
    benefitGrowthRate: 0.22,
    ongoingOpexPctRev: 0.0045,
    horizonYears: 5,
    priceUpliftPct: 0.020,
    volumeGrowthPct: 0.055,
    cogsSavingsPct: 0.010,
    sgaSavingsPct: 0.020
  }
};

/**
 * Solve Internal Rate of Return (IRR) via Newton-Raphson with bisection fallback
 */
export function solveIRR(cashFlows) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) return 0;
  const hasPos = cashFlows.some(c => c > 0);
  const hasNeg = cashFlows.some(c => c < 0);
  if (!hasPos || !hasNeg) return 0;

  let low = -0.90;
  let high = 5.0;
  const npvAt = (r) => cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0);

  let fLow = npvAt(low);
  let fHigh = npvAt(high);
  if (fLow * fHigh > 0) {
    // Fallback Newton-Raphson around 10%
    let r = 0.12;
    for (let i = 0; i < 60; i++) {
      let f = 0;
      let df = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        f += cashFlows[t] / Math.pow(1 + r, t);
        if (t > 0) df -= (t * cashFlows[t]) / Math.pow(1 + r, t + 1);
      }
      if (Math.abs(df) < 1e-9) break;
      const next = Math.max(-0.9, Math.min(5.0, r - f / df));
      if (Math.abs(next - r) < 1e-6) return next;
      r = next;
    }
    return r;
  }

  for (let iter = 0; iter < 80; iter++) {
    const mid = (low + high) / 2;
    const fMid = npvAt(mid);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }
  return (low + high) / 2;
}

/**
 * 1. Capital Budgeting & Business Case Engine (NPV, IRR, MIRR, ROI, Payback, J-Curve)
 */
export function computeConsultingBusinessCase(company, overrides = {}) {
  const fsa = compute10KAnalysis(company);
  const val = computeStockValuation(company);
  const latest = fsa.latest;

  const templateKey = overrides.template || 'digital';
  const tpl = CONSULTING_TEMPLATES[templateKey] || CONSULTING_TEMPLATES.digital;

  const baseRev = Math.max(500, latest.rev || 10000);
  const defaultCapex = Math.round(baseRev * tpl.capexPctRev);
  const defaultFee = Math.max(1, Math.round(defaultCapex * tpl.feePctCapex));
  const defaultYr1Benefit = Math.round(baseRev * tpl.yr1BenefitPctRev);
  const defaultOngoingOpex = Math.round(baseRev * tpl.ongoingOpexPctRev);

  const upfrontCapex = overrides.upfrontCapex ?? defaultCapex;
  const consultingFee = overrides.consultingFee ?? defaultFee;
  const yr1Benefit = overrides.yr1Benefit ?? defaultYr1Benefit;
  const benefitGrowth = overrides.benefitGrowth ?? tpl.benefitGrowthRate;
  const ongoingOpex = overrides.ongoingOpex ?? defaultOngoingOpex;
  const horizonYears = Math.max(3, Math.min(10, Math.round(overrides.horizonYears ?? tpl.horizonYears)));
  const hurdleRate = overrides.hurdleRate ?? Math.max(0.06, Math.min(0.18, val.waccInputs?.wacc || 0.095));
  const taxRate = overrides.taxRate ?? Math.max(0.15, Math.min(0.35, latest.effectiveTaxRate || 0.21));

  // Total initial outlay in Year 0: CapEx + after-tax consulting fee (consulting fee is tax-deductible OpEx in Year 0)
  const afterTaxFeeOutlay = consultingFee * (1 - taxRate);
  const totalInitialOutlay = upfrontCapex + afterTaxFeeOutlay;
  const grossInitialSpend = upfrontCapex + consultingFee;

  const annualDepreciation = upfrontCapex / horizonYears;
  const schedule = [];
  const cashFlows = [-totalInitialOutlay];

  let cumUndiscounted = -totalInitialOutlay;
  let cumDiscounted = -totalInitialOutlay;
  let simplePaybackYears = null;
  let discountedPaybackYears = null;

  // Year 0 entry
  schedule.push({
    year: 0,
    capexAndFee: -grossInitialSpend,
    grossBenefit: 0,
    ongoingOpex: 0,
    depreciation: 0,
    ebitImpact: -consultingFee,
    nopat: -afterTaxFeeOutlay,
    taxShield: consultingFee * taxRate,
    fcf: -totalInitialOutlay,
    pvFcf: -totalInitialOutlay,
    cumUndiscounted,
    cumDiscounted
  });

  let totalGrossBenefits = 0;
  let totalOngoingOpex = 0;
  let totalNetCashInflows = 0;
  let pvInflows = 0;
  let fvPositiveFlows = 0;

  for (let t = 1; t <= horizonYears; t++) {
    const grossBenefit = yr1Benefit * Math.pow(1 + benefitGrowth, t - 1);
    const opEx = ongoingOpex * Math.pow(1 + 0.03, t - 1);
    const ebitdaImpact = grossBenefit - opEx;
    const ebitImpact = ebitdaImpact - annualDepreciation;
    const taxExpense = Math.max(0, ebitImpact * taxRate);
    const nopat = ebitImpact - taxExpense;
    const fcf = nopat + annualDepreciation; // Operating FCF = EBITDA*(1-t) + Depr*t
    const taxShield = annualDepreciation * taxRate;
    const pvFcf = fcf / Math.pow(1 + hurdleRate, t);

    const prevUndisc = cumUndiscounted;
    const prevDisc = cumDiscounted;
    cumUndiscounted += fcf;
    cumDiscounted += pvFcf;

    if (simplePaybackYears === null && cumUndiscounted >= 0 && fcf > 0) {
      simplePaybackYears = (t - 1) + Math.abs(prevUndisc) / fcf;
    }
    if (discountedPaybackYears === null && cumDiscounted >= 0 && pvFcf > 0) {
      discountedPaybackYears = (t - 1) + Math.abs(prevDisc) / pvFcf;
    }

    totalGrossBenefits += grossBenefit;
    totalOngoingOpex += opEx;
    totalNetCashInflows += fcf;
    pvInflows += pvFcf;
    fvPositiveFlows += fcf * Math.pow(1 + hurdleRate, horizonYears - t);
    cashFlows.push(fcf);

    schedule.push({
      year: t,
      capexAndFee: 0,
      grossBenefit,
      ongoingOpex: opEx,
      depreciation: annualDepreciation,
      ebitImpact,
      nopat,
      taxShield,
      fcf,
      pvFcf,
      cumUndiscounted,
      cumDiscounted
    });
  }

  const npv = pvInflows - totalInitialOutlay;
  const irr = solveIRR(cashFlows);
  const mirr = totalInitialOutlay > 0 && fvPositiveFlows > 0
    ? Math.pow(fvPositiveFlows / totalInitialOutlay, 1 / horizonYears) - 1
    : 0;
  const profitabilityIndex = totalInitialOutlay > 0 ? pvInflows / totalInitialOutlay : 0;

  // Simple ROI (%) = (Total Net After-Tax Cash Inflows - Initial Outlay) / Initial Outlay
  const netProfit = totalNetCashInflows - totalInitialOutlay;
  const simpleRoiPct = totalInitialOutlay > 0 ? netProfit / totalInitialOutlay : 0;
  const annualizedRoiPct = totalInitialOutlay > 0 && totalNetCashInflows > 0
    ? Math.pow(totalNetCashInflows / totalInitialOutlay, 1 / horizonYears) - 1
    : 0;

  // Consulting Fee Value Multiple = PV of Net Cash Inflows / Consulting Fee
  const feeValueMultiple = consultingFee > 0 ? pvInflows / consultingFee : 0;

  return {
    templateKey,
    template: tpl,
    upfrontCapex,
    consultingFee,
    grossInitialSpend,
    totalInitialOutlay,
    yr1Benefit,
    benefitGrowth,
    ongoingOpex,
    horizonYears,
    hurdleRate,
    taxRate,
    npv,
    irr,
    mirr,
    profitabilityIndex,
    simpleRoiPct,
    annualizedRoiPct,
    simplePaybackYears,
    discountedPaybackYears,
    pvInflows,
    totalNetCashInflows,
    totalGrossBenefits,
    feeValueMultiple,
    schedule,
    cashFlows,
    verdict: npv > 0 && irr > hurdleRate ? 'APPROVE — VALUE CREATING' : 'REWORK / REJECT — BELOW HURDLE'
  };
}

/**
 * 2. EBITDA Bridge Waterfall & Value Driver Tree Engine
 */
export function computeEbitdaBridge(company, overrides = {}) {
  const fsa = compute10KAnalysis(company);
  const latest = fsa.latest;

  const templateKey = overrides.template || 'digital';
  const tpl = CONSULTING_TEMPLATES[templateKey] || CONSULTING_TEMPLATES.digital;

  const baseRev = Math.max(500, latest.rev || 10000);
  const baseCogs = Math.max(100, latest.cogs || baseRev * 0.55);
  const baseSga = Math.max(50, (latest.sga || 0) + (latest.rd || 0) || baseRev * 0.22);
  const baseEbitda = Math.max(50, latest.ebitda || (baseRev - baseCogs - baseSga));
  const baseMargin = baseEbitda / baseRev;

  const priceUpliftPct = overrides.priceUpliftPct ?? tpl.priceUpliftPct;
  const volumeGrowthPct = overrides.volumeGrowthPct ?? tpl.volumeGrowthPct;
  const cogsSavingsPct = overrides.cogsSavingsPct ?? tpl.cogsSavingsPct;
  const sgaSavingsPct = overrides.sgaSavingsPct ?? tpl.sgaSavingsPct;
  const runRateProgramOpex = overrides.runRateProgramOpex ?? Math.round(baseRev * tpl.ongoingOpexPctRev);
  const evMultiple = overrides.evMultiple ?? Math.max(6, Math.min(25, fsa.latest.evToEbitda || 12.5));

  // 1. Price Realization flows 100% to EBITDA
  const pricingEbitdaLift = baseRev * priceUpliftPct;

  // 2. Volume Expansion earns baseline contribution margin ((Rev - COGS) / Rev)
  const grossMarginRatio = Math.max(0.15, (baseRev - baseCogs) / baseRev);
  const volumeRevLift = baseRev * volumeGrowthPct;
  const volumeEbitdaLift = volumeRevLift * grossMarginRatio;

  // 3. COGS Procurement & Lean Manufacturing Savings
  const cogsEbitdaLift = baseCogs * cogsSavingsPct;

  // 4. SG&A & Organizational Productivity Savings
  const sgaEbitdaLift = baseSga * sgaSavingsPct;

  const totalGrossLift = pricingEbitdaLift + volumeEbitdaLift + cogsEbitdaLift + sgaEbitdaLift;
  const netEbitdaLift = totalGrossLift - runRateProgramOpex;
  const targetEbitda = baseEbitda + netEbitdaLift;
  const targetRev = baseRev + pricingEbitdaLift + volumeRevLift;
  const targetMargin = targetRev > 0 ? targetEbitda / targetRev : 0;
  const marginExpansionBps = (targetMargin - baseMargin) * 10000;
  const impliedEvCreation = netEbitdaLift * evMultiple;

  const steps = [
    { label: 'Baseline EBITDA', value: baseEbitda, type: 'base' },
    { label: '+ Price Realization', value: pricingEbitdaLift, type: 'pos' },
    { label: '+ Volume / Mix', value: volumeEbitdaLift, type: 'pos' },
    { label: '+ COGS Procurement', value: cogsEbitdaLift, type: 'pos' },
    { label: '+ SG&A Productivity', value: sgaEbitdaLift, type: 'pos' },
    { label: '− Program OpEx', value: -runRateProgramOpex, type: 'neg' },
    { label: 'Target Run-Rate EBITDA', value: targetEbitda, type: 'total' }
  ];

  return {
    baseRev,
    baseCogs,
    baseSga,
    baseEbitda,
    baseMargin,
    priceUpliftPct,
    volumeGrowthPct,
    cogsSavingsPct,
    sgaSavingsPct,
    runRateProgramOpex,
    evMultiple,
    pricingEbitdaLift,
    volumeRevLift,
    volumeEbitdaLift,
    cogsEbitdaLift,
    sgaEbitdaLift,
    totalGrossLift,
    netEbitdaLift,
    targetRev,
    targetEbitda,
    targetMargin,
    marginExpansionBps,
    impliedEvCreation,
    steps
  };
}

/**
 * 3. Break-Even, Pricing Power & Customer Unit Economics Simulator (CVP, Price Elasticity, LTV/CAC)
 */
export function computePricingAndUnitEconomics(company, overrides = {}) {
  const fsa = compute10KAnalysis(company);
  const latest = fsa.latest;

  // Part A: Cost-Volume-Profit (CVP) & Price Elasticity Break-Even
  const unitPrice = overrides.unitPrice ?? 250;
  const unitVarCost = overrides.unitVarCost ?? 100;
  const fixedCosts = overrides.fixedCosts ?? Math.max(100, Math.round((latest.sga || 500) * 0.65));
  const currentUnits = overrides.currentUnits ?? Math.max(1, Math.round((fixedCosts * 1.45) / Math.max(1, unitPrice - unitVarCost)));
  const proposedPriceChangePct = overrides.proposedPriceChangePct ?? 0.05; // +5% price increase

  const unitContribution = Math.max(0.01, unitPrice - unitVarCost);
  const contributionMarginPct = unitPrice > 0 ? unitContribution / unitPrice : 0;
  const breakEvenUnits = unitContribution > 0 ? fixedCosts / unitContribution : 0;
  const breakEvenRevenue = contributionMarginPct > 0 ? fixedCosts / contributionMarginPct : 0;

  const currentRevenue = currentUnits * unitPrice;
  const currentTotalContribution = currentUnits * unitContribution;
  const currentEbitda = currentTotalContribution - fixedCosts;
  const safetyMarginPct = currentRevenue > 0 ? (currentRevenue - breakEvenRevenue) / currentRevenue : 0;
  const operatingLeverageDOL = currentEbitda > 0 ? currentTotalContribution / currentEbitda : 1;

  // Indifference Volume Change for a given Price Change:
  // Delta_Q_breakeven = -Delta_P / (CM% + Delta_P)
  const denom = contributionMarginPct + proposedPriceChangePct;
  const maxVolumeLossForPriceHike = denom > 0 ? -proposedPriceChangePct / denom : 0;
  const newUnitPrice = unitPrice * (1 + proposedPriceChangePct);
  const newUnitContribution = newUnitPrice - unitVarCost;

  // Price vs Volume Sensitivity Matrix (% change in EBITDA)
  const priceSteps = [-0.05, -0.025, 0, 0.025, 0.05, 0.075, 0.10];
  const volumeSteps = [-0.15, -0.10, -0.05, 0, 0.05, 0.10];
  const priceVolumeMatrix = volumeSteps.map(vChg => ({
    volumeChg: vChg,
    cells: priceSteps.map(pChg => {
      const pNew = unitPrice * (1 + pChg);
      const qNew = currentUnits * (1 + vChg);
      const ebitdaNew = qNew * (pNew - unitVarCost) - fixedCosts;
      const ebitdaDelta = ebitdaNew - currentEbitda;
      return { pChg, vChg, ebitdaNew, ebitdaDelta };
    })
  }));

  // Part B: Customer Cohort & SaaS/Enterprise Unit Economics (LTV / CAC)
  const arpuAnnual = overrides.arpuAnnual ?? 24000; // $24k annual contract value
  const customerGrossMargin = overrides.customerGrossMargin ?? Math.max(0.40, Math.min(0.90, latest.grossMargin || 0.72));
  const annualChurnRate = overrides.annualChurnRate ?? 0.10; // 10% annual churn (90% retention)
  const cac = overrides.cac ?? 32000; // $32k customer acquisition cost
  const discountRate = overrides.discountRate ?? 0.10;

  const annualGrossProfitPerCust = arpuAnnual * customerGrossMargin;
  const effectiveDecay = Math.max(0.02, annualChurnRate + discountRate);
  const ltv = annualGrossProfitPerCust / effectiveDecay;
  const undiscountedLtv = annualGrossProfitPerCust / Math.max(0.01, annualChurnRate);
  const ltvToCac = cac > 0 ? ltv / cac : 0;
  const cacPaybackMonths = annualGrossProfitPerCust > 0 ? (cac / annualGrossProfitPerCust) * 12 : 0;
  const avgCustomerLifetimeYears = 1 / Math.max(0.01, annualChurnRate);

  return {
    unitPrice,
    unitVarCost,
    fixedCosts,
    currentUnits,
    proposedPriceChangePct,
    unitContribution,
    contributionMarginPct,
    breakEvenUnits,
    breakEvenRevenue,
    currentRevenue,
    currentEbitda,
    safetyMarginPct,
    operatingLeverageDOL,
    maxVolumeLossForPriceHike,
    newUnitPrice,
    newUnitContribution,
    priceSteps,
    volumeSteps,
    priceVolumeMatrix,
    arpuAnnual,
    customerGrossMargin,
    annualChurnRate,
    cac,
    discountRate,
    annualGrossProfitPerCust,
    ltv,
    undiscountedLtv,
    ltvToCac,
    cacPaybackMonths,
    avgCustomerLifetimeYears
  };
}

/**
 * 4. Tornado Sensitivity & Consulting Fee / Value-Share Structurer
 */
export function computeConsultingScenarios(company, overrides = {}) {
  const baseCase = computeConsultingBusinessCase(company, overrides);

  // Bear Case: +25% CapEx overrun, -30% Year-1 benefit capture, slower ramp, +1.5% WACC penalty
  const bearCase = computeConsultingBusinessCase(company, {
    ...overrides,
    upfrontCapex: baseCase.upfrontCapex * 1.25,
    yr1Benefit: baseCase.yr1Benefit * 0.70,
    benefitGrowth: Math.max(0, baseCase.benefitGrowth - 0.06),
    ongoingOpex: baseCase.ongoingOpex * 1.20,
    hurdleRate: baseCase.hurdleRate + 0.015
  });

  // Bull Case: -10% CapEx efficiency, +25% Year-1 benefit capture, +5% faster ramp, -1.0% WACC
  const bullCase = computeConsultingBusinessCase(company, {
    ...overrides,
    upfrontCapex: baseCase.upfrontCapex * 0.90,
    yr1Benefit: baseCase.yr1Benefit * 1.25,
    benefitGrowth: baseCase.benefitGrowth + 0.05,
    ongoingOpex: baseCase.ongoingOpex * 0.90,
    hurdleRate: Math.max(0.05, baseCase.hurdleRate - 0.01)
  });

  // Tornado Sensitivity Drivers (±25% swing on each key variable)
  const drivers = [
    {
      name: 'Annual Benefit Capture (±25%)',
      lowCase: computeConsultingBusinessCase(company, { ...overrides, yr1Benefit: baseCase.yr1Benefit * 0.75 }).npv,
      highCase: computeConsultingBusinessCase(company, { ...overrides, yr1Benefit: baseCase.yr1Benefit * 1.25 }).npv
    },
    {
      name: 'Upfront CapEx Outlay (±25%)',
      lowCase: computeConsultingBusinessCase(company, { ...overrides, upfrontCapex: baseCase.upfrontCapex * 1.25 }).npv,
      highCase: computeConsultingBusinessCase(company, { ...overrides, upfrontCapex: baseCase.upfrontCapex * 0.75 }).npv
    },
    {
      name: 'Benefit Growth Ramp (±6% / yr)',
      lowCase: computeConsultingBusinessCase(company, { ...overrides, benefitGrowth: Math.max(0, baseCase.benefitGrowth - 0.06) }).npv,
      highCase: computeConsultingBusinessCase(company, { ...overrides, benefitGrowth: baseCase.benefitGrowth + 0.06 }).npv
    },
    {
      name: 'Hurdle Rate / WACC (±250 bps)',
      lowCase: computeConsultingBusinessCase(company, { ...overrides, hurdleRate: baseCase.hurdleRate + 0.025 }).npv,
      highCase: computeConsultingBusinessCase(company, { ...overrides, hurdleRate: Math.max(0.04, baseCase.hurdleRate - 0.025) }).npv
    },
    {
      name: 'Ongoing Run-Rate OpEx (±30%)',
      lowCase: computeConsultingBusinessCase(company, { ...overrides, ongoingOpex: baseCase.ongoingOpex * 1.30 }).npv,
      highCase: computeConsultingBusinessCase(company, { ...overrides, ongoingOpex: baseCase.ongoingOpex * 0.70 }).npv
    }
  ].map(d => ({
    ...d,
    spread: Math.abs(d.highCase - d.lowCase)
  })).sort((a, b) => b.spread - a.spread);

  // Consulting Engagement Fee Structures Comparison
  const baseFee = baseCase.consultingFee;
  const yr1NetBenefit = Math.max(1, baseCase.yr1Benefit - baseCase.ongoingOpex);

  const feeModels = [
    {
      model: 'Fixed-Fee Arrangement',
      structure: '100% Fixed Retainer upon Milestone Delivery',
      totalFee: baseFee,
      clientNetNpv: baseCase.npv,
      clientRoiPct: baseCase.simpleRoiPct,
      feeMultiple: baseCase.feeValueMultiple,
      riskSharing: 'Low (Client bears execution risk)'
    },
    {
      model: 'Time & Materials (FTE Rate Card)',
      structure: 'Blended Partner / Manager / Consultant Weekly Burn (+15% scope buffer)',
      totalFee: baseFee * 1.15,
      clientNetNpv: baseCase.npv - (baseFee * 0.15 * (1 - baseCase.taxRate)),
      clientRoiPct: (baseCase.totalNetCashInflows - (baseCase.totalInitialOutlay + baseFee * 0.15 * (1 - baseCase.taxRate))) /
        (baseCase.totalInitialOutlay + baseFee * 0.15 * (1 - baseCase.taxRate)),
      feeMultiple: baseCase.pvInflows / (baseFee * 1.15),
      riskSharing: 'Low (Client bears schedule & overrun risk)'
    },
    {
      model: 'Value-Share / Gain-Share Hybrid',
      structure: `50% Base Retainer + 15% of Verified Year-1 Savings`,
      totalFee: baseFee * 0.50 + yr1NetBenefit * 0.15,
      clientNetNpv: baseCase.npv - ((baseFee * 0.50 + yr1NetBenefit * 0.15 - baseFee) * (1 - baseCase.taxRate)),
      clientRoiPct: (baseCase.totalNetCashInflows - (baseCase.upfrontCapex + (baseFee * 0.50 + yr1NetBenefit * 0.15) * (1 - baseCase.taxRate))) /
        (baseCase.upfrontCapex + (baseFee * 0.50 + yr1NetBenefit * 0.15) * (1 - baseCase.taxRate)),
      feeMultiple: baseCase.pvInflows / Math.max(0.1, baseFee * 0.50 + yr1NetBenefit * 0.15),
      riskSharing: 'High (Incentives tied directly to realized EBITDA)'
    }
  ];

  return {
    baseCase,
    bearCase,
    bullCase,
    drivers,
    feeModels
  };
}

/**
 * Draw J-Curve Cumulative Cash Flow Chart (Canvas 2D)
 */
function drawJCurveChart(canvas, bc) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 620;
  const H = rect.height || 300;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 28, right: 24, bottom: 38, left: 68 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const pts = bc.schedule;
  const allVals = pts.flatMap(p => [p.cumUndiscounted, p.cumDiscounted, p.fcf]);
  const minVal = Math.min(...allVals, -bc.totalInitialOutlay * 1.15);
  const maxVal = Math.max(...allVals, bc.totalInitialOutlay * 0.5);
  const span = Math.max(1, maxVal - minVal);

  const xAt = (idx) => pad.left + (idx / Math.max(1, pts.length - 1)) * cw;
  const yAt = (val) => pad.top + ((maxVal - val) / span) * ch;
  const zeroY = yAt(0);

  // Horizontal grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = minVal + (span * i) / 4;
    const y = yAt(v);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmtMoney(v), pad.left - 8, y + 3);
  }

  // Zero Break-Even line
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(W - pad.right, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Annual FCF bars
  const barW = Math.min(34, (cw / pts.length) * 0.42);
  pts.forEach((p, idx) => {
    const x = xAt(idx) - barW / 2;
    const y0 = zeroY;
    const y1 = yAt(p.fcf);
    ctx.fillStyle = p.fcf >= 0 ? 'rgba(59, 130, 246, 0.22)' : 'rgba(220, 38, 38, 0.25)';
    ctx.fillRect(x, Math.min(y0, y1), barW, Math.abs(y1 - y0));

    ctx.fillStyle = '#334155';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Yr ${p.year}`, xAt(idx), H - 12);
  });

  // Undiscounted Cumulative Cash Flow Line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(xAt(idx), yAt(p.cumUndiscounted));
    else ctx.lineTo(xAt(idx), yAt(p.cumUndiscounted));
  });
  ctx.stroke();

  // Discounted Cumulative NPV J-Curve Line
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  pts.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(xAt(idx), yAt(p.cumDiscounted));
    else ctx.lineTo(xAt(idx), yAt(p.cumDiscounted));
  });
  ctx.stroke();

  // Plot nodes on Discounted J-Curve
  pts.forEach((p, idx) => {
    const cx = xAt(idx);
    const cy = yAt(p.cumDiscounted);
    ctx.fillStyle = p.cumDiscounted >= 0 ? '#16a34a' : '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Draw EBITDA Bridge Waterfall Chart (Canvas 2D)
 */
function drawWaterfallChart(canvas, bridge) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 620;
  const H = rect.height || 300;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 30, right: 20, bottom: 48, left: 68 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  let running = 0;
  const bars = bridge.steps.map(s => {
    if (s.type === 'base' || s.type === 'total') {
      running = s.value;
      return { ...s, start: 0, end: s.value };
    }
    const start = running;
    const end = running + s.value;
    running = end;
    return { ...s, start, end };
  });

  const maxVal = Math.max(...bars.map(b => Math.max(b.start, b.end))) * 1.15;
  const yAt = (v) => pad.top + ((maxVal - v) / Math.max(1, maxVal)) * ch;

  // Grid
  ctx.strokeStyle = '#e2e8f0';
  for (let i = 0; i <= 4; i++) {
    const v = (maxVal * i) / 4;
    const y = yAt(v);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmtMoney(v), pad.left - 8, y + 3);
  }

  const slotW = cw / bars.length;
  const barW = Math.min(48, slotW * 0.58);

  bars.forEach((b, idx) => {
    const cx = pad.left + slotW * idx + slotW / 2;
    const x = cx - barW / 2;
    const yTop = yAt(Math.max(b.start, b.end));
    const yBot = yAt(Math.min(b.start, b.end));
    const h = Math.max(3, yBot - yTop);

    ctx.fillStyle = b.type === 'base'
      ? '#334155'
      : b.type === 'total'
      ? '#1d4ed8'
      : b.type === 'pos'
      ? '#16a34a'
      : '#dc2626';
    ctx.fillRect(x, yTop, barW, h);

    // Value label above bar
    ctx.fillStyle = b.type === 'neg' ? '#dc2626' : '#0f172a';
    ctx.font = '700 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    const prefix = b.type === 'pos' ? '+' : '';
    ctx.fillText(`${prefix}${fmtMoney(b.value)}`, cx, yTop - 6);

    // X-axis label
    ctx.fillStyle = '#334155';
    ctx.font = '600 10px Inter, sans-serif';
    const shortLbl = b.label.replace(/^[+−]\s*/, '');
    ctx.fillText(shortLbl.slice(0, 14), cx, H - 18);
  });
}

/**
 * Draw Tornado Sensitivity Chart (Canvas 2D)
 */
function drawTornadoChart(canvas, scen) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 620;
  const H = rect.height || 260;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 24, right: 64, bottom: 28, left: 215 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const baseNpv = scen.baseCase.npv;
  const allVals = scen.drivers.flatMap(d => [d.lowCase, d.highCase, baseNpv]);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const span = Math.max(1, (maxVal - minVal) * 1.2);
  const loBound = minVal - span * 0.08;

  const xAt = (v) => pad.left + ((v - loBound) / span) * cw;
  const baseX = xAt(baseNpv);

  const rowH = ch / Math.max(1, scen.drivers.length);
  scen.drivers.forEach((d, i) => {
    const cy = pad.top + rowH * i + rowH / 2;
    const barH = Math.min(22, rowH * 0.58);
    const xLow = xAt(d.lowCase);
    const xHigh = xAt(d.highCase);

    // Downside bar
    ctx.fillStyle = 'rgba(220, 38, 38, 0.78)';
    ctx.fillRect(Math.min(xLow, baseX), cy - barH / 2, Math.abs(baseX - xLow), barH);

    // Upside bar
    ctx.fillStyle = 'rgba(22, 163, 74, 0.78)';
    ctx.fillRect(Math.min(xHigh, baseX), cy - barH / 2, Math.abs(xHigh - baseX), barH);

    // Driver label
    ctx.fillStyle = '#1e293b';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d.name, pad.left - 10, cy + 4);

    // Spread label
    ctx.fillStyle = '#475569';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Δ ${fmtMoney(d.spread)}`, Math.max(xLow, xHigh) + 6, cy + 3);
  });

  // Base NPV center line
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX, pad.top - 6);
  ctx.lineTo(baseX, H - pad.bottom + 4);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Base NPV: ${fmtMoney(baseNpv)}`, baseX, 14);
}

/**
 * Interactive Workbench Renderer
 */
export function renderConsultingWorkbench(root) {
  if (!root) return;

  let activeTab = 'business-case';
  const state = {
    template: 'digital',
    upfrontCapex: null,
    consultingFee: null,
    yr1Benefit: null,
    benefitGrowth: null,
    ongoingOpex: null,
    horizonYears: null,
    hurdleRate: null,
    priceUpliftPct: null,
    volumeGrowthPct: null,
    cogsSavingsPct: null,
    sgaSavingsPct: null,
    unitPrice: 250,
    unitVarCost: 100,
    proposedPriceChangePct: 0.05,
    arpuAnnual: 24000,
    annualChurnRate: 0.10,
    cac: 32000
  };

  const cleanOverrides = () => {
    const out = { template: state.template };
    Object.keys(state).forEach(k => {
      if (state[k] !== null && state[k] !== undefined) out[k] = state[k];
    });
    return out;
  };

  const updateView = () => {
    const company = getActiveCompany();
    const ov = cleanOverrides();
    const bc = computeConsultingBusinessCase(company, ov);
    const bridge = computeEbitdaBridge(company, ov);
    const unitEcon = computePricingAndUnitEconomics(company, ov);
    const scen = computeConsultingScenarios(company, ov);

    root.innerHTML = `
      <!-- EXECUTIVE KPI SUMMARY STRIP -->
      <div class="wb-kpi-grid" style="margin-bottom: 1.25rem;">
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Project Net Present Value (NPV)</div>
          <div class="wb-kpi-card__val" style="color:${bc.npv >= 0 ? '#16a34a' : '#dc2626'};">${fmtMoney(bc.npv)}</div>
          <div class="wb-kpi-card__sub">${bc.verdict} (PI: ${bc.profitabilityIndex.toFixed(2)}x)</div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">IRR vs. Modified IRR (MIRR)</div>
          <div class="wb-kpi-card__val">${fmtPct(bc.irr)} <span style="font-size:0.85rem; color:#64748b;">/ ${fmtPct(bc.mirr)}</span></div>
          <div class="wb-kpi-card__sub">Hurdle WACC: ${fmtPct(bc.hurdleRate)} (Spread: ${((bc.irr - bc.hurdleRate) * 100).toFixed(1)}%)</div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Net Client ROI (${bc.horizonYears}-Yr)</div>
          <div class="wb-kpi-card__val" style="color:${bc.simpleRoiPct >= 0 ? '#1d4ed8' : '#dc2626'};">${fmtPct(bc.simpleRoiPct)}</div>
          <div class="wb-kpi-card__sub">Annualized ROI: ${fmtPct(bc.annualizedRoiPct)} · Fee Mult: ${bc.feeValueMultiple.toFixed(1)}x</div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Payback Period (Simple / Disc.)</div>
          <div class="wb-kpi-card__val">
            ${bc.simplePaybackYears !== null ? `${bc.simplePaybackYears.toFixed(1)} yrs` : `>${bc.horizonYears} yrs`}
          </div>
          <div class="wb-kpi-card__sub">
            Discounted Payback: ${bc.discountedPaybackYears !== null ? `${bc.discountedPaybackYears.toFixed(1)} yrs` : `>${bc.horizonYears} yrs`}
          </div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Run-Rate EBITDA Uplift</div>
          <div class="wb-kpi-card__val" style="color:#16a34a;">+${fmtMoney(bridge.netEbitdaLift)}</div>
          <div class="wb-kpi-card__sub">+${bridge.marginExpansionBps.toFixed(0)} bps Margin · +${fmtMoney(bridge.impliedEvCreation)} EV</div>
        </div>
      </div>

      <!-- PRESET CONSULTING CASE TEMPLATE BAR -->
      <div class="wb-panel" style="margin-bottom: 1.25rem; padding: 0.9rem 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#475569;">
              💼 Engagement Case Archetype (${company.ticker} Baseline):
            </span>
            <span style="font-size:0.82rem; color:#64748b; margin-left:0.4rem;">${bc.template.summary}</span>
          </div>
          <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
            ${Object.values(CONSULTING_TEMPLATES).map(t => `
              <button type="button" class="analyze-snap-pill ${state.template === t.id ? 'analyze-snap-pill--active' : ''}" data-tpl-id="${t.id}">
                ${t.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- WORKBENCH TABS -->
      <div class="wb-tabs" role="tablist">
        <button class="wb-tab ${activeTab === 'business-case' ? 'active' : ''}" data-tab="business-case">
          1. Business Case Builder (NPV, IRR, MIRR &amp; ROI)
        </button>
        <button class="wb-tab ${activeTab === 'ebitda-bridge' ? 'active' : ''}" data-tab="ebitda-bridge">
          2. EBITDA Bridge Waterfall &amp; Value Levers
        </button>
        <button class="wb-tab ${activeTab === 'pricing-unit' ? 'active' : ''}" data-tab="pricing-unit">
          3. Break-Even, Pricing Power &amp; Unit Economics (LTV/CAC)
        </button>
        <button class="wb-tab ${activeTab === 'scenarios-fees' ? 'active' : ''}" data-tab="scenarios-fees">
          4. Tornado Sensitivity &amp; Fee Structurer
        </button>
      </div>

      <!-- TAB 1: BUSINESS CASE BUILDER (NPV, IRR, MIRR, ROI, PAYBACK & J-CURVE) -->
      <div id="tab-business-case" class="wb-tab-pane" style="display:${activeTab === 'business-case' ? 'block' : 'none'};">
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Initiative Investment &amp; Cash Flow Parameters</h3>
                <div class="wb-panel__subtitle">Seeded from ${company.name} (${company.ticker}) — adjust sliders to stress-test ROI</div>
              </div>
              ${conceptPill('npv', 'NPV & IRR')}
            </div>
            <div class="wb-panel__body">
              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Upfront CapEx &amp; Tech Outlay ($M)</label>
                  <span class="wb-slider-val">${fmtMoney(bc.upfrontCapex)}</span>
                </div>
                <input type="range" id="sl-capex" min="10" max="${Math.max(500, Math.round(bc.upfrontCapex * 3))}" step="5" value="${bc.upfrontCapex}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Consulting &amp; Change Mgmt Fee ($M)</label>
                  <span class="wb-slider-val">${fmtMoney(bc.consultingFee)}</span>
                </div>
                <input type="range" id="sl-fee" min="1" max="${Math.max(100, Math.round(bc.upfrontCapex * 0.6))}" step="1" value="${bc.consultingFee}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Year 1 Gross Annual Savings / Uplift ($M)</label>
                  <span class="wb-slider-val">${fmtMoney(bc.yr1Benefit)}</span>
                </div>
                <input type="range" id="sl-benefit" min="5" max="${Math.max(400, Math.round(bc.yr1Benefit * 3))}" step="5" value="${bc.yr1Benefit}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Annual Benefit Ramp / Growth Rate (%)</label>
                  <span class="wb-slider-val">${fmtPct(bc.benefitGrowth)}</span>
                </div>
                <input type="range" id="sl-growth" min="0" max="0.40" step="0.01" value="${bc.benefitGrowth}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Ongoing Annual Run-Rate OpEx ($M)</label>
                  <span class="wb-slider-val">${fmtMoney(bc.ongoingOpex)}</span>
                </div>
                <input type="range" id="sl-opex" min="0" max="${Math.max(150, Math.round(bc.yr1Benefit * 0.8))}" step="2" value="${bc.ongoingOpex}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Hurdle Rate / WACC (%)</label>
                  <span class="wb-slider-val">${fmtPct(bc.hurdleRate)}</span>
                </div>
                <input type="range" id="sl-hurdle" min="0.05" max="0.20" step="0.005" value="${bc.hurdleRate}" />
              </div>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Cumulative Cash Flow &amp; NPV "J-Curve" Trajectory</h3>
                <div class="wb-panel__subtitle">Green = Discounted Cumulative NPV · Gray = Undiscounted · Bars = Annual FCF</div>
              </div>
              ${conceptPill('capital-budgeting', 'J-Curve & Payback')}
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-jcurve-canvas" style="width:100%; height:290px; display:block;"></canvas>
            </div>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Multi-Year Consulting Business Case Schedule ($M)</h3>
              <div class="wb-panel__subtitle">Includes Year-0 Tax-Deductible Consulting Fee, Straight-Line Depreciation Tax Shield &amp; Cumulative NPV</div>
            </div>
            ${conceptPill('irr', 'IRR vs. MIRR')}
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Business Case Line Item</th>
                  <th>Concept</th>
                  ${bc.schedule.map(s => `<th>Year ${s.year}</th>`).join('')}
                  <th>Total / KPI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Upfront CapEx + Consulting Fee</td>
                  <td>${conceptPill('capital-budgeting', 'Outlay')}</td>
                  ${bc.schedule.map(s => `<td>${s.capexAndFee < 0 ? `(${fmtMoney(Math.abs(s.capexAndFee))})` : '—'}</td>`).join('')}
                  <td>(${fmtMoney(bc.grossInitialSpend)})</td>
                </tr>
                <tr>
                  <td>Gross Initiative Benefits (Savings + Rev Uplift)</td>
                  <td>${conceptPill('fcf', 'Inflows')}</td>
                  ${bc.schedule.map(s => `<td>${s.year === 0 ? '—' : fmtMoney(s.grossBenefit)}</td>`).join('')}
                  <td>${fmtMoney(bc.totalGrossBenefits)}</td>
                </tr>
                <tr>
                  <td>Ongoing Program &amp; License OpEx</td>
                  <td>${conceptPill('reformulated-is', 'OpEx')}</td>
                  ${bc.schedule.map(s => `<td>${s.year === 0 ? '—' : `(${fmtMoney(s.ongoingOpex)})`}</td>`).join('')}
                  <td>(${fmtMoney(bc.schedule.reduce((a, b) => a + b.ongoingOpex, 0))})</td>
                </tr>
                <tr>
                  <td>Depreciation &amp; Fee Tax Shield (${fmtPct(bc.taxRate)})</td>
                  <td>${conceptPill('deferred-tax', 'Tax Shield')}</td>
                  ${bc.schedule.map(s => `<td>${fmtMoney(s.taxShield)}</td>`).join('')}
                  <td>${fmtMoney(bc.schedule.reduce((a, b) => a + b.taxShield, 0))}</td>
                </tr>
                <tr class="wb-row-total">
                  <td>Incremental After-Tax Free Cash Flow (FCF)</td>
                  <td>${conceptPill('fcf', 'Project FCF')}</td>
                  ${bc.schedule.map(s => `<td>${fmtMoney(s.fcf)}</td>`).join('')}
                  <td>${fmtMoney(bc.totalNetCashInflows - bc.totalInitialOutlay)}</td>
                </tr>
                <tr>
                  <td>Present Value of FCF (Discounted @ ${fmtPct(bc.hurdleRate)})</td>
                  <td>${conceptPill('npv', 'PV(FCF)')}</td>
                  ${bc.schedule.map(s => `<td>${fmtMoney(s.pvFcf)}</td>`).join('')}
                  <td>${fmtMoney(bc.npv)}</td>
                </tr>
                <tr>
                  <td>Cumulative Undiscounted Cash Flow</td>
                  <td>${conceptPill('capital-budgeting', 'Payback')}</td>
                  ${bc.schedule.map(s => `<td>${fmtMoney(s.cumUndiscounted)}</td>`).join('')}
                  <td>${bc.simplePaybackYears !== null ? `${bc.simplePaybackYears.toFixed(1)} yrs` : '—'}</td>
                </tr>
                <tr class="wb-row-total">
                  <td>Cumulative Discounted NPV (J-Curve)</td>
                  <td>${conceptPill('npv', 'Cum. NPV')}</td>
                  ${bc.schedule.map(s => `<td>${fmtMoney(s.cumDiscounted)}</td>`).join('')}
                  <td>${fmtMoney(bc.npv)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: EBITDA BRIDGE WATERFALL & VALUE DRIVER TREE -->
      <div id="tab-ebitda-bridge" class="wb-tab-pane" style="display:${activeTab === 'ebitda-bridge' ? 'block' : 'none'};">
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Consulting Value Driver Levers</h3>
                <div class="wb-panel__subtitle">Decompose EBITDA expansion across Commercial &amp; Operational levers</div>
              </div>
              ${conceptPill('dupont', 'Value Drivers')}
            </div>
            <div class="wb-panel__body">
              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>1. Price Realization Uplift (% of Revenue)</label>
                  <span class="wb-slider-val">+${fmtPct(bridge.priceUpliftPct)} (+${fmtMoney(bridge.pricingEbitdaLift)})</span>
                </div>
                <input type="range" id="sl-price-lift" min="0" max="0.08" step="0.0025" value="${bridge.priceUpliftPct}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>2. Volume &amp; Share Expansion (% of Revenue)</label>
                  <span class="wb-slider-val">+${fmtPct(bridge.volumeGrowthPct)} (+${fmtMoney(bridge.volumeEbitdaLift)})</span>
                </div>
                <input type="range" id="sl-vol-lift" min="0" max="0.12" step="0.005" value="${bridge.volumeGrowthPct}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>3. Procurement &amp; COGS Savings (% of COGS)</label>
                  <span class="wb-slider-val">−${fmtPct(bridge.cogsSavingsPct)} (+${fmtMoney(bridge.cogsEbitdaLift)})</span>
                </div>
                <input type="range" id="sl-cogs-save" min="0" max="0.12" step="0.005" value="${bridge.cogsSavingsPct}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>4. SG&amp;A &amp; Org Productivity (% of SG&amp;A)</label>
                  <span class="wb-slider-val">−${fmtPct(bridge.sgaSavingsPct)} (+${fmtMoney(bridge.sgaEbitdaLift)})</span>
                </div>
                <input type="range" id="sl-sga-save" min="0" max="0.20" step="0.005" value="${bridge.sgaSavingsPct}" />
              </div>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Executive EBITDA Waterfall Bridge ($M)</h3>
                <div class="wb-panel__subtitle">Baseline ${fmtMoney(bridge.baseEbitda)} &rarr; Target Run-Rate ${fmtMoney(bridge.targetEbitda)} (+${bridge.marginExpansionBps.toFixed(0)} bps)</div>
              </div>
              ${conceptPill('multiples', 'EV Creation')}
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-waterfall-canvas" style="width:100%; height:290px; display:block;"></canvas>
            </div>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Value Driver Tree &amp; Enterprise Value Creation Summary</h3>
              <div class="wb-panel__subtitle">Capitalizing run-rate EBITDA improvement at ${fmtMult(bridge.evMultiple)} EV/EBITDA creates ${fmtMoney(bridge.impliedEvCreation)} in shareholder value</div>
            </div>
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Value Creation Lever</th>
                  <th>Baseline Metric</th>
                  <th>Target Lever</th>
                  <th>Run-Rate EBITDA Impact</th>
                  <th>Implied EV Impact (${fmtMult(bridge.evMultiple)})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Commercial Pricing Excellence (100% Flow-Through)</td>
                  <td>${fmtMoney(bridge.baseRev)} Revenue</td>
                  <td>+${fmtPct(bridge.priceUpliftPct)} Price Realization</td>
                  <td>+${fmtMoney(bridge.pricingEbitdaLift)}</td>
                  <td>+${fmtMoney(bridge.pricingEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>Volume &amp; Category Share Growth</td>
                  <td>${fmtMoney(bridge.baseRev)} Revenue</td>
                  <td>+${fmtPct(bridge.volumeGrowthPct)} Volume Growth</td>
                  <td>+${fmtMoney(bridge.volumeEbitdaLift)}</td>
                  <td>+${fmtMoney(bridge.volumeEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>Direct Procurement &amp; Supply Chain Lean COGS</td>
                  <td>${fmtMoney(bridge.baseCogs)} COGS</td>
                  <td>−${fmtPct(bridge.cogsSavingsPct)} Unit Cost Reduction</td>
                  <td>+${fmtMoney(bridge.cogsEbitdaLift)}</td>
                  <td>+${fmtMoney(bridge.cogsEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>SG&amp;A Shared Services &amp; AI Automation</td>
                  <td>${fmtMoney(bridge.baseSga)} SG&amp;A</td>
                  <td>−${fmtPct(bridge.sgaSavingsPct)} Overhead Reduction</td>
                  <td>+${fmtMoney(bridge.sgaEbitdaLift)}</td>
                  <td>+${fmtMoney(bridge.sgaEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>Ongoing Program &amp; Software Run-Rate OpEx</td>
                  <td>—</td>
                  <td>Recurring Support Cost</td>
                  <td>(${fmtMoney(bridge.runRateProgramOpex)})</td>
                  <td>(${fmtMoney(bridge.runRateProgramOpex * bridge.evMultiple)})</td>
                </tr>
                <tr class="wb-row-total">
                  <td>Net Pro-Forma Run-Rate Uplift</td>
                  <td>${fmtMoney(bridge.baseEbitda)} (${fmtPct(bridge.baseMargin)})</td>
                  <td>+${bridge.marginExpansionBps.toFixed(0)} bps Margin Lift</td>
                  <td>+${fmtMoney(bridge.netEbitdaLift)}</td>
                  <td>+${fmtMoney(bridge.impliedEvCreation)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: BREAK-EVEN, PRICING POWER & UNIT ECONOMICS (CVP & LTV/CAC) -->
      <div id="tab-pricing-unit" class="wb-tab-pane" style="display:${activeTab === 'pricing-unit' ? 'block' : 'none'};">
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Cost-Volume-Profit (CVP) &amp; Pricing Elasticity Break-Even</h3>
                <div class="wb-panel__subtitle">How much volume can you afford to lose when raising prices?</div>
              </div>
              ${conceptPill('operating-leverage', 'CVP & DOL')}
            </div>
            <div class="wb-panel__body">
              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Average Unit Price ($)</label>
                  <span class="wb-slider-val">$${unitEcon.unitPrice.toFixed(0)}</span>
                </div>
                <input type="range" id="sl-unit-price" min="50" max="1000" step="10" value="${unitEcon.unitPrice}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Variable Cost per Unit ($)</label>
                  <span class="wb-slider-val">$${unitEcon.unitVarCost.toFixed(0)} (CM: ${fmtPct(unitEcon.contributionMarginPct)})</span>
                </div>
                <input type="range" id="sl-unit-vc" min="10" max="${Math.max(20, unitEcon.unitPrice - 10)}" step="5" value="${unitEcon.unitVarCost}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Proposed Price Increase (%)</label>
                  <span class="wb-slider-val">+${fmtPct(unitEcon.proposedPriceChangePct)} (&rarr; $${unitEcon.newUnitPrice.toFixed(2)})</span>
                </div>
                <input type="range" id="sl-price-chg" min="0.01" max="0.20" step="0.005" value="${unitEcon.proposedPriceChangePct}" />
              </div>

              <div style="margin-top:0.9rem; padding:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.84rem; line-height:1.5;">
                <div><strong>Contribution Margin:</strong> $${unitEcon.unitContribution.toFixed(2)}/unit (${fmtPct(unitEcon.contributionMarginPct)}) · <strong>Operating Leverage (DOL):</strong> ${unitEcon.operatingLeverageDOL.toFixed(2)}x</div>
                <div><strong>Break-Even Revenue:</strong> ${fmtMoney(unitEcon.breakEvenRevenue)} · <strong>Margin of Safety:</strong> ${fmtPct(unitEcon.safetyMarginPct)}</div>
                <div style="margin-top:0.35rem; color:#1d4ed8; font-weight:700;">
                  💡 Indifference Threshold: With a +${fmtPct(unitEcon.proposedPriceChangePct)} price increase, you can lose up to ${fmtPct(Math.abs(unitEcon.maxVolumeLossForPriceHike))} of volume and still remain EBITDA-neutral.
                </div>
              </div>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Customer Unit Economics (LTV / CAC &amp; Payback)</h3>
                <div class="wb-panel__subtitle">Cohort lifetime value, acquisition efficiency &amp; payback velocity</div>
              </div>
              ${conceptPill('capital-budgeting', 'Unit Economics')}
            </div>
            <div class="wb-panel__body">
              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Annual Revenue per Customer (ARPU / ACV)</label>
                  <span class="wb-slider-val">$${unitEcon.arpuAnnual.toLocaleString()}</span>
                </div>
                <input type="range" id="sl-arpu" min="2000" max="100000" step="1000" value="${unitEcon.arpuAnnual}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Customer Acquisition Cost (CAC)</label>
                  <span class="wb-slider-val">$${unitEcon.cac.toLocaleString()}</span>
                </div>
                <input type="range" id="sl-cac" min="2000" max="100000" step="1000" value="${unitEcon.cac}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Annual Customer Churn Rate (%)</label>
                  <span class="wb-slider-val">${fmtPct(unitEcon.annualChurnRate)} (Avg Life: ${unitEcon.avgCustomerLifetimeYears.toFixed(1)} yrs)</span>
                </div>
                <input type="range" id="sl-churn" min="0.02" max="0.35" step="0.01" value="${unitEcon.annualChurnRate}" />
              </div>

              <div style="margin-top:0.9rem; padding:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.84rem; line-height:1.5;">
                <div><strong>Discounted Customer LTV:</strong> $${Math.round(unitEcon.ltv).toLocaleString()} · <strong>Undiscounted LTV:</strong> $${Math.round(unitEcon.undiscountedLtv).toLocaleString()}</div>
                <div><strong>LTV / CAC Ratio:</strong> <span style="font-weight:800; color:${unitEcon.ltvToCac >= 3 ? '#16a34a' : '#dc2626'};">${unitEcon.ltvToCac.toFixed(2)}x</span> (Institutional Benchmark: &ge;3.0x)</div>
                <div><strong>CAC Payback Period:</strong> <span style="font-weight:700;">${unitEcon.cacPaybackMonths.toFixed(1)} months</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Price vs. Volume Trade-Off Matrix (Incremental EBITDA Impact $M)</h3>
              <div class="wb-panel__subtitle">Shows net EBITDA change ($M) across combinations of Price Change (columns) and Volume Change (rows)</div>
            </div>
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Volume Δ \\ Price Δ</th>
                  ${unitEcon.priceSteps.map(p => `<th>${p >= 0 ? '+' : ''}${(p * 100).toFixed(1)}% Price</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${unitEcon.priceVolumeMatrix.map(row => `
                  <tr>
                    <td style="font-weight:700;">${row.volumeChg >= 0 ? '+' : ''}${(row.volumeChg * 100).toFixed(0)}% Volume</td>
                    ${row.cells.map(c => `<td>${fmtMoney(c.ebitdaDelta)}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: TORNADO SENSITIVITY & CONSULTING FEE STRUCTURER -->
      <div id="tab-scenarios-fees" class="wb-tab-pane" style="display:${activeTab === 'scenarios-fees' ? 'block' : 'none'};">
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">NPV Tornado Sensitivity Chart</h3>
                <div class="wb-panel__subtitle">Ranked impact of ±25% swings in key assumptions around Base NPV (${fmtMoney(scen.baseCase.npv)})</div>
              </div>
              ${conceptPill('monte-carlo', 'Sensitivity')}
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-tornado-canvas" style="width:100%; height:260px; display:block;"></canvas>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Bear / Base / Bull Executive Scenario Matrix</h3>
                <div class="wb-panel__subtitle">Stress-testing implementation delays, cost overruns, and adoption rates</div>
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Initial Outlay</th>
                    <th>NPV ($M)</th>
                    <th>IRR</th>
                    <th>MIRR</th>
                    <th>Net ROI %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Bear Case (Delay + Overrun)</strong></td>
                    <td>${fmtMoney(scen.bearCase.totalInitialOutlay)}</td>
                    <td>${fmtMoney(scen.bearCase.npv)}</td>
                    <td>${fmtPct(scen.bearCase.irr)}</td>
                    <td>${fmtPct(scen.bearCase.mirr)}</td>
                    <td>${fmtPct(scen.bearCase.simpleRoiPct)}</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td><strong>Base Case (Management Plan)</strong></td>
                    <td>${fmtMoney(scen.baseCase.totalInitialOutlay)}</td>
                    <td>${fmtMoney(scen.baseCase.npv)}</td>
                    <td>${fmtPct(scen.baseCase.irr)}</td>
                    <td>${fmtPct(scen.baseCase.mirr)}</td>
                    <td>${fmtPct(scen.baseCase.simpleRoiPct)}</td>
                  </tr>
                  <tr>
                    <td><strong>Bull Case (Full Value Capture)</strong></td>
                    <td>${fmtMoney(scen.bullCase.totalInitialOutlay)}</td>
                    <td>${fmtMoney(scen.bullCase.npv)}</td>
                    <td>${fmtPct(scen.bullCase.irr)}</td>
                    <td>${fmtPct(scen.bullCase.mirr)}</td>
                    <td>${fmtPct(scen.bullCase.simpleRoiPct)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Consulting Engagement Fee &amp; Value-Share Structurer</h3>
              <div class="wb-panel__subtitle">Compare Fixed-Fee, Time &amp; Materials, and Value-Based Gain-Share fee structures</div>
            </div>
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Engagement Fee Model</th>
                  <th>Commercial Structure</th>
                  <th>Total Fee ($M)</th>
                  <th>Client Net NPV</th>
                  <th>Client Net ROI</th>
                  <th>Value / Fee Multiple</th>
                  <th>Risk Alignment</th>
                </tr>
              </thead>
              <tbody>
                ${scen.feeModels.map(m => `
                  <tr>
                    <td><strong>${m.model}</strong></td>
                    <td>${m.structure}</td>
                    <td>${fmtMoney(m.totalFee)}</td>
                    <td>${fmtMoney(m.clientNetNpv)}</td>
                    <td>${fmtPct(m.clientRoiPct)}</td>
                    <td>${m.feeMultiple.toFixed(1)}x</td>
                    <td>${m.riskSharing}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Highlight negative numbers & parenthesized cash outflows in red across all tables
    highlightNegativeTableCells(root);

    // Draw Canvas charts for visible tab
    requestAnimationFrame(() => {
      if (activeTab === 'business-case') {
        drawJCurveChart(root.querySelector('#consulting-jcurve-canvas'), bc);
      } else if (activeTab === 'ebitda-bridge') {
        drawWaterfallChart(root.querySelector('#consulting-waterfall-canvas'), bridge);
      } else if (activeTab === 'scenarios-fees') {
        drawTornadoChart(root.querySelector('#consulting-tornado-canvas'), scen);
      }
    });

    // Wire Preset Template Buttons
    root.querySelectorAll('[data-tpl-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.template = btn.dataset.tplId;
        state.upfrontCapex = null;
        state.consultingFee = null;
        state.yr1Benefit = null;
        state.benefitGrowth = null;
        state.ongoingOpex = null;
        state.priceUpliftPct = null;
        state.volumeGrowthPct = null;
        state.cogsSavingsPct = null;
        state.sgaSavingsPct = null;
        updateView();
      });
    });

    // Wire Tab Switching
    root.querySelectorAll('.wb-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        activeTab = tabBtn.dataset.tab;
        updateView();
      });
    });

    // Wire Sliders
    const bindSlider = (id, key) => {
      const el = root.querySelector(id);
      if (!el) return;
      el.addEventListener('change', () => {
        state[key] = parseFloat(el.value);
        updateView();
      });
    };

    bindSlider('#sl-capex', 'upfrontCapex');
    bindSlider('#sl-fee', 'consultingFee');
    bindSlider('#sl-benefit', 'yr1Benefit');
    bindSlider('#sl-growth', 'benefitGrowth');
    bindSlider('#sl-opex', 'ongoingOpex');
    bindSlider('#sl-hurdle', 'hurdleRate');
    bindSlider('#sl-price-lift', 'priceUpliftPct');
    bindSlider('#sl-vol-lift', 'volumeGrowthPct');
    bindSlider('#sl-cogs-save', 'cogsSavingsPct');
    bindSlider('#sl-sga-save', 'sgaSavingsPct');
    bindSlider('#sl-unit-price', 'unitPrice');
    bindSlider('#sl-unit-vc', 'unitVarCost');
    bindSlider('#sl-price-chg', 'proposedPriceChangePct');
    bindSlider('#sl-arpu', 'arpuAnnual');
    bindSlider('#sl-cac', 'cac');
    bindSlider('#sl-churn', 'annualChurnRate');
  };

  updateView();
}

// Auto-mount when loaded on /pages/analyze/consulting-workbench.html
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('wb-consulting-root');
    if (root) {
      const bannerEl = document.getElementById('analyze-target-banner');
      mountTargetBanner(bannerEl, () => renderConsultingWorkbench(root));
      renderConsultingWorkbench(root);
    }
  });
}
