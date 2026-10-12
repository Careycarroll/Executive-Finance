/**
 * payoff-diagram.js — Interactive multi-leg option strategy payoff visualizer
 * Renders expiration payoff profile, current Black-Scholes theoretical value curve,
 * breakeven points, and strategy risk/reward metrics.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import { Chart } from '../charts/chart-core.js';
import {
  blackScholesCall,
  blackScholesPut,
} from '../lib/finance-math/black-scholes.js';

/**
 * Standard strategy presets
 */
export const STRATEGY_PRESETS = {
  'long-call': {
    name: 'Long Call',
    spot: 100,
    legs: [{ type: 'call', strike: 100, premium: 5, qty: 1 }],
  },
  'protective-put': {
    name: 'Protective Put',
    spot: 100,
    legs: [
      { type: 'stock', strike: 100, premium: 0, qty: 1 },
      { type: 'put', strike: 100, premium: 5, qty: 1 },
    ],
  },
  'covered-call': {
    name: 'Covered Call',
    spot: 100,
    legs: [
      { type: 'stock', strike: 100, premium: 0, qty: 1 },
      { type: 'call', strike: 105, premium: 3, qty: -1 },
    ],
  },
  'bull-call-spread': {
    name: 'Bull Call Spread',
    spot: 100,
    legs: [
      { type: 'call', strike: 100, premium: 5, qty: 1 },
      { type: 'call', strike: 110, premium: 2, qty: -1 },
    ],
  },
  'bear-put-spread': {
    name: 'Bear Put Spread',
    spot: 100,
    legs: [
      { type: 'put', strike: 100, premium: 5, qty: 1 },
      { type: 'put', strike: 90, premium: 2, qty: -1 },
    ],
  },
  'straddle': {
    name: 'Long Straddle',
    spot: 100,
    legs: [
      { type: 'call', strike: 100, premium: 5, qty: 1 },
      { type: 'put', strike: 100, premium: 5, qty: 1 },
    ],
  },
  'iron-condor': {
    name: 'Iron Condor',
    spot: 100,
    legs: [
      { type: 'put', strike: 85, premium: 1, qty: 1 },
      { type: 'put', strike: 90, premium: 2.5, qty: -1 },
      { type: 'call', strike: 110, premium: 2.5, qty: -1 },
      { type: 'call', strike: 115, premium: 1, qty: 1 },
    ],
  },
};

/**
 * Calculate payoff at expiration for a given stock price S
 */
export function calcExpiryPayoff(spotAtExpiry, legs) {
  if (!Array.isArray(legs) || legs.length === 0) return 0;
  return legs.reduce((total, leg) => {
    const qty = leg.qty ?? 1;
    const strike = leg.strike ?? 100;
    const premium = leg.premium ?? 0;

    let legGross = 0;
    if (leg.type === 'call') {
      legGross = Math.max(0, spotAtExpiry - strike);
    } else if (leg.type === 'put') {
      legGross = Math.max(0, strike - spotAtExpiry);
    } else if (leg.type === 'stock') {
      legGross = spotAtExpiry - strike;
    }

    return total + qty * (legGross - premium);
  }, 0);
}

/**
 * Calculate current theoretical value via Black-Scholes for a given spot S
 */
export function calcCurrentValue(spot, legs, rate, vol, timeToExpiry) {
  if (!Array.isArray(legs) || legs.length === 0) return 0;
  if (timeToExpiry <= 0) {
    return calcExpiryPayoff(spot, legs);
  }

  return legs.reduce((total, leg) => {
    const qty = leg.qty ?? 1;
    const strike = leg.strike ?? 100;
    const premium = leg.premium ?? 0;

    let legModelVal = 0;
    if (leg.type === 'call') {
      legModelVal = blackScholesCall(spot, strike, rate, vol, timeToExpiry);
    } else if (leg.type === 'put') {
      legModelVal = blackScholesPut(spot, strike, rate, vol, timeToExpiry);
    } else if (leg.type === 'stock') {
      legModelVal = spot - strike;
    }

    return total + qty * (legModelVal - premium);
  }, 0);
}

/**
 * Canvas chart renderer extending Chart base class
 */
class PayoffCanvasChart extends Chart {
  constructor(canvasEl, options = {}) {
    super(canvasEl, {
      padding: { top: 30, right: 35, bottom: 45, left: 65 },
      ...options,
    });
    this.plotData = null;
  }

  setPlotData(plotData) {
    this.plotData = plotData;
    this.draw();
  }

  draw() {
    this.clear();
    if (!this.plotData) return;

    const {
      minSpot,
      maxSpot,
      minY,
      maxY,
      expiryPoints,
      currentPoints,
      spotCurrent,
      breakevens,
      showCurrent,
    } = this.plotData;

    const xTicks = this.niceTicks(minSpot, maxSpot, 7);
    const yTicks = this.niceTicks(minY, maxY, 6);

    this.drawGrid(xTicks, yTicks, minSpot, maxSpot, minY, maxY);
    this.drawAxes(xTicks, yTicks, minSpot, maxSpot, minY, maxY, 'Underlying Asset Price ($)', 'Profit / Loss ($)');

    const zeroY = this.yScale(0, minY, maxY);
    const ctx = this.ctx;

    // Draw zero P&L baseline
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(this.chartX, zeroY);
    ctx.lineTo(this.chartX + this.chartW, zeroY);
    ctx.stroke();
    ctx.restore();

    // Fill green above 0, red below 0 for expiration payoff
    if (expiryPoints.length > 1) {
      const screenExpiry = expiryPoints.map(p => ({
        x: this.xScale(p.spot, minSpot, maxSpot),
        y: this.yScale(p.payoff, minY, maxY),
      }));

      // Draw expiration line (bold dark slate)
      this.drawLine(screenExpiry, '#1e293b', 2.5);

      // Fill profit (green)
      ctx.save();
      ctx.beginPath();
      ctx.rect(this.chartX, this.chartY, this.chartW, zeroY - this.chartY);
      ctx.clip();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.beginPath();
      ctx.moveTo(screenExpiry[0].x, zeroY);
      screenExpiry.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(screenExpiry[screenExpiry.length - 1].x, zeroY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Fill loss (red)
      ctx.save();
      ctx.beginPath();
      ctx.rect(this.chartX, zeroY, this.chartW, this.chartY + this.chartH - zeroY);
      ctx.clip();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.beginPath();
      ctx.moveTo(screenExpiry[0].x, zeroY);
      screenExpiry.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(screenExpiry[screenExpiry.length - 1].x, zeroY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Draw Current Value curve (cyan / blue line)
    if (showCurrent && currentPoints && currentPoints.length > 1) {
      const screenCurrent = currentPoints.map(p => ({
        x: this.xScale(p.spot, minSpot, maxSpot),
        y: this.yScale(p.value, minY, maxY),
      }));
      this.drawLine(screenCurrent, '#0284c7', 2);
    }

    // Draw current spot reference line
    if (spotCurrent >= minSpot && spotCurrent <= maxSpot) {
      const currentX = this.xScale(spotCurrent, minSpot, maxSpot);
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(currentX, this.chartY);
      ctx.lineTo(currentX, this.chartY + this.chartH);
      ctx.stroke();

      this.drawLabelWithBackground(`Spot: $${spotCurrent}`, currentX, this.chartY + 12, '#4f46e5', {
        align: 'center',
        baseline: 'top',
        bg: 'rgba(238, 242, 255, 0.95)',
        border: '#c7d2fe',
      });
      ctx.restore();
    }

    // Mark Breakeven points
    breakevens.forEach(be => {
      if (be >= minSpot && be <= maxSpot) {
        const beX = this.xScale(be, minSpot, maxSpot);
        this.drawPoint(beX, zeroY, '#f59e0b', 4.5);
        this.drawLabelWithBackground(`BE: $${be.toFixed(2)}`, beX, zeroY - 8, '#b45309', {
          align: 'center',
          baseline: 'bottom',
          fontSize: 10,
          bg: '#fef3c7',
          border: '#fde68a',
        });
      }
    });

    // Hover tooltip
    if (this._mouse && this._inChartArea(this._mouse.x, this._mouse.y)) {
      const hSpot = this.xToValue(this._mouse.x, minSpot, maxSpot);
      const hExpiry = calcExpiryPayoff(hSpot, this.plotData.legs);
      const hCurrent = showCurrent
        ? calcCurrentValue(hSpot, this.plotData.legs, this.plotData.rate, this.plotData.vol, this.plotData.timeToExpiry)
        : null;

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this._mouse.x, this.chartY);
      ctx.lineTo(this._mouse.x, this.chartY + this.chartH);
      ctx.stroke();

      const lines = [
        `Spot: $${hSpot.toFixed(2)}`,
        `Expiry P&L: ${hExpiry >= 0 ? '+' : ''}$${hExpiry.toFixed(2)}`,
      ];
      if (hCurrent !== null) {
        lines.push(`Current P&L: ${hCurrent >= 0 ? '+' : ''}$${hCurrent.toFixed(2)}`);
      }

      const tw = 135;
      const th = lines.length * 16 + 12;
      const tx = this._mouse.x > this.chartX + this.chartW - 145 ? this._mouse.x - tw - 10 : this._mouse.x + 10;
      const ty = Math.max(this.chartY + 10, Math.min(this._mouse.y, this.chartY + this.chartH - th - 10));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, 4);
      ctx.fill();

      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      lines.forEach((l, i) => {
        ctx.fillText(l, tx + 8, ty + 6 + i * 16);
      });
      ctx.restore();
    }
  }
}

/**
 * Main factory per ADR-0003 contract
 */
export function create(container, config = {}) {
  if (!container) throw new Error('payoff-diagram requires a container element');

  let currentConfig = {
    spot: 100,
    legs: [
      { type: 'call', strike: 100, premium: 5, qty: 1 },
      { type: 'call', strike: 110, premium: 2, qty: -1 },
    ],
    show_current_value: true,
    vol: 0.20,
    rate: 0.05,
    time_to_expiry: 0.25,
    ...config,
  };

  if (config.showCurrentValue !== undefined) currentConfig.show_current_value = config.showCurrentValue;
  if (config.timeToExpiry !== undefined) currentConfig.time_to_expiry = config.timeToExpiry;

  let chartInstance = null;
  let listeners = [];

  function getMetrics() {
    const legs = currentConfig.legs || [];
    const strikes = legs.map(l => l.strike ?? 100);
    const centerSpot = currentConfig.spot || (strikes.length > 0 ? strikes[0] : 100);

    const minStrike = strikes.length > 0 ? Math.min(...strikes) : centerSpot;
    const maxStrike = strikes.length > 0 ? Math.max(...strikes) : centerSpot;

    const minSpot = Math.max(0, Math.min(centerSpot * 0.5, minStrike * 0.7));
    const maxSpot = Math.max(centerSpot * 1.5, maxStrike * 1.3);

    // Evaluate on a fine grid
    const nSteps = 120;
    const step = (maxSpot - minSpot) / nSteps;
    const expiryPoints = [];
    const currentPoints = [];

    let minPayoff = 0;
    let maxPayoff = 0;

    for (let i = 0; i <= nSteps; i++) {
      const s = minSpot + i * step;
      const expP = calcExpiryPayoff(s, legs);
      const curV = calcCurrentValue(s, legs, currentConfig.rate, currentConfig.vol, currentConfig.time_to_expiry);

      expiryPoints.push({ spot: s, payoff: expP });
      currentPoints.push({ spot: s, value: curV });

      minPayoff = Math.min(minPayoff, expP, curV);
      maxPayoff = Math.max(maxPayoff, expP, curV);
    }

    // Find breakevens
    const breakevens = [];
    for (let i = 0; i < expiryPoints.length - 1; i++) {
      const p1 = expiryPoints[i];
      const p2 = expiryPoints[i + 1];
      if ((p1.payoff <= 0 && p2.payoff >= 0) || (p1.payoff >= 0 && p2.payoff <= 0)) {
        if (Math.abs(p2.payoff - p1.payoff) > 1e-6) {
          const be = p1.spot - p1.payoff * ((p2.spot - p1.spot) / (p2.payoff - p1.payoff));
          breakevens.push(be);
        }
      }
    }

    // Check net premium
    const netPremium = legs.reduce((acc, l) => acc + (l.qty ?? 1) * (l.premium ?? 0), 0);

    // Estimate Max Profit and Max Loss
    const leftSlope = (calcExpiryExpirySlope(minSpot, legs));
    const rightSlope = (calcExpiryExpirySlope(maxSpot, legs));

    const isMaxProfitUncapped = rightSlope > 0.05 || leftSlope < -0.05;
    const isMaxLossUncapped = rightSlope < -0.05 || leftSlope > 0.05;

    const maxProfit = isMaxProfitUncapped ? 'Unlimited' : `$${maxPayoff.toFixed(2)}`;
    const maxLoss = isMaxLossUncapped ? 'Unlimited' : `-$${Math.abs(minPayoff).toFixed(2)}`;

    const span = Math.max(10, maxPayoff - minPayoff);
    const minY = minPayoff - span * 0.12;
    const maxY = maxPayoff + span * 0.12;

    return {
      minSpot,
      maxSpot,
      minY,
      maxY,
      expiryPoints,
      currentPoints,
      breakevens,
      netPremium,
      maxProfit,
      maxLoss,
      legs,
      spotCurrent: currentConfig.spot,
      rate: currentConfig.rate,
      vol: currentConfig.vol,
      timeToExpiry: currentConfig.time_to_expiry,
      showCurrent: currentConfig.show_current_value,
    };
  }

  function calcExpiryExpirySlope(spot, legs) {
    const delta = 1.0;
    const p1 = calcExpiryPayoff(spot, legs);
    const p2 = calcExpiryPayoff(spot + delta, legs);
    return (p2 - p1) / delta;
  }

  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const metrics = getMetrics();

    container.innerHTML = `
      <div class="pd-container" style="display: flex; flex-direction: column; gap: 1.25rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Strategy Selector & Preset Bar -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--color-border, #e2e8f0); padding-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <label for="pd-strategy-select" style="font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-600, #475569);">
              Strategy Preset:
            </label>
            <select id="pd-strategy-select" style="font-size: 0.875rem; font-weight: 600; padding: 0.375rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--color-border, #cbd5e1); background: #fff; color: var(--color-gray-900, #0f172a); cursor: pointer;">
              <option value="custom">Custom Legs</option>
              <option value="bull-call-spread" selected>Bull Call Spread</option>
              <option value="long-call">Long Call</option>
              <option value="covered-call">Covered Call</option>
              <option value="protective-put">Protective Put</option>
              <option value="bear-put-spread">Bear Put Spread</option>
              <option value="straddle">Long Straddle</option>
              <option value="iron-condor">Iron Condor</option>
            </select>
          </div>

          <div style="font-size: 0.75rem; color: var(--color-gray-500, #64748b);">
            Multi-leg Option Payoff Visualizer
          </div>
        </div>

        <!-- Strategy Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem;">
          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Max Profit
            </div>
            <div id="pd-max-profit" style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #10b981; margin-top: 0.25rem;">
              ${metrics.maxProfit}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Max Loss
            </div>
            <div id="pd-max-loss" style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #ef4444; margin-top: 0.25rem;">
              ${metrics.maxLoss}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Breakeven
            </div>
            <div id="pd-breakeven" style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-800, #1e293b); margin-top: 0.25rem;">
              ${metrics.breakevens.length > 0 ? metrics.breakevens.map(b => `$${b.toFixed(1)}`).join(', ') : 'None'}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Net Premium
            </div>
            <div id="pd-net-premium" style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-primary, #0284c7); margin-top: 0.25rem;">
              ${metrics.netPremium >= 0 ? `Debit: $${metrics.netPremium.toFixed(2)}` : `Credit: $${Math.abs(metrics.netPremium).toFixed(2)}`}
            </div>
          </div>
        </div>

        <!-- Canvas Chart Area -->
        <div style="width: 100%; height: 320px; position: relative; background: #fff; border-radius: 0.5rem; overflow: hidden;">
          <canvas id="pd-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <!-- Legend -->
        <div style="display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: 0.75rem; color: var(--color-gray-600, #475569); padding: 0 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 16px; height: 3px; background: #1e293b;"></span>
            <span>Payoff at Expiration (T = 0)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 16px; height: 3px; background: #0284c7;"></span>
            <span>Current Value (T > 0 via Black-Scholes)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;"></span>
            <span>Breakeven Price</span>
          </div>
        </div>

        <!-- Interactive Sliders -->
        <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
            
            <!-- Time to Expiry Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.375rem;">
                <label for="pd-time-slider" style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">
                  Time to Expiry (T, years)
                </label>
                <span id="pd-time-badge" style="font-size: 0.8125rem; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${Number(currentConfig.time_to_expiry).toFixed(2)} yrs
                </span>
              </div>
              <input
                type="range"
                id="pd-time-slider"
                min="0.00"
                max="1.00"
                step="0.02"
                value="${currentConfig.time_to_expiry}"
                style="width: 100%; height: 6px; cursor: pointer; accent-color: var(--color-primary, #0284c7);"
              />
            </div>

            <!-- Volatility Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.375rem;">
                <label for="pd-vol-slider" style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">
                  Volatility (σ)
                </label>
                <span id="pd-vol-badge" style="font-size: 0.8125rem; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${(Number(currentConfig.vol) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                id="pd-vol-slider"
                min="0.05"
                max="1.00"
                step="0.01"
                value="${currentConfig.vol}"
                style="width: 100%; height: 6px; cursor: pointer; accent-color: var(--color-primary, #0284c7);"
              />
            </div>

            <!-- Current Spot Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.375rem;">
                <label for="pd-spot-slider" style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">
                  Spot Price (S)
                </label>
                <span id="pd-spot-badge" style="font-size: 0.8125rem; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  $${Number(currentConfig.spot).toFixed(0)}
                </span>
              </div>
              <input
                type="range"
                id="pd-spot-slider"
                min="50"
                max="150"
                step="1"
                value="${currentConfig.spot}"
                style="width: 100%; height: 6px; cursor: pointer; accent-color: var(--color-primary, #0284c7);"
              />
            </div>

          </div>

          <!-- Curve Toggle -->
          <div style="display: flex; align-items: center; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--color-border, #e2e8f0);">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-gray-700, #334155); cursor: pointer;">
              <input type="checkbox" id="pd-toggle-current" ${currentConfig.show_current_value ? 'checked' : ''} />
              <span>Show Current Theoretical Value Curve (Black-Scholes)</span>
            </label>
          </div>

        </div>

      </div>
    `;

    const canvasEl = container.querySelector('#pd-canvas');
    if (canvasEl && typeof canvasEl.getContext === 'function' && canvasEl.getContext('2d')) {
      try {
        chartInstance = new PayoffCanvasChart(canvasEl);
        chartInstance.setPlotData(metrics);
      } catch (err) {
        console.warn('Canvas initialization error:', err);
      }
    }

    // Attach listeners
    const strategySelect = container.querySelector('#pd-strategy-select');
    const timeSlider = container.querySelector('#pd-time-slider');
    const volSlider = container.querySelector('#pd-vol-slider');
    const spotSlider = container.querySelector('#pd-spot-slider');
    const toggleCurrent = container.querySelector('#pd-toggle-current');

    if (strategySelect) {
      const onStrategy = (e) => {
        const key = e.target.value;
        if (STRATEGY_PRESETS[key]) {
          const preset = STRATEGY_PRESETS[key];
          currentConfig.spot = preset.spot;
          currentConfig.legs = preset.legs;
          render();
        }
      };
      strategySelect.addEventListener('change', onStrategy);
      listeners.push({ el: strategySelect, type: 'change', fn: onStrategy });
    }

    if (timeSlider) {
      const onTime = (e) => {
        currentConfig.time_to_expiry = parseFloat(e.target.value);
        const b = container.querySelector('#pd-time-badge');
        if (b) b.textContent = `${currentConfig.time_to_expiry.toFixed(2)} yrs`;
        updateChartAndMetrics();
      };
      timeSlider.addEventListener('input', onTime);
      listeners.push({ el: timeSlider, type: 'input', fn: onTime });
    }

    if (volSlider) {
      const onVol = (e) => {
        currentConfig.vol = parseFloat(e.target.value);
        const b = container.querySelector('#pd-vol-badge');
        if (b) b.textContent = `${(currentConfig.vol * 100).toFixed(0)}%`;
        updateChartAndMetrics();
      };
      volSlider.addEventListener('input', onVol);
      listeners.push({ el: volSlider, type: 'input', fn: onVol });
    }

    if (spotSlider) {
      const onSpot = (e) => {
        currentConfig.spot = parseFloat(e.target.value);
        const b = container.querySelector('#pd-spot-badge');
        if (b) b.textContent = `$${currentConfig.spot.toFixed(0)}`;
        updateChartAndMetrics();
      };
      spotSlider.addEventListener('input', onSpot);
      listeners.push({ el: spotSlider, type: 'input', fn: onSpot });
    }

    if (toggleCurrent) {
      const onToggle = (e) => {
        currentConfig.show_current_value = e.target.checked;
        updateChartAndMetrics();
      };
      toggleCurrent.addEventListener('change', onToggle);
      listeners.push({ el: toggleCurrent, type: 'change', fn: onToggle });
    }
  }

  function updateChartAndMetrics() {
    const metrics = getMetrics();

    const maxProfitEl = container.querySelector('#pd-max-profit');
    const maxLossEl = container.querySelector('#pd-max-loss');
    const beEl = container.querySelector('#pd-breakeven');
    const premEl = container.querySelector('#pd-net-premium');

    if (maxProfitEl) maxProfitEl.textContent = metrics.maxProfit;
    if (maxLossEl) maxLossEl.textContent = metrics.maxLoss;
    if (beEl) {
      beEl.textContent = metrics.breakevens.length > 0
        ? metrics.breakevens.map(b => `$${b.toFixed(1)}`).join(', ')
        : 'None';
    }
    if (premEl) {
      premEl.textContent = metrics.netPremium >= 0
        ? `Debit: $${metrics.netPremium.toFixed(2)}`
        : `Credit: $${Math.abs(metrics.netPremium).toFixed(2)}`;
    }

    if (chartInstance) {
      chartInstance.setPlotData(metrics);
    }
  }

  render();

  return {
    destroy() {
      listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      listeners = [];
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      container.innerHTML = '';
    },

    update(newConfig = {}) {
      currentConfig = { ...currentConfig, ...newConfig };
      if (newConfig.showCurrentValue !== undefined) currentConfig.show_current_value = newConfig.showCurrentValue;
      if (newConfig.timeToExpiry !== undefined) currentConfig.time_to_expiry = newConfig.timeToExpiry;
      render();
    },

    getMetrics,
  };
}
