/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create, MULTIPLES_PRESETS } from '../js/tools/multiples-table.js';
import {
  harmonicMean,
  arithmeticMean,
  median,
  compSummaryStats,
  impliedValuationForMetric,
  computeValuationRanges,
} from '../js/lib/finance-math/multiples.js';

describe('Financial Math: multiples.js (Easton, Lundholm, Damodaran)', () => {
  it('calculates arithmetic and harmonic mean correctly with textbook vector', () => {
    // Vector: [10, 12, 15]
    // Arithmetic: (10 + 12 + 15) / 3 = 37 / 3 ≈ 12.3333
    // Harmonic: 3 / (1/10 + 1/12 + 1/15) = 3 / (0.10 + 0.083333 + 0.066667) = 3 / 0.25 = 12.0000
    const vals = [10, 12, 15];
    expect(arithmeticMean(vals)).toBeCloseTo(12.3333, 4);
    expect(harmonicMean(vals)).toBeCloseTo(12.0000, 4);
    expect(median(vals)).toBe(12);
  });

  it('demonstrates that harmonic mean is <= arithmetic mean (mitigating upward ratio bias)', () => {
    const skewedMultiples = [10, 15, 20, 50]; // Outlier multiple at 50x
    const arith = arithmeticMean(skewedMultiples); // (95 / 4) = 23.75
    const harm = harmonicMean(skewedMultiples); // 4 / (0.1 + 0.0667 + 0.05 + 0.02) = 4 / 0.23667 ≈ 16.90
    expect(harm).toBeLessThan(arith);
    expect(arith).toBeCloseTo(23.75, 2);
    expect(harm).toBeCloseTo(16.9014, 2);
  });

  it('calculates implied enterprise value and equity value accurately', () => {
    const target = { ebitda: 100, earnings: 60, book_value: 400, net_debt: 50 };

    // EV / EBITDA of 10.0x:
    // Implied EV = 100 * 10 = 1000
    // Implied Equity = 1000 - 50 = 950
    const evResult = impliedValuationForMetric({
      metricKey: 'ev_ebitda',
      multipleValue: 10.0,
      target,
    });
    expect(evResult.impliedEV).toBe(1000);
    expect(evResult.impliedEquity).toBe(950);

    // P / E of 20.0x:
    // Implied Equity = 60 * 20 = 1200
    // Implied EV = 1200 + 50 = 1250
    const peResult = impliedValuationForMetric({
      metricKey: 'pe',
      multipleValue: 20.0,
      target,
    });
    expect(peResult.impliedEquity).toBe(1200);
    expect(peResult.impliedEV).toBe(1250);

    // P / B of 2.5x:
    // Implied Equity = 400 * 2.5 = 1000
    const pbResult = impliedValuationForMetric({
      metricKey: 'pb',
      multipleValue: 2.5,
      target,
    });
    expect(pbResult.impliedEquity).toBe(1000);
  });

  it('computes multi-multiple valuation ranges and weighted blend', () => {
    const target = { ebitda: 100, earnings: 60, book_value: 400, net_debt: 50, shares: 20 };
    const comps = [
      { name: 'Comp A', ev_ebitda: 10, pe: 18, pb: 2.0 },
      { name: 'Comp B', ev_ebitda: 12, pe: 20, pb: 2.5 },
    ];
    const weights = { ev_ebitda: 0.5, pe: 0.5, pb: 0.0 };

    const valSummary = computeValuationRanges({
      target,
      comps,
      weights,
      meanType: 'arithmetic',
    });

    // EV/EBITDA mean = 11. Implied EV = 1100, Implied Equity = 1050
    // P/E mean = 19. Implied Equity = 60 * 19 = 1140
    // Blended Equity = 0.5 * 1050 + 0.5 * 1140 = 525 + 570 = 1095
    expect(valSummary.metrics.ev_ebitda.mid.impliedEquity).toBe(1050);
    expect(valSummary.metrics.pe.mid.impliedEquity).toBe(1140);
    expect(valSummary.blended.equity.mid).toBe(1095);

    // Implied share price: 1095 / 20 = 54.75
    expect(valSummary.blended.impliedSharePrice).toBeCloseTo(54.75, 2);
  });
});

describe('Tool: multiples-table (ADR-0003 contract)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('requires a container element', () => {
    expect(() => create(null)).toThrow('multiples-table requires a container element');
  });

  it('initializes and mounts in DOM with default configuration', () => {
    const tool = create(container);
    expect(container.querySelector('.multiples-table-widget')).not.toBeNull();
    expect(container.querySelector('#comps-table-body')).not.toBeNull();
    expect(container.querySelector('#kpi-blended-equity')).not.toBeNull();

    const state = tool.getState();
    expect(state.comps.length).toBeGreaterThanOrEqual(3);
    expect(state.target.ebitda).toBe(100);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('updates target fundamentals and recalculates implied equity', () => {
    const tool = create(container, {
      target: { ebitda: 100, earnings: 60, book_value: 400, net_debt: 50, shares: 10 },
    });

    const initKpi = container.querySelector('#kpi-blended-equity').textContent;

    // Double EBITDA and Earnings
    tool.update({
      target: { ebitda: 200, earnings: 120, book_value: 800 },
    });

    const newKpi = container.querySelector('#kpi-blended-equity').textContent;
    expect(newKpi).not.toEqual(initKpi);

    const state = tool.getState();
    expect(state.target.ebitda).toBe(200);
    tool.destroy();
  });

  it('supports updating peers and weights', () => {
    const tool = create(container);
    tool.update({
      comps: [
        { name: 'Specialty Peer 1', ev_ebitda: 15.0, pe: 25.0, pb: 3.5 },
        { name: 'Specialty Peer 2', ev_ebitda: 18.0, pe: 30.0, pb: 4.0 },
      ],
      weights: { ev_ebitda: 0.7, pe: 0.3, pb: 0.0 },
      meanType: 'harmonic',
    });

    const state = tool.getState();
    expect(state.comps.length).toBe(2);
    expect(state.weights.ev_ebitda).toBe(0.7);
    tool.destroy();
  });
});
