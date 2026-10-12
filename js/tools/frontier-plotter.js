/**
 * frontier-plotter.js — Modern Portfolio Theory & Efficient Frontier / CAL Visualizer
 * Plots the Markowitz efficient frontier, Capital Allocation Line (CAL), MVP,
 * and optimal risky portfolio tangency point.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import { Chart } from '../charts/chart-core.js';
import {
  calcPortfolioReturn,
  calcPortfolioVol,
  calcMVPWeight,
  calcTangencyWeight,
  calcSharpe,
  generateFrontierPoints,
} from '../lib/finance-math/portfolio.js';

class FrontierCanvasChart extends Chart {
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
      minVol,
      maxVol,
      minRet,
      maxRet,
      frontier,
      tangent,
      mvp,
      assetA,
      assetB,
      riskFree,
      showCal,
      showInefficient,
    } = this.plotData;

    const xTicks = this.niceTicks(minVol, maxVol, 6);
    const yTicks = this.niceTicks(minRet, maxRet, 6);

    this.drawGrid(xTicks, yTicks, minVol, maxVol, minRet, maxRet);
    this.drawAxes(xTicks, yTicks, minVol, maxVol, minRet, maxRet, 'Portfolio Risk / Volatility (σ)', 'Expected Return E(R)');

    const ctx = this.ctx;

    // Draw Inefficient Branch (dashed slate)
    if (showInefficient && frontier.inefficient.length > 1) {
      const ineffScreen = frontier.inefficient.map(p => ({
        x: this.xScale(p.vol, minVol, maxVol),
        y: this.yScale(p.expReturn, minRet, maxRet),
      }));
      this.drawLine(ineffScreen, '#94a3b8', 1.5, true);
    }

    // Draw Efficient Frontier (solid emerald line)
    if (frontier.efficient.length > 1) {
      const effScreen = frontier.efficient.map(p => ({
        x: this.xScale(p.vol, minVol, maxVol),
        y: this.yScale(p.expReturn, minRet, maxRet),
      }));
      this.drawLine(effScreen, '#10b981', 2.5);
    }

    // Draw Capital Allocation Line (CAL)
    if (showCal && tangent) {
      const calPoints = [
        { x: this.xScale(0, minVol, maxVol), y: this.yScale(riskFree, minRet, maxRet) },
        { x: this.xScale(tangent.vol * 1.5, minVol, maxVol), y: this.yScale(riskFree + tangent.sharpe * tangent.vol * 1.5, minRet, maxRet) },
      ];
      this.drawLine(calPoints, '#6366f1', 2);

      // Risk-Free point
      this.drawPoint(calPoints[0].x, calPoints[0].y, '#6366f1', 4);
      this.drawLabelWithBackground(`Rf: ${(riskFree * 100).toFixed(1)}%`, calPoints[0].x + 6, calPoints[0].y, '#4f46e5', {
        align: 'left',
        baseline: 'middle',
        fontSize: 10,
        bg: '#eef2ff',
        border: '#c7d2fe',
      });
    }

    // Draw MVP Point
    if (mvp) {
      const mx = this.xScale(mvp.vol, minVol, maxVol);
      const my = this.yScale(mvp.expReturn, minRet, maxRet);
      this.drawPoint(mx, my, '#f59e0b', 5);
      this.drawLabelWithBackground('MVP', mx - 8, my, '#b45309', {
        align: 'right',
        baseline: 'middle',
        fontSize: 10,
        bg: '#fef3c7',
        border: '#fde68a',
      });
    }

    // Draw Tangency Portfolio Point
    if (tangent) {
      const tx = this.xScale(tangent.vol, minVol, maxVol);
      const ty = this.yScale(tangent.expReturn, minRet, maxRet);
      this.drawPoint(tx, ty, '#4f46e5', 6);
      this.drawLabelWithBackground(`Optimal Risky (SR: ${tangent.sharpe.toFixed(2)})`, tx + 8, ty - 8, '#312e81', {
        align: 'left',
        baseline: 'bottom',
        fontSize: 10,
        bg: '#ede9fe',
        border: '#ddd6fe',
      });
    }

    // Draw Individual Assets A & B
    const ax = this.xScale(assetA.vol, minVol, maxVol);
    const ay = this.yScale(assetA.return, minRet, maxRet);
    this.drawPoint(ax, ay, '#0284c7', 5);
    this.drawLabelWithBackground(assetA.label || 'Asset A', ax, ay - 8, '#0369a1', {
      align: 'center',
      baseline: 'bottom',
      fontSize: 10,
      bg: '#e0f2fe',
      border: '#bae6fd',
    });

    const bx = this.xScale(assetB.vol, minVol, maxVol);
    const by = this.yScale(assetB.return, minRet, maxRet);
    this.drawPoint(bx, by, '#0284c7', 5);
    this.drawLabelWithBackground(assetB.label || 'Asset B', bx, by + 12, '#0369a1', {
      align: 'center',
      baseline: 'top',
      fontSize: 10,
      bg: '#e0f2fe',
      border: '#bae6fd',
    });

    // Hover tooltip
    if (this._mouse && this._inChartArea(this._mouse.x, this._mouse.y)) {
      const hVol = this.xToValue(this._mouse.x, minVol, maxVol);
      const hRet = minRet + ((this.chartY + this.chartH - this._mouse.y) / this.chartH) * (maxRet - minRet);

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this._mouse.x, this.chartY);
      ctx.lineTo(this._mouse.x, this.chartY + this.chartH);
      ctx.stroke();

      const text = `Vol: ${(hVol * 100).toFixed(1)}% | Ret: ${(hRet * 100).toFixed(1)}%`;
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

export function create(container, config = {}) {
  if (!container) throw new Error('frontier-plotter requires a container element');

  let currentConfig = {
    assets: [
      { id: 'A', label: 'Equities', return: 0.10, vol: 0.20 },
      { id: 'B', label: 'Bonds', return: 0.05, vol: 0.10, corr_A: 0.20 },
    ],
    risk_free: 0.03,
    show_frontier: true,
    show_cal: true,
    show_inefficient: true,
    ...config,
  };

  let chartInstance = null;
  let listeners = [];

  function getMetrics() {
    const assets = currentConfig.assets || [];
    const assetA = assets[0] || { id: 'A', label: 'Asset A', return: 0.10, vol: 0.20 };
    const assetB = assets[1] || { id: 'B', label: 'Asset B', return: 0.05, vol: 0.10, corr_A: 0.20 };

    const rA = Number(assetA.return ?? 0.10);
    const volA = Number(assetA.vol ?? 0.20);
    const rB = Number(assetB.return ?? 0.05);
    const volB = Number(assetB.vol ?? 0.10);
    const corr = Number(assetB.corr_A ?? assetA.corr_B ?? 0.20);
    const rf = Number(currentConfig.risk_free ?? 0.03);

    const frontier = generateFrontierPoints(rA, volA, rB, volB, corr, 100);

    // Tangency portfolio
    const wTanA = calcTangencyWeight(rA, volA, rB, volB, corr, rf);
    const tanRet = calcPortfolioReturn(wTanA, rA, rB);
    const tanVol = calcPortfolioVol(wTanA, volA, volB, corr);
    const tanSharpe = calcSharpe(tanRet, tanVol, rf);

    const tangent = {
      wA: wTanA,
      wB: 1 - wTanA,
      expReturn: tanRet,
      vol: tanVol,
      sharpe: tanSharpe,
    };

    // MVP
    const wMvpA = calcMVPWeight(volA, volB, corr);
    const mvpRet = calcPortfolioReturn(wMvpA, rA, rB);
    const mvpVol = calcPortfolioVol(wMvpA, volA, volB, corr);
    const mvp = {
      wA: wMvpA,
      wB: 1 - wMvpA,
      expReturn: mvpRet,
      vol: mvpVol,
    };

    // Calculate plotting boundaries
    const minVol = 0;
    const maxVol = Math.max(volA, volB, tanVol) * 1.4;
    const minRet = Math.min(rf, rA, rB, 0) - 0.02;
    const maxRet = Math.max(rA, rB, tanRet) * 1.35;

    return {
      assetA: { ...assetA, return: rA, vol: volA },
      assetB: { ...assetB, return: rB, vol: volB, corr },
      riskFree: rf,
      corr,
      frontier,
      tangent,
      mvp,
      minVol,
      maxVol,
      minRet,
      maxRet,
      showCal: currentConfig.show_cal !== false,
      showInefficient: currentConfig.show_inefficient !== false,
    };
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
      <div class="fp-container" style="display: flex; flex-direction: column; gap: 1.25rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">
          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Max Sharpe Ratio
            </div>
            <div id="fp-sharpe-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-primary, #0284c7); margin-top: 0.25rem;">
              ${metrics.tangent.sharpe.toFixed(2)}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Optimal Risky E(R)
            </div>
            <div id="fp-tan-ret-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #10b981; margin-top: 0.25rem;">
              ${(metrics.tangent.expReturn * 100).toFixed(1)}%
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Optimal Risky Vol (σ)
            </div>
            <div id="fp-tan-vol-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-800, #1e293b); margin-top: 0.25rem;">
              ${(metrics.tangent.vol * 100).toFixed(1)}%
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Minimum Variance Vol
            </div>
            <div id="fp-mvp-vol-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #f59e0b; margin-top: 0.25rem;">
              ${(metrics.mvp.vol * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <!-- Canvas Chart Area -->
        <div style="width: 100%; height: 320px; position: relative; background: #fff; border-radius: 0.5rem; overflow: hidden;">
          <canvas id="fp-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <!-- Controls: Correlation and Risk-Free Rate Sliders -->
        <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
            <!-- Correlation Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.375rem;">
                <span>Asset Correlation (ρ_AB)</span>
                <span id="fp-corr-badge" style="font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${metrics.corr.toFixed(2)}
                </span>
              </div>
              <input type="range" id="fp-corr-slider" min="-1.0" max="1.0" step="0.05" value="${metrics.corr}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
              <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--color-gray-500, #64748b); margin-top: 0.25rem;">
                <span>-1.0 (Max Diversification)</span>
                <span>0.0</span>
                <span>+1.0 (No Diversification)</span>
              </div>
            </div>

            <!-- Risk-Free Rate Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.375rem;">
                <span>Risk-Free Rate (Rf)</span>
                <span id="fp-rf-badge" style="font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${(metrics.riskFree * 100).toFixed(1)}%
                </span>
              </div>
              <input type="range" id="fp-rf-slider" min="0.0" max="0.08" step="0.005" value="${metrics.riskFree}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>
          </div>

          <!-- Toggles -->
          <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; padding-top: 0.5rem; border-top: 1px solid var(--color-border, #e2e8f0);">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-gray-700, #334155); cursor: pointer;">
              <input type="checkbox" id="fp-toggle-cal" ${currentConfig.show_cal !== false ? 'checked' : ''} />
              <span>Show Capital Allocation Line (CAL)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-gray-700, #334155); cursor: pointer;">
              <input type="checkbox" id="fp-toggle-ineff" ${currentConfig.show_inefficient !== false ? 'checked' : ''} />
              <span>Show Inefficient Lower Branch</span>
            </label>
          </div>

        </div>

      </div>
    `;

    const canvasEl = container.querySelector('#fp-canvas');
    if (canvasEl && typeof canvasEl.getContext === 'function' && canvasEl.getContext('2d')) {
      try {
        chartInstance = new FrontierCanvasChart(canvasEl);
        chartInstance.setPlotData(metrics);
      } catch (err) {
        console.warn('Canvas initialization error:', err);
      }
    }

    // Attach listeners
    const corrSlider = container.querySelector('#fp-corr-slider');
    const rfSlider = container.querySelector('#fp-rf-slider');
    const calToggle = container.querySelector('#fp-toggle-cal');
    const ineffToggle = container.querySelector('#fp-toggle-ineff');

    if (corrSlider) {
      const onCorr = (e) => {
        const val = parseFloat(e.target.value);
        if (currentConfig.assets && currentConfig.assets[1]) {
          currentConfig.assets[1].corr_A = val;
        }
        const b = container.querySelector('#fp-corr-badge');
        if (b) b.textContent = val.toFixed(2);
        updatePlot();
      };
      corrSlider.addEventListener('input', onCorr);
      listeners.push({ el: corrSlider, type: 'input', fn: onCorr });
    }

    if (rfSlider) {
      const onRf = (e) => {
        currentConfig.risk_free = parseFloat(e.target.value);
        const b = container.querySelector('#fp-rf-badge');
        if (b) b.textContent = `${(currentConfig.risk_free * 100).toFixed(1)}%`;
        updatePlot();
      };
      rfSlider.addEventListener('input', onRf);
      listeners.push({ el: rfSlider, type: 'input', fn: onRf });
    }

    if (calToggle) {
      const onCal = (e) => {
        currentConfig.show_cal = e.target.checked;
        updatePlot();
      };
      calToggle.addEventListener('change', onCal);
      listeners.push({ el: calToggle, type: 'change', fn: onCal });
    }

    if (ineffToggle) {
      const onIneff = (e) => {
        currentConfig.show_inefficient = e.target.checked;
        updatePlot();
      };
      ineffToggle.addEventListener('change', onIneff);
      listeners.push({ el: ineffToggle, type: 'change', fn: onIneff });
    }
  }

  function updatePlot() {
    const metrics = getMetrics();

    const sharpeEl = container.querySelector('#fp-sharpe-val');
    const tanRetEl = container.querySelector('#fp-tan-ret-val');
    const tanVolEl = container.querySelector('#fp-tan-vol-val');
    const mvpVolEl = container.querySelector('#fp-mvp-vol-val');

    if (sharpeEl) sharpeEl.textContent = metrics.tangent.sharpe.toFixed(2);
    if (tanRetEl) tanRetEl.textContent = `${(metrics.tangent.expReturn * 100).toFixed(1)}%`;
    if (tanVolEl) tanVolEl.textContent = `${(metrics.tangent.vol * 100).toFixed(1)}%`;
    if (mvpVolEl) mvpVolEl.textContent = `${(metrics.mvp.vol * 100).toFixed(1)}%`;

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
      render();
    },

    getMetrics,
  };
}

