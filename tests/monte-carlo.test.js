// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from '../js/tools/monte-carlo.js';

describe('Tool: monte-carlo (ADR-0003 contract & Hull Ch. 21/22)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders and mounts Monte Carlo metrics in DOM', () => {
    const tool = create(container, {
      s0: 100,
      drift: 0.08,
      vol: 0.20,
      horizon: 1.0,
      n_paths: 2000,
      seed: 42,
    });

    const meanEl = container.querySelector('#mc-mean-val');
    const varEl = container.querySelector('#mc-var-val');
    const cvarEl = container.querySelector('#mc-cvar-val');

    expect(meanEl).not.toBeNull();
    expect(varEl).not.toBeNull();
    expect(cvarEl).not.toBeNull();

    const mean = parseFloat(meanEl.textContent.replace('$', ''));
    const varVal = parseFloat(varEl.textContent.replace('$', ''));
    const cvarVal = parseFloat(cvarEl.textContent.replace('$', ''));

    expect(mean).toBeGreaterThan(100);
    expect(varVal).toBeGreaterThan(10);
    expect(cvarVal).toBeGreaterThan(varVal); // CVaR is strictly greater than VaR

    tool.destroy();
  });

  it('updates live when volatility slider is adjusted', () => {
    const tool = create(container, {
      s0: 100,
      vol: 0.20,
      seed: 42,
    });

    const initialSim = tool.getSimulation();
    const initialVar = initialSim.var95;

    // Double volatility to 40%
    const volSlider = container.querySelector('#mc-vol-slider');
    volSlider.value = '0.40';
    volSlider.dispatchEvent(new Event('input'));

    const updatedSim = tool.getSimulation();
    expect(updatedSim.var95).toBeGreaterThan(initialVar);

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container);

    tool.update({
      s0: 200,
      drift: 0.10,
    });

    const sim = tool.getSimulation();
    expect(sim.s0).toBe(200);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});
