// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create, evaluateGreek } from '../js/tools/greeks-visualizer.js';

describe('Tool: greeks-visualizer (ADR-0003 contract & Hull Ch. 19)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('evaluates call and put delta obeying put-call delta relationship', () => {
    const callDelta = evaluateGreek('delta', 100, 100, 0.05, 0.20, 1.0, true);
    const putDelta = evaluateGreek('delta', 100, 100, 0.05, 0.20, 1.0, false);

    expect(callDelta).toBeGreaterThan(0.5);
    expect(callDelta).toBeLessThan(0.7);
    expect(putDelta).toBeCloseTo(callDelta - 1, 4);
  });

  it('renders and mounts greeks-visualizer in DOM', () => {
    const tool = create(container, {
      greek: 'delta',
      spot: 100,
      strike: 100,
      rate: 0.05,
      vol: 0.20,
      time_to_expiry: 1.0,
      option_type: 'call',
    });

    const metricEl = container.querySelector('#gv-metric-val');
    expect(metricEl).not.toBeNull();
    const val = parseFloat(metricEl.textContent);
    expect(val).toBeGreaterThan(0.5);
    expect(val).toBeLessThan(0.7);

    // Check tabs
    const tabs = container.querySelectorAll('.gv-greek-tab');
    expect(tabs.length).toBe(7); // delta, gamma, theta, vega, rho, charm, vanna

    tool.destroy();
  });

  it('switches greek tab to gamma and updates readout', () => {
    const tool = create(container, {
      greek: 'delta',
      spot: 100,
      strike: 100,
    });

    const gammaTab = container.querySelector('.gv-greek-tab[data-greek="gamma"]');
    expect(gammaTab).not.toBeNull();
    gammaTab.click();

    const metricEl = container.querySelector('#gv-metric-val');
    const gammaVal = parseFloat(metricEl.textContent);
    expect(gammaVal).toBeGreaterThan(0); // Gamma is always positive for long options

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container);

    tool.update({
      greek: 'vega',
      spot: 100,
      strike: 100,
      vol: 0.25,
    });

    const plotData = tool.getPlotData();
    expect(plotData.greekKey).toBe('vega');
    expect(plotData.vol).toBe(0.25);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});

