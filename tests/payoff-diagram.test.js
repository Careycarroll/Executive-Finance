// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  create,
  calcExpiryPayoff,
  calcCurrentValue,
  STRATEGY_PRESETS,
} from '../js/tools/payoff-diagram.js';

describe('Tool: payoff-diagram (ADR-0003 contract & Hull Ch. 11/12)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('calculates long call expiry payoff and breakeven accurately', () => {
    const legs = [{ type: 'call', strike: 100, premium: 5, qty: 1 }];

    expect(calcExpiryPayoff(90, legs)).toBe(-5);
    expect(calcExpiryPayoff(100, legs)).toBe(-5);
    expect(calcExpiryPayoff(105, legs)).toBe(0); // Breakeven at 105
    expect(calcExpiryPayoff(120, legs)).toBe(15);
  });

  it('matches Hull textbook Bull Call Spread golden test vector', () => {
    // Buy 100 Call for 5, Sell 110 Call for 2 -> Net debit 3
    const legs = [
      { type: 'call', strike: 100, premium: 5, qty: 1 },
      { type: 'call', strike: 110, premium: 2, qty: -1 },
    ];

    expect(calcExpiryPayoff(90, legs)).toBe(-3);
    expect(calcExpiryPayoff(100, legs)).toBe(-3);
    expect(calcExpiryPayoff(103, legs)).toBe(0); // Breakeven at 103
    expect(calcExpiryPayoff(110, legs)).toBe(7); // Max profit 7
    expect(calcExpiryPayoff(130, legs)).toBe(7);
  });

  it('renders Bull Call Spread summary badges in DOM', () => {
    const tool = create(container, {
      spot: 100,
      legs: [
        { type: 'call', strike: 100, premium: 5, qty: 1 },
        { type: 'call', strike: 110, premium: 2, qty: -1 },
      ],
      time_to_expiry: 0.25,
    });

    const maxProfitEl = container.querySelector('#pd-max-profit');
    const maxLossEl = container.querySelector('#pd-max-loss');
    const beEl = container.querySelector('#pd-breakeven');
    const premEl = container.querySelector('#pd-net-premium');

    expect(maxProfitEl).not.toBeNull();
    expect(maxProfitEl.textContent.trim()).toBe('$7.00');
    expect(maxLossEl.textContent.trim()).toBe('-$3.00');
    expect(beEl.textContent.trim()).toBe('$103.0');
    expect(premEl.textContent.trim()).toBe('Debit: $3.00');

    tool.destroy();
  });

  it('calculates current value curve converging to expiry as T approaches 0', () => {
    const legs = [{ type: 'call', strike: 100, premium: 5, qty: 1 }];
    const rate = 0.05;
    const vol = 0.20;

    const valFar = calcCurrentValue(100, legs, rate, vol, 1.0);
    const valNear = calcCurrentValue(100, legs, rate, vol, 0.05);
    const valZero = calcCurrentValue(100, legs, rate, vol, 0.0);

    // At ATM S=100, as T->0, call price approaches 0, so net payoff approaches -5
    expect(valFar).toBeGreaterThan(valNear);
    expect(valNear).toBeGreaterThan(valZero);
    expect(valZero).toBe(-5);
  });

  it('supports strategy preset switching, update(newConfig), and destroy()', () => {
    const tool = create(container, {
      spot: 100,
      legs: [{ type: 'call', strike: 100, premium: 5, qty: 1 }],
    });

    // Update to straddle
    const straddle = STRATEGY_PRESETS['straddle'];
    tool.update({
      spot: straddle.spot,
      legs: straddle.legs,
    });

    const premEl = container.querySelector('#pd-net-premium');
    expect(premEl.textContent.trim()).toBe('Debit: $10.00'); // 5 call + 5 put = 10 debit

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});
