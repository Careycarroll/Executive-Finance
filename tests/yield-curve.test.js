// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create, CURVE_PRESETS } from '../js/tools/yield-curve.js';

describe('Tool: yield-curve (ADR-0003 contract & Bodie Ch. 15)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders and mounts yield curve with positive 10Y-2Y spread', () => {
    const tool = create(container);

    const spreadEl = container.querySelector('#yc-spread-val');
    const rate10YEl = container.querySelector('#yc-10y-val');
    const rate2YEl = container.querySelector('#yc-2y-val');

    expect(spreadEl).not.toBeNull();
    expect(rate10YEl).not.toBeNull();
    expect(rate2YEl).not.toBeNull();

    const spread = parseFloat(spreadEl.textContent);
    expect(spread).toBeGreaterThan(0); // Normal curve has positive slope

    tool.destroy();
  });

  it('switches to inverted yield curve preset and displays negative spread', () => {
    const tool = create(container);

    const invBtn = container.querySelector('.yc-preset-btn[data-preset="inverted"]');
    expect(invBtn).not.toBeNull();
    invBtn.click();

    const spreadEl = container.querySelector('#yc-spread-val');
    const spread = parseFloat(spreadEl.textContent);
    expect(spread).toBeLessThan(0); // Inverted curve has negative 10Y-2Y spread

    tool.destroy();
  });

  it('updates live when parallel shift slider is adjusted', () => {
    const tool = create(container);

    const initialMetrics = tool.getMetrics();
    const initial10Y = initialMetrics.rate10Y;

    const shiftSlider = container.querySelector('#yc-shift-slider');
    shiftSlider.value = '100'; // +100 bps
    shiftSlider.dispatchEvent(new Event('input'));

    const updatedMetrics = tool.getMetrics();
    expect(updatedMetrics.rate10Y).toBeCloseTo(initial10Y + 0.01, 3);

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container);

    tool.update({
      shift_bps: 50,
    });

    const metrics = tool.getMetrics();
    expect(metrics.shiftBps).toBe(50);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});

