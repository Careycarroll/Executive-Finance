// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from '../js/tools/fs-reformulator.js';

describe('Tool: fs-reformulator (ADR-0003 contract & Penman Ch. 8/11)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders Penman textbook golden values (NOA=700, NFO=300, CSE=400, ROE=29%)', () => {
    const tool = create(container, {
      operatingAssets: 1000,
      operatingLiabilities: 300,
      financialLiabilities: 400,
      financialAssets: 100,
      operatingIncome: 140,
      netFinancialExpense: 24,
    });

    const agg = tool.getAggregates();
    expect(agg.noa).toBe(700);
    expect(agg.nfo).toBe(300);
    expect(agg.cse).toBe(400);
    expect(agg.decomp.rnoa).toBeCloseTo(0.20, 4);
    expect(agg.decomp.nbc).toBeCloseTo(0.08, 4);
    expect(agg.decomp.spread).toBeCloseTo(0.12, 4);
    expect(agg.decomp.flev).toBeCloseTo(0.75, 4);
    expect(agg.decomp.roe).toBeCloseTo(0.29, 4);

    // Verify step-by-step show-work panel is mounted
    const swPanel = container.querySelector('#fsr-sw-panel');
    expect(swPanel).not.toBeNull();

    tool.destroy();
  });

  it('allows reclassifying line items and updates aggregates live', () => {
    const tool = create(container);

    const initialAgg = tool.getAggregates();
    const initialNoa = initialAgg.noa;

    // Change Excess Cash dropdown from financial to operating
    const select = container.querySelector('.fsr-class-select[data-item-id="excess_cash"]');
    expect(select).not.toBeNull();

    select.value = 'operating';
    select.dispatchEvent(new Event('change'));

    const updatedAgg = tool.getAggregates();
    // Moving 50 from FA to OA increases NOA by 50 and decreases FA by 50 (increasing NFO by 50, leaving CSE constant)
    expect(updatedAgg.noa).toBe(initialNoa + 50);
    expect(updatedAgg.cse).toBe(initialAgg.cse);

    tool.destroy();
  });

  it('toggles between reformulated view and standard GAAP view', () => {
    const tool = create(container);

    const btnStd = container.querySelector('#fsr-btn-standard');
    expect(btnStd).not.toBeNull();
    btnStd.click();

    // In standard view, header badge says Total Assets
    expect(container.textContent).toContain('Total Assets');

    const btnRef = container.querySelector('#fsr-btn-reformulated');
    btnRef.click();
    expect(container.textContent).toContain('Net Operating Assets (NOA)');

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container);

    tool.update({
      operatingIncome: 200,
      netFinancialExpense: 20,
    });

    const agg = tool.getAggregates();
    expect(agg.oi).toBe(200);
    expect(agg.nfe).toBe(20);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});
