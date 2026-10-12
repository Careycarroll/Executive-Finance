import { describe, it, expect } from 'vitest';
import {
  normCdf,
  normPdf,
  calcD1D2,
  blackScholesCall,
  blackScholesPut,
  blackScholesGreeks,
  presentValue,
  futureValue,
  annuityPV,
  growingAnnuityPV,
  npv,
  irr,
  discountedCashFlows,
  paybackPeriod,
  bondPrice,
  macaulayDuration,
  modifiedDuration,
  bondConvexity,
  priceChangeApprox,
  costOfEquityCAPM,
  wacc,
  annualTaxShield,
  reformulateBalanceSheet,
  reformulateIncomeStatement,
  penmanROEDecomposition,
  dupont3Way,
} from '../js/lib/finance-math/index.js';

describe('Black-Scholes Option Pricing (Hull Ch. 15)', () => {
  it('evaluates standard normal CDF accurately', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 6);
    expect(normCdf(1.96)).toBeCloseTo(0.975002, 4);
    expect(normCdf(-1.96)).toBeCloseTo(0.024998, 4);
  });

  it('matches Hull textbook Example 15.6 golden test vector', () => {
    // S=42, K=40, r=0.10, vol=0.20, T=0.5
    const spot = 42;
    const strike = 40;
    const rate = 0.10;
    const vol = 0.20;
    const time = 0.5;

    const { d1, d2 } = calcD1D2(spot, strike, rate, vol, time);
    expect(d1).toBeCloseTo(0.7693, 3);
    expect(d2).toBeCloseTo(0.6279, 3);

    const call = blackScholesCall(spot, strike, rate, vol, time);
    const put = blackScholesPut(spot, strike, rate, vol, time);

    // Hull text: c = 4.76, p = 0.81
    expect(call).toBeCloseTo(4.76, 2);
    expect(put).toBeCloseTo(0.81, 2);

    // Put-call parity: C - P = S - K * exp(-rT)
    const parityDiff = call - put;
    const theoreticalDiff = spot - strike * Math.exp(-rate * time);
    expect(parityDiff).toBeCloseTo(theoreticalDiff, 4);
  });

  it('matches At-The-Money 1-year golden test vector', () => {
    const call = blackScholesCall(100, 100, 0.05, 0.20, 1.0);
    const put = blackScholesPut(100, 100, 0.05, 0.20, 1.0);

    expect(call).toBeCloseTo(10.45, 2);
    expect(put).toBeCloseTo(5.57, 2);
  });

  it('computes Black-Scholes Greeks correctly', () => {
    const greeks = blackScholesGreeks(100, 100, 0.05, 0.20, 1.0);
    expect(greeks.callDelta).toBeGreaterThan(0.5);
    expect(greeks.callDelta).toBeLessThan(0.7);
    expect(greeks.putDelta).toBeCloseTo(greeks.callDelta - 1, 6);
    expect(greeks.gamma).toBeGreaterThan(0);
    expect(greeks.vega).toBeGreaterThan(0);
    expect(greeks.callTheta).toBeLessThan(0); // time decay is negative
  });

  it('handles edge case: zero time to expiry returns intrinsic value', () => {
    expect(blackScholesCall(105, 100, 0.05, 0.20, 0)).toBe(5);
    expect(blackScholesCall(95, 100, 0.05, 0.20, 0)).toBe(0);
    expect(blackScholesPut(95, 100, 0.05, 0.20, 0)).toBe(5);
    expect(blackScholesPut(105, 100, 0.05, 0.20, 0)).toBe(0);
  });
});

describe('Time Value of Money & Cash Flows (Hawawini Ch. 2; Bodie Ch. 5)', () => {
  it('computes PV and FV', () => {
    expect(presentValue(1000, 0.10, 3)).toBeCloseTo(751.31, 2);
    expect(futureValue(751.3148, 0.10, 3)).toBeCloseTo(1000, 2);
  });

  it('computes ordinary annuity PV', () => {
    // $100/yr for 5 yrs at 8%
    expect(annuityPV(100, 0.08, 5)).toBeCloseTo(399.27, 2);
  });

  it('computes growing annuity PV', () => {
    // C1=100, r=10%, g=3%, 5 years
    expect(growingAnnuityPV(100, 0.10, 0.03, 5)).toBeCloseTo(400.26, 2);
  });

  it('calculates NPV and stream details', () => {
    const cashFlows = [-1000, 300, 400, 500];
    const rate = 0.10;
    const npvVal = npv(rate, cashFlows);
    expect(npvVal).toBeCloseTo(-21.04, 2);

    const stream = discountedCashFlows(cashFlows, rate);
    expect(stream).toHaveLength(4);
    expect(stream[0].pv).toBe(-1000);
    expect(stream[1].pv).toBeCloseTo(272.73, 2);
    expect(stream[3].cumPv).toBeCloseTo(-21.04, 2);
  });

  it('calculates IRR with sign changes', () => {
    const cashFlows = [-100, 50, 60];
    const irrVal = irr(cashFlows);
    expect(irrVal).not.toBeNull();
    expect(irrVal).toBeCloseTo(0.0639, 3);
    // NPV at IRR should equal 0
    expect(npv(irrVal, cashFlows)).toBeCloseTo(0, 5);
  });

  it('calculates payback period', () => {
    const cashFlows = [-1000, 400, 400, 400];
    const pb = paybackPeriod(cashFlows);
    expect(pb).toBeCloseTo(2.5, 2); // 2 years + 200/400
  });
});

describe('Bond Pricing & Duration (Bodie Ch. 14, 16)', () => {
  it('prices an annual coupon bond at par when YTM equals coupon', () => {
    const price = bondPrice(1000, 0.08, 0.08, 10, 1);
    expect(price).toBeCloseTo(1000, 2);
  });

  it('matches 3-year annual bond Bodie golden test vector', () => {
    // Face=1000, Coupon=8%, YTM=10%, 3 years, annual
    const price = bondPrice(1000, 0.08, 0.10, 3, 1);
    expect(price).toBeCloseTo(950.26, 2);

    const macD = macaulayDuration(1000, 0.08, 0.10, 3, 1);
    expect(macD).toBeCloseTo(2.777, 2);

    const modD = modifiedDuration(1000, 0.08, 0.10, 3, 1);
    expect(modD).toBeCloseTo(2.525, 2);
  });

  it('computes convexity and price change approximation', () => {
    const modD = 2.525;
    const convexity = 9.2;
    const deltaYtm = 0.01; // +100 bps
    const change = priceChangeApprox(modD, convexity, deltaYtm);
    expect(change).toBeCloseTo(-0.02525 + 0.5 * 9.2 * 0.0001, 5);
  });
});

describe('WACC and Cost of Capital (Hawawini Ch. 11, 12)', () => {
  it('computes CAPM cost of equity', () => {
    // Rf=4%, Beta=1.2, Rm=10% (MRP = 6%)
    const ke = costOfEquityCAPM(0.04, 1.2, 0.10);
    expect(ke).toBeCloseTo(0.112, 4); // 11.2%
  });

  it('computes WACC with debt tax shield', () => {
    // Equity=600, Debt=400 (V=1000), Ke=12%, Kd=6%, Tax=25%
    const w = wacc(600, 400, 0.12, 0.06, 0.25);
    // 0.6 * 0.12 + 0.4 * 0.06 * (1 - 0.25) = 0.072 + 0.018 = 0.090 (9.0%)
    expect(w).toBeCloseTo(0.09, 4);
  });

  it('computes annual tax shield', () => {
    expect(annualTaxShield(400, 0.06, 0.25)).toBe(6);
  });
});

describe('Penman Reformulated Financial Statements & ROE (Penman Ch. 8, 11)', () => {
  it('reformulates balance sheet into NOA, NFO, and CSE', () => {
    const bs = reformulateBalanceSheet({
      operatingAssets: 1000,
      operatingLiabilities: 300,
      financialLiabilities: 400,
      financialAssets: 100,
    });

    expect(bs.noa).toBe(700);
    expect(bs.nfo).toBe(300);
    expect(bs.cse).toBe(400);
    // Fundamental Penman identity: CSE = NOA - NFO
    expect(bs.cse).toBe(bs.noa - bs.nfo);
  });

  it('reformulates income statement into OI, NFE, and CI', () => {
    const is = reformulateIncomeStatement({
      operatingIncome: 140,
      netFinancialExpense: 24,
    });

    expect(is.comprehensiveIncome).toBe(116);
  });

  it('matches Penman ROE decomposition textbook golden test vector', () => {
    const decomp = penmanROEDecomposition({
      noa: 700,
      nfo: 300,
      cse: 400,
      operatingIncome: 140,
      netFinancialExpense: 24,
    });

    expect(decomp.rnoa).toBeCloseTo(0.20, 4); // 20.0%
    expect(decomp.nbc).toBeCloseTo(0.08, 4);  // 8.0%
    expect(decomp.spread).toBeCloseTo(0.12, 4); // 12.0%
    expect(decomp.flev).toBeCloseTo(0.75, 4); // 0.75
    expect(decomp.leverageEffect).toBeCloseTo(0.09, 4); // 9.0%
    expect(decomp.roe).toBeCloseTo(0.29, 4); // 29.0%
    expect(decomp.isLeverageFavorable).toBe(true);

    // Cross-check with CI / CSE: 116 / 400 = 29.0%
    expect(decomp.roe).toBeCloseTo(116 / 400, 4);
  });

  it('computes traditional DuPont 3-way ROE', () => {
    const dp = dupont3Way({
      netIncome: 116,
      sales: 1000,
      totalAssets: 1100,
      equity: 400,
    });

    expect(dp.profitMargin).toBeCloseTo(0.116, 4);
    expect(dp.assetTurnover).toBeCloseTo(1000 / 1100, 4);
    expect(dp.equityMultiplier).toBeCloseTo(1100 / 400, 4);
    expect(dp.roe).toBeCloseTo(116 / 400, 4);
  });
});
