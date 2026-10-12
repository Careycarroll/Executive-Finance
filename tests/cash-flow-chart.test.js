// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from '../js/tools/cash-flow-chart.js';

describe('Tool: cash-flow-chart (ADR-0003 contract)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders and computes NPV, IRR, and metrics from Hawawini cash flows', () => {
    // Initial -1000, followed by 300, 400, 500 at 10% discount rate
    const tool = create(container, {
      cash_flows: [-1000, 300, 400, 500],
      discount_rate: 0.10,
      growth_rate: 0.00,
    });

    const npvEl = container.querySelector('#cfc-npv-val');
    const irrEl = container.querySelector('#cfc-irr-val');
    const nomEl = container.querySelector('#cfc-nominal-val');

    expect(npvEl).not.toBeNull();
    expect(npvEl.textContent.trim()).toBe('-$21'); // NPV ≈ -21.04
    expect(irrEl.textContent.trim()).toBe('8.9%'); // IRR ≈ 8.9%
    expect(nomEl.textContent.trim()).toBe('$200'); // -1000 + 300 + 400 + 500 = 200

    tool.destroy();
  });

  it('updates live when discount rate slider is adjusted', () => {
    const tool = create(container, {
      cash_flows: [-1000, 300, 400, 500],
      discount_rate: 0.10,
    });

    const npvEl = container.querySelector('#cfc-npv-val');
    expect(npvEl.textContent.trim()).toBe('-$21');

    // Lower discount rate to 5%
    const rateSlider = container.querySelector('#cfc-rate-slider');
    rateSlider.value = '0.05';
    rateSlider.dispatchEvent(new Event('input'));

    // At 5%, NPV = -1000 + 300/1.05 + 400/1.05^2 + 500/1.05^3 = -1000 + 285.71 + 362.81 + 431.92 = +$80
    expect(npvEl.textContent.trim()).toBe('$80');

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container, {
      cash_flows: [-1000, 200, 200, 200, 200, 200, 200],
      discount_rate: 0.10,
    });

    // Update with positive NPV project
    tool.update({
      cash_flows: [-500, 200, 200, 200],
      discount_rate: 0.08,
    });

    const npvEl = container.querySelector('#cfc-npv-val');
    // PV = 200 * (1 - 1.08^-3)/0.08 = 200 * 2.577 = 515.42 -> NPV = +15
    expect(npvEl.textContent.trim()).toBe('$15');

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});
