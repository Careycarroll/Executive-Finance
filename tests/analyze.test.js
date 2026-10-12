import { describe, it, expect } from 'vitest';
import { SNAPSHOTS, SNAPSHOT_LIST, getSnapshot } from '../js/analyze/snapshots.js';
import { parseSecJsonToSnapshot, resolveSECLinks } from '../js/analyze/sec-api.js';
import { compute10KAnalysis, calcCAGR } from '../js/analyze/10k-analyzer.js';
import { computeStockValuation } from '../js/analyze/stock-valuator.js';
import { computeMAAnalysis, computeLBOModel, computeCapExModel } from '../js/analyze/deal-workbench.js';
import { computePortfolioRisk, computeOptionOverlay, blackScholesFull } from '../js/analyze/risk-analyzer.js';

describe('M7 Executive Analyze Suite & Workbenches', () => {
  describe('1. Pre-Loaded 10-K Snapshots & SEC EDGAR Parser', () => {
    it('provides 6 complete 5-year 10-K benchmark snapshots', () => {
      expect(SNAPSHOT_LIST.length).toBe(6);
      const tickers = SNAPSHOT_LIST.map(s => s.ticker);
      expect(tickers).toEqual(['AAPL', 'MSFT', 'COST', 'CAT', 'NEE', 'SAAS']);

      for (const snap of SNAPSHOT_LIST) {
        expect(snap.incomeStatements.length).toBeGreaterThanOrEqual(5);
        expect(snap.balanceSheets.length).toBeGreaterThanOrEqual(5);
        expect(snap.cashFlows.length).toBeGreaterThanOrEqual(5);
        expect(snap.profile.price).toBeGreaterThan(0);
        expect(snap.profile.marketCap).toBeGreaterThan(0);
      }
    });

    it('parses raw SEC EDGAR XBRL companyfacts JSON into a normalized snapshot', () => {
      const mockSecJson = {
        cik: '0000320193',
        entityName: 'Apple Inc.',
        facts: {
          'us-gaap': {
            Revenues: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 391035000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 383285000000 }
                ]
              }
            },
            NetIncomeLoss: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 93736000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 96995000000 }
                ]
              }
            },
            Assets: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 364980000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 352583000000 }
                ]
              }
            },
            StockholdersEquity: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 56950000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 62146000000 }
                ]
              }
            }
          }
        }
      };

      const parsed = parseSecJsonToSnapshot(mockSecJson, 'AAPL');
      expect(parsed.ticker).toBe('AAPL');
      expect(parsed.incomeStatements.length).toBe(2);
      expect(parsed.incomeStatements[0].revenue).toBeCloseTo(391035, 0);
      expect(parsed.incomeStatements[0].netIncome).toBeCloseTo(93736, 0);
    });

    it('resolves tickers and CIK numbers to SEC EDGAR XBRL CompanyFacts and search URLs', () => {
      const nvda = resolveSECLinks('nvda');
      expect(nvda.found).toBe(true);
      expect(nvda.cik).toBe('0001045810');
      expect(nvda.factsUrl).toBe('https://data.sec.gov/api/xbrl/companyfacts/CIK0001045810.json');

      const cikDirect = resolveSECLinks('320193');
      expect(cikDirect.found).toBe(true);
      expect(cikDirect.cik).toBe('0000320193');
      expect(cikDirect.factsUrl).toBe('https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json');

      const unknown = resolveSECLinks('ZZZZ');
      expect(unknown.found).toBe(false);
      expect(unknown.edgarSearchUrl).toBe('https://www.sec.gov/edgar/searchedgar/companysearch');
    });
  });

  describe('2. Workbench 1: 10-K & Penman FSA Analyzer', () => {
    it('satisfies Penman Reformulated Balance Sheet & Income Statement identities across all 6 snapshots', () => {
      for (const company of SNAPSHOT_LIST) {
        const res = compute10KAnalysis(company);
        expect(res.byYear.length).toBe(5);
        expect(res.healthScore).toBeGreaterThanOrEqual(0);
        expect(res.healthScore).toBeLessThanOrEqual(100);
        expect(res.flags.length).toBeGreaterThan(0);

        for (const yr of res.byYear) {
          // Identity 1: OA - OL = NOA
          expect(yr.OA - yr.OL).toBeCloseTo(yr.NOA, 2);
          // Identity 2: FO - FA = NFO
          expect(yr.FO - yr.FA).toBeCloseTo(yr.NFO, 2);
          // Identity 3: NOA - NFO = CSE (Common Stockholders' Equity)
          expect(yr.NOA - yr.NFO).toBeCloseTo(yr.cse, 1);
          // Identity 4: NOPAT (OI) - NFE = Net Income
          expect(yr.NOPAT - yr.NFE).toBeCloseTo(yr.ni, 2);
          // Identity 5: RNOA = OPM * NOAT (when NOA > 10)
          if (yr.NOA > 10) {
            expect(yr.OPM * yr.NOAT).toBeCloseTo(yr.RNOA, 4);
          }
        }
      }
    });

    it('flags high SBC dilution and accrual warnings on high-SBC SaaS snapshot', () => {
      const saas = getSnapshot('SAAS');
      const res = compute10KAnalysis(saas);
      expect(res.latest.sbcPctRev).toBeGreaterThan(0.15);
      const hasSbcDanger = res.flags.some(f => f.concept === 'stock-comp' && f.severity === 'danger');
      expect(hasSbcDanger).toBe(true);
    });
  });

  describe('3. Workbench 2: Multi-Method Stock & Valuation Triangulator', () => {
    it('computes WACC, 2-Stage DCF, 5x5 sensitivity matrix, Reverse DCF, and reconciles DCF EV with Penman ReOI EV', () => {
      for (const company of SNAPSHOT_LIST) {
        const val = computeStockValuation(company);
        expect(val.waccInputs.wacc).toBeGreaterThan(0.04);
        expect(val.waccInputs.wacc).toBeLessThan(0.18);
        expect(val.dcf.sharePriceGGM).toBeGreaterThan(0);
        expect(val.compositeTargetPrice).toBeGreaterThan(0);
        expect(val.sensitivityMatrix.length).toBe(5);
        expect(val.sensitivityMatrix[0].cells.length).toBe(5);

        // Clean-Surplus Equivalence: 2-Stage FCFF DCF Enterprise Value === Penman ReOI Enterprise Value
        expect(val.reoi.dcfReOIReconciliationDiff).toBeLessThan(0.01);
        expect(val.reoi.sharePriceReOI).toBeCloseTo(val.dcf.sharePriceGGM, 2);
      }
    });
  });

  describe('4. Workbench 3: Executive Deal & Capital Allocation Workbench', () => {
    it('computes M&A EPS accretion/dilution, break-even synergies, and Section 338(h)(10) 15-year tax shield PV', () => {
      const msft = getSnapshot('MSFT');
      const maWith338 = computeMAAnalysis(msft, { elect338h10: true, offerPremiumPct: 0.25 });
      const maNo338 = computeMAAnalysis(msft, { elect338h10: false, offerPremiumPct: 0.25 });

      expect(maWith338.offerEquityValue).toBeGreaterThan(maWith338.tgt.mktCap);
      expect(maWith338.pvTaxShield338).toBeGreaterThan(0);
      expect(maNo338.pvTaxShield338).toBe(0);
      expect(maWith338.proFormaEpsCash).toBeGreaterThan(maNo338.proFormaEpsCash);
    });

    it('computes 5-year LBO debt sweep, value creation attribution, and 2-and-20 GP/LP waterfall', () => {
      const cat = getSnapshot('CAT');
      const lbo = computeLBOModel(cat, { entryMult: 10.5, debtToEbitda: 5.0, exitMult: 11.5 });

      expect(lbo.schedule.length).toBe(5);
      expect(lbo.endingDebt).toBeLessThan(lbo.initialDebt);
      expect(lbo.grossMOIC).toBeGreaterThan(1.0);
      expect(lbo.grossIRR).toBeGreaterThan(lbo.waterfall.netLpIRR);
      expect(lbo.waterfall.gpCarriedInterest).toBeGreaterThan(0);
    });

    it('computes CapEx NPV, IRR, MIRR, annual EVA, and Black-Scholes Real Option value', () => {
      const aapl = getSnapshot('AAPL');
      const capex = computeCapExModel(aapl);

      expect(capex.schedule.length).toBe(5);
      expect(capex.realOptionExpandValue).toBeGreaterThan(0);
      expect(capex.expandedStrategicNPV).toBeCloseTo(capex.staticNPV + capex.realOptionExpandValue, 2);
    });
  });

  describe('5. Workbench 4: Portfolio & Derivative Risk Lab', () => {
    it('computes multi-asset portfolio volatility, Euler risk contributions summing to 100%, and VaR/CVaR hierarchy', () => {
      const aapl = getSnapshot('AAPL');
      const risk = computePortfolioRisk(aapl, { horizonDays: 10 });

      expect(risk.portVol).toBeLessThan(risk.weightedAvgVol);
      expect(risk.diversificationBenefit).toBeGreaterThan(0);

      // Euler risk shares sum to 1.0 (100%)
      const sumRiskShares = risk.assets.reduce((acc, a) => acc + a.riskSharePct, 0);
      expect(sumRiskShares).toBeCloseTo(1.0, 4);

      // Tail risk hierarchy: CVaR_99 > VaR_99 > VaR_95 > 0
      expect(risk.var95Dollar).toBeGreaterThan(0);
      expect(risk.var99Dollar).toBeGreaterThan(risk.var95Dollar);
      expect(risk.cvar99Dollar).toBeGreaterThan(risk.var99Dollar);
    });

    it('prices Black-Scholes option overlays and reduces downside crash losses via Collar and Protective Put', () => {
      const aapl = getSnapshot('AAPL');
      const collar = computeOptionOverlay(aapl, { strategy: 'collar', putOtmPct: 0.10, callOtmPct: 0.10 });
      const protPut = computeOptionOverlay(aapl, { strategy: 'protective-put', putOtmPct: 0.10 });

      expect(collar.netDeltaPerShare).toBeGreaterThan(0);
      expect(collar.netDeltaPerShare).toBeLessThan(1.0);
      // At a -25% market crash, both Collar and Protective Put lose much less than -25%
      expect(collar.crashPoint.hedgedPnlPct).toBeGreaterThan(-0.15);
      expect(protPut.crashPoint.hedgedPnlPct).toBeGreaterThan(-0.15);
    });
  });
});
