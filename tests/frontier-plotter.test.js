// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from '../js/tools/frontier-plotter.js';

describe('Tool: frontier-plotter (ADR-0003 contract & Bodie Ch. 6/7/8)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders and mounts efficient frontier metrics in DOM', () => {
    const tool = create(container, {
      assets: [
        { id: 'A', label: 'Equities', return: 0.10, vol: 0.20 },
        { id: 'B', label: 'Bonds', return: 0.05, vol: 0.10, corr_A: 0.20 },
      ],
      risk_free: 0.03,
    });

    const sharpeEl = container.querySelector('#fp-sharpe-val');
    const mvpVolEl = container.querySelector('#fp-mvp-vol-val');

    expect(sharpeEl).not.toBeNull();
    const sharpe = parseFloat(sharpeEl.textContent);
    expect(sharpe).toBeGreaterThan(0.35); // Tangency Sharpe > 0.35

    expect(mvpVolEl).not.toBeNull();
    expect(mvpVolEl.textContent.trim()).toBe('9.6%'); // MVP vol ≈ 9.56%

    tool.destroy();
  });

  it('updates live when correlation slider is adjusted', () => {
    const tool = create(container);

    const corrSlider = container.querySelector('#fp-corr-slider');
    expect(corrSlider).not.toBeNull();

    // Adjust correlation to -0.5 (strong negative correlation increases diversification)
    corrSlider.value = '-0.50';
    corrSlider.dispatchEvent(new Event('input'));

    const metrics = tool.getMetrics();
    expect(metrics.corr).toBe(-0.50);
    // Lower correlation drops MVP volatility even further
    expect(metrics.mvp.vol).toBeLessThan(0.08);

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container);

    tool.update({
      risk_free: 0.04,
    });

    const metrics = tool.getMetrics();
    expect(metrics.riskFree).toBe(0.04);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});

