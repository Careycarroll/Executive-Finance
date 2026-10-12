// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from '../js/tools/sensitivity-panel.js';

describe('Tool: sensitivity-panel (ADR-0003 contract)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders and calculates Black-Scholes call option price golden test vector', () => {
    // S=42, K=40, r=0.10, vol=0.20, time=0.5 -> Call ≈ $4.76
    const tool = create(container, {
      compute: 'black-scholes',
      spot: 42,
      strike: 40,
      rate: 0.10,
      vol: 0.20,
      time: 0.5,
    });

    const primaryEl = container.querySelector('#sp-primary-value');
    expect(primaryEl).not.toBeNull();
    expect(primaryEl.textContent.trim()).toBe('$4.76');

    // Check sliders are rendered
    const spotSlider = container.querySelector('#sp-slider-spot');
    expect(spotSlider).not.toBeNull();
    expect(Number(spotSlider.value)).toBe(42);

    tool.destroy();
  });

  it('updates live when slider values change', () => {
    const tool = create(container, {
      compute: 'black-scholes',
      spot: 100,
      strike: 100,
      rate: 0.05,
      vol: 0.20,
      time: 1.0,
    });

    const primaryEl = container.querySelector('#sp-primary-value');
    expect(primaryEl.textContent.trim()).toBe('$10.45');

    // Simulate user moving spot slider to 110
    const spotSlider = container.querySelector('#sp-slider-spot');
    spotSlider.value = '110';
    spotSlider.dispatchEvent(new Event('input'));

    // Option becomes ITM, call price rises
    expect(primaryEl.textContent.trim()).toBe('$17.66');

    tool.destroy();
  });

  it('supports WACC compute mode with Hawawini golden values', () => {
    // E=600, D=400, Ke=12%, Kd=6%, Tax=25% -> WACC = 9.00%
    const tool = create(container, {
      compute: 'wacc',
      equityVal: 600,
      debtVal: 400,
      costOfEquity: 0.12,
      costOfDebt: 0.06,
      taxRate: 0.25,
    });

    const primaryEl = container.querySelector('#sp-primary-value');
    expect(primaryEl.textContent.trim()).toBe('9.00%');

    tool.destroy();
  });

  it('supports bond duration compute mode with Bodie golden values', () => {
    // Face=1000, Coupon=8%, YTM=10%, 3 years, annual -> ModD = 2.53 yrs
    const tool = create(container, {
      compute: 'duration',
      face: 1000,
      couponRate: 0.08,
      ytm: 0.10,
      years: 3,
      freq: 1,
    });

    const primaryEl = container.querySelector('#sp-primary-value');
    expect(primaryEl.textContent.trim()).toBe('2.52 yrs');

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container, {
      compute: 'black-scholes',
      spot: 100,
      strike: 100,
      rate: 0.05,
      vol: 0.20,
      time: 1.0,
    });

    expect(container.querySelector('#sp-primary-value').textContent.trim()).toBe('$10.45');

    // Preset update
    tool.update({ spot: 120, strike: 100, rate: 0.05, vol: 0.20, time: 0.5 });
    expect(container.querySelector('#sp-primary-value').textContent.trim()).toBe('$22.95');

    // Destroy
    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});
