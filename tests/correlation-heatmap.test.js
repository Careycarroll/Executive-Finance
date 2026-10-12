/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  create,
  getCorrelationColor,
  getTextColorForCorr,
  HEATMAP_PRESETS,
} from '../js/tools/correlation-heatmap.js';
import {
  calcAverageCorrelation,
  calcPortfolioDiversification,
} from '../js/lib/finance-math/portfolio.js';

describe('Correlation Math: Bodie Ch. 7 & Diversification Index', () => {
  it('interpolates colors correctly across -1.0 to +1.0 domain', () => {
    const blue = getCorrelationColor(-1.0);
    const white = getCorrelationColor(0.0);
    const red = getCorrelationColor(1.0);

    expect(blue).toBe('rgb(30, 64, 175)');
    expect(white).toBe('rgb(248, 250, 252)');
    expect(red).toBe('rgb(185, 28, 28)');

    expect(getTextColorForCorr(1.0)).toBe('#ffffff');
    expect(getTextColorForCorr(-1.0)).toBe('#ffffff');
    expect(getTextColorForCorr(0.0)).toBe('#1e293b');
  });

  it('calculates average pairwise correlation correctly on Bodie core matrix', () => {
    // 4 assets: (SPY, TLT, GLD, VNQ)
    // Off-diagonal pairs:
    // (0,1): -0.30
    // (0,2): 0.10
    // (0,3): 0.60
    // (1,2): 0.20
    // (1,3): -0.10
    // (2,3): 0.15
    // Sum = -0.30 + 0.10 + 0.60 + 0.20 - 0.10 + 0.15 = 0.65
    // Pairs count = 4*3/2 = 6
    // Average correlation = 0.65 / 6 ≈ 0.10833
    const matrix = HEATMAP_PRESETS.bodie_core.matrix;
    const avgCorr = calcAverageCorrelation(matrix);
    expect(avgCorr).toBeCloseTo(0.10833, 4);
  });

  it('demonstrates diversification power: perfect hedge (rho = -1) vs perfect comovement (rho = +1)', () => {
    const hedgeMatrix = [
      [1.0, -1.0],
      [-1.0, 1.0],
    ];
    const hedgeRes = calcPortfolioDiversification(hedgeMatrix, [0.20, 0.20]);
    // Portfolio vol with equal weight and rho = -1 is exactly 0
    expect(hedgeRes.portVol).toBeCloseTo(0.0, 5);
    expect(hedgeRes.avgCorr).toBe(-1.0);
    expect(hedgeRes.divBenefitPct).toBe(200);

    const comoveMatrix = [
      [1.0, 1.0],
      [1.0, 1.0],
    ];
    const comoveRes = calcPortfolioDiversification(comoveMatrix, [0.20, 0.20]);
    expect(comoveRes.portVol).toBeCloseTo(0.20, 5);
    expect(comoveRes.divRatio).toBeCloseTo(1.0, 5);
    expect(comoveRes.avgCorr).toBe(1.0);
    expect(comoveRes.divBenefitPct).toBe(0);
  });
});

describe('Tool: correlation-heatmap (ADR-0003 contract)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('requires a container element', () => {
    expect(() => create(null)).toThrow('correlation-heatmap requires a container element');
  });

  it('initializes and mounts in DOM with default configuration', () => {
    const tool = create(container);
    expect(container.querySelector('.correlation-heatmap-widget')).not.toBeNull();

    const cells = container.querySelectorAll('.heatmap-cell');
    // 4x4 grid has 16 cells
    expect(cells.length).toBe(16);

    const kpiAvgCorr = container.querySelector('#kpi-avg-corr');
    expect(kpiAvgCorr).not.toBeNull();
    expect(kpiAvgCorr.textContent.trim()).toBe('+0.11');

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('updates state dynamically via update() method', () => {
    const tool = create(container);

    tool.update({
      assets: ['Stock A', 'Stock B', 'Stock C'],
      matrix: [
        [1.0, 0.5, -0.2],
        [0.5, 1.0, 0.3],
        [-0.2, 0.3, 1.0],
      ],
      vols: [0.25, 0.20, 0.15],
    });

    const cells = container.querySelectorAll('.heatmap-cell');
    expect(cells.length).toBe(9); // 3x3 grid

    const state = tool.getState();
    expect(state.assets.length).toBe(3);
    expect(state.matrix[0][1]).toBe(0.5);

    tool.destroy();
  });
});

