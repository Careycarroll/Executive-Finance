/**
 * monte-carlo.js — Monte Carlo Simulation Runner & Outcome Histogram
 * Simulates Geometric Brownian Motion paths, renders distribution histogram,
 * and computes 95% Value at Risk (VaR) and Expected Shortfall (CVaR).
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import { Chart } from '../charts/chart-core.js';
import { runGBMSimulation } from '../lib/finance-math/monte-carlo.js';

class MonteCarloCanvasChart extends Chart {
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
      bins,
      minVal,
      maxVal,
      p5,
      p50,
      p95,
      mean,
      s0,
    } = this.plotData;

    let maxFreq = 0;
    bins.forEach(b => {
      maxFreq = Math.max(maxFreq, b.frequency);
    });

    const plotMinX = minVal;
    const plotMaxX = maxVal;
    const plotMinY = 0;
    const plotMaxY = maxFreq * 1.15;

    const xTicks = this.niceTicks(plotMinX, plotMaxX, 6);
    const yTicks = this.niceTicks(plotMinY, plotMaxY, 5);

    this.drawGrid(xTicks, yTicks, plotMinX, plotMaxX, plotMinY, plotMaxY);
    this.drawAxes(
      xTicks,
      yTicks,
      plotMinX,
      plotMaxX,
      plotMinY,
      plotMaxY,
      'Terminal Asset Price ($)',
      'Relative Frequency'
    );

    const ctx = this.ctx;
    const zeroY = this.yScale(0, plotMinY, plotMaxY);

    // Draw Histogram Bars
    bins.forEach(b => {
      const xLeft = this.xScale(b.binMin, plotMinX, plotMaxX);
      const xRight = this.xScale(b.binMax, plotMinX, plotMaxX);
      const barW = Math.max(1, xRight - xLeft - 1);
      const yTop = this.yScale(b.frequency, plotMinY, plotMaxY);
      const barH = zeroY - yTop;

      ctx.save();
      // Worst 5% tail shaded in crimson red; main body in slate blue
      ctx.fillStyle = b.binMid <= p5 ? '#f87171' : '#38bdf8';
      ctx.fillRect(xLeft, yTop, barW, barH);
      ctx.restore();
    });

    // Draw Reference Cutoff Lines: S0 initial, P5 (VaR), Median, P95
    // Initial Price S0
    const s0X = this.xScale(s0, plotMinX, plotMaxX);
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(s0X, this.chartY);
    ctx.lineTo(s0X, this.chartY + this.chartH);
    ctx.stroke();
    ctx.restore();
    this.drawLabelWithBackground(`Initial: $${s0.toFixed(0)}`, s0X, this.chartY + 10, '#64748b', {
      align: 'center',
      baseline: 'top',
      fontSize: 9,
      bg: '#f1f5f9',
      border: '#cbd5e1',
    });

    // P5 (VaR threshold)
    const p5X = this.xScale(p5, plotMinX, plotMaxX);
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(p5X, this.chartY);
    ctx.lineTo(p5X, this.chartY + this.chartH);
    ctx.stroke();
    ctx.restore();
    this.drawLabelWithBackground(`5th%: $${p5.toFixed(1)}`, p5X, this.chartY + 26, '#dc2626', {
      align: 'center',
      baseline: 'top',
      fontSize: 9,
      bg: '#fee2e2',
      border: '#fca5a5',
    });

    // Median P50
    const p50X = this.xScale(p50, plotMinX, plotMaxX);
    ctx.save();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p50X, this.chartY);
    ctx.lineTo(p50X, this.chartY + this.chartH);
    ctx.stroke();
    ctx.restore();
    this.drawLabelWithBackground(`Median: $${p50.toFixed(1)}`, p50X, this.chartY + 10, '#0369a1', {
      align: 'center',
      baseline: 'top',
      fontSize: 9,
      bg: '#e0f2fe',
      border: '#bae6fd',
    });

    // P95 (Upside threshold)
    const p95X = this.xScale(p95, plotMinX, plotMaxX);
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(p95X, this.chartY);
    ctx.lineTo(p95X, this.chartY + this.chartH);
    ctx.stroke();
    ctx.restore();
    this.drawLabelWithBackground(`95th%: $${p95.toFixed(1)}`, p95X, this.chartY + 26, '#047857', {
      align: 'center',
      baseline: 'top',
      fontSize: 9,
      bg: '#d1fae5',
      border: '#6ee7b7',
    });

    // Hover tooltip
    if (this._mouse && this._inChartArea(this._mouse.x, this._mouse.y)) {
      const hVal = this.xToValue(this._mouse.x, plotMinX, plotMaxX);
      const targetBin = bins.find(b => hVal >= b.binMin && hVal <= b.binMax);

      if (targetBin) {
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this._mouse.x, this.chartY);
        ctx.lineTo(this._mouse.x, this.chartY + this.chartH);
        ctx.stroke();

        const pct = (targetBin.frequency * 100).toFixed(1);
        const text = `Price: $${hVal.toFixed(1)} | Count: ${targetBin.count} (${pct}%)`;
        const tw = ctx.measureText(text).width + 20;
        const tx = this._mouse.x > this.chartX + this.chartW - tw - 15 ? this._mouse.x - tw - 10 : this._mouse.x + 10;
        const ty = Math.max(this.chartY + 10, Math.min(this._mouse.y, this.chartY + this.chartH - 35));

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, 26, 4);
        ctx.fill();

        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, tx + 10, ty + 13);
        ctx.restore();
      }
    }
  }
}

export function create(container, config = {}) {
  if (!container) throw new Error('monte-carlo requires a container element');

  let currentConfig = {
    s0: 100,
    drift: 0.08,
    vol: 0.20,
    horizon: 1.0,
    n_paths: 3000,
    seed: 42,
    ...config,
  };

  let chartInstance = null;
  let listeners = [];

  function runSimulation() {
    return runGBMSimulation({
      s0: Number(currentConfig.s0 ?? 100),
      drift: Number(currentConfig.drift ?? 0.08),
      vol: Number(currentConfig.vol ?? 0.20),
      horizon: Number(currentConfig.horizon ?? 1.0),
      nPaths: Number(currentConfig.n_paths ?? 3000),
      seed: Number(currentConfig.seed ?? 42),
    });
  }

  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const sim = runSimulation();

    container.innerHTML = `
      <div class="mc-container" style="display: flex; flex-direction: column; gap: 1.25rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">
          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Expected Mean
            </div>
            <div id="mc-mean-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #0284c7; margin-top: 0.25rem;">
              $${sim.mean.toFixed(2)}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              95% VaR (${currentConfig.horizon}Y)
            </div>
            <div id="mc-var-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #ef4444; margin-top: 0.25rem;">
              $${sim.var95.toFixed(2)}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              95% CVaR (Expected Shortfall)
            </div>
            <div id="mc-cvar-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #b91c1c; margin-top: 0.25rem;">
              $${sim.cvar95.toFixed(2)}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              90% Range (P5–P95)
            </div>
            <div id="mc-range-val" style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-800, #1e293b); margin-top: 0.25rem;">
              $${sim.p5.toFixed(0)} – $${sim.p95.toFixed(0)}
            </div>
          </div>
        </div>

        <!-- Canvas Chart Area -->
        <div style="width: 100%; height: 320px; position: relative; background: #fff; border-radius: 0.5rem; overflow: hidden;">
          <canvas id="mc-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <!-- Sliders & Resimulate Controls -->
        <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
            <!-- Drift Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Expected Drift (μ)</span>
                <span id="mc-drift-badge">${(Number(currentConfig.drift) * 100).toFixed(1)}%</span>
              </div>
              <input type="range" id="mc-drift-slider" min="-0.10" max="0.25" step="0.005" value="${currentConfig.drift}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Volatility Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Volatility (σ)</span>
                <span id="mc-vol-badge">${(Number(currentConfig.vol) * 100).toFixed(0)}%</span>
              </div>
              <input type="range" id="mc-vol-slider" min="0.05" max="0.60" step="0.01" value="${currentConfig.vol}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Horizon Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Horizon (Years)</span>
                <span id="mc-horizon-badge">${Number(currentConfig.horizon).toFixed(1)} yrs</span>
              </div>
              <input type="range" id="mc-horizon-slider" min="0.25" max="5.0" step="0.25" value="${currentConfig.horizon}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Resimulate Button -->
            <div style="display: flex; align-items: flex-end;">
              <button
                type="button"
                id="mc-btn-resimulate"
                style="width: 100%; padding: 0.5rem; background: var(--color-primary, #0284c7); color: #fff; font-size: 0.8125rem; font-weight: 700; border: none; border-radius: 0.375rem; cursor: pointer; transition: opacity 0.15s ease;"
              >
                🎲 Re-Simulate (New Seed)
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    const canvasEl = container.querySelector('#mc-canvas');
    if (canvasEl && typeof canvasEl.getContext === 'function' && canvasEl.getContext('2d')) {
      try {
        chartInstance = new MonteCarloCanvasChart(canvasEl);
        chartInstance.setPlotData(sim);
      } catch (err) {
        console.warn('Canvas initialization error:', err);
      }
    }

    // Attach listeners
    const driftSlider = container.querySelector('#mc-drift-slider');
    const volSlider = container.querySelector('#mc-vol-slider');
    const horizonSlider = container.querySelector('#mc-horizon-slider');
    const resimBtn = container.querySelector('#mc-btn-resimulate');

    if (driftSlider) {
      const onDrift = (e) => {
        currentConfig.drift = parseFloat(e.target.value);
        const b = container.querySelector('#mc-drift-badge');
        if (b) b.textContent = `${(currentConfig.drift * 100).toFixed(1)}%`;
        updateSimulation();
      };
      driftSlider.addEventListener('input', onDrift);
      listeners.push({ el: driftSlider, type: 'input', fn: onDrift });
    }

    if (volSlider) {
      const onVol = (e) => {
        currentConfig.vol = parseFloat(e.target.value);
        const b = container.querySelector('#mc-vol-badge');
        if (b) b.textContent = `${(currentConfig.vol * 100).toFixed(0)}%`;
        updateSimulation();
      };
      volSlider.addEventListener('input', onVol);
      listeners.push({ el: volSlider, type: 'input', fn: onVol });
    }

    if (horizonSlider) {
      const onHorizon = (e) => {
        currentConfig.horizon = parseFloat(e.target.value);
        const b = container.querySelector('#mc-horizon-badge');
        if (b) b.textContent = `${currentConfig.horizon.toFixed(1)} yrs`;
        updateSimulation();
      };
      horizonSlider.addEventListener('input', onHorizon);
      listeners.push({ el: horizonSlider, type: 'input', fn: onHorizon });
    }

    if (resimBtn) {
      const onResim = () => {
        currentConfig.seed = Math.floor(Math.random() * 1000000);
        updateSimulation();
      };
      resimBtn.addEventListener('click', onResim);
      listeners.push({ el: resimBtn, type: 'click', fn: onResim });
    }
  }

  function updateSimulation() {
    const sim = runSimulation();

    const meanEl = container.querySelector('#mc-mean-val');
    const varEl = container.querySelector('#mc-var-val');
    const cvarEl = container.querySelector('#mc-cvar-val');
    const rangeEl = container.querySelector('#mc-range-val');

    if (meanEl) meanEl.textContent = `$${sim.mean.toFixed(2)}`;
    if (varEl) varEl.textContent = `$${sim.var95.toFixed(2)}`;
    if (cvarEl) cvarEl.textContent = `$${sim.cvar95.toFixed(2)}`;
    if (rangeEl) rangeEl.textContent = `$${sim.p5.toFixed(0)} – $${sim.p95.toFixed(0)}`;

    if (chartInstance) {
      chartInstance.setPlotData(sim);
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
      render();
    },

    getSimulation() {
      return runSimulation();
    },
  };
}

