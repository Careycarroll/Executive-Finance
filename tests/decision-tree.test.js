/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create, DECISION_PRESETS } from '../js/tools/decision-tree.js';

describe('Tool: decision-tree (ADR-0003 contract & branching logic)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('requires a container element', () => {
    expect(() => create(null)).toThrow('decision-tree requires a container element');
  });

  it('initializes and mounts in DOM with entity choice preset', () => {
    const tool = create(container);
    expect(container.querySelector('.decision-tree-widget')).not.toBeNull();
    expect(container.querySelector('#current-question')).not.toBeNull();
    expect(container.querySelector('#current-question').textContent.trim()).toContain('multiple owners');

    const state = tool.getState();
    expect(state.nodes.length).toBeGreaterThanOrEqual(4);
    expect(state.history.length).toBe(0);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('navigates through decision path to reach C Corporation outcome', () => {
    const tool = create(container);

    // Question 1: Multiple owners? -> Select Yes (index 0)
    tool.selectChoice(0);
    expect(container.querySelector('#current-question').textContent.trim()).toContain('liability protection');

    // Question 2: Need liability protection? -> Select Yes (index 0)
    tool.selectChoice(0);
    expect(container.querySelector('#current-question').textContent.trim()).toContain('Venture Capital');

    // Question 3: Raise institutional VC? -> Select Yes (index 0)
    tool.selectChoice(0);

    // Reached outcome: c_corp
    const card = container.querySelector('#recommendation-card');
    expect(card).not.toBeNull();
    expect(card.textContent).toContain('C Corporation');
    expect(card.textContent).toContain('flat 21% federal corporate rate');

    const state = tool.getState();
    expect(state.history.length).toBe(3);
    expect(state.currentNodeId).toBe('c_corp');

    tool.destroy();
  });

  it('supports back and restart navigation', () => {
    const tool = create(container);

    // Make 2 choices
    tool.selectChoice(0); // Multiple owners -> Yes
    tool.selectChoice(0); // Liability protection -> Yes
    expect(tool.getState().history.length).toBe(2);

    // Click back button
    const backBtn = container.querySelector('#btn-back');
    expect(backBtn).not.toBeNull();
    backBtn.click();
    expect(tool.getState().history.length).toBe(1);

    // Click restart button
    const restartBtn = container.querySelector('#btn-restart');
    expect(restartBtn).not.toBeNull();
    restartBtn.click();
    expect(tool.getState().history.length).toBe(0);
    expect(tool.getState().currentNodeId).toBe('multiple_owners');

    tool.destroy();
  });

  it('supports custom shorthand { yes, no } syntax from component-toolbox spec', () => {
    const customConfig = {
      nodes: [
        { id: 'start', question: 'Multiple owners?', yes: 'q2', no: 'sole-prop' },
        { id: 'q2', question: 'Need liability protection?', yes: 'llc', no: 'gp' },
      ],
      outcomes: {
        'sole-prop': 'Sole proprietorship',
        'llc': 'Limited Liability Company',
        'gp': 'General partnership',
      },
    };

    const tool = create(container, customConfig);
    expect(container.querySelector('#current-question').textContent.trim()).toBe('Multiple owners?');

    // Choose No (index 1) -> sole-prop outcome
    tool.selectChoice(1);
    const card = container.querySelector('#recommendation-card');
    expect(card).not.toBeNull();
    expect(card.textContent).toContain('Sole proprietorship');

    tool.destroy();
  });

  it('updates configuration dynamically via update() method', () => {
    const tool = create(container);

    tool.update(DECISION_PRESETS.section_83b);
    expect(container.querySelector('#current-question').textContent.trim()).toContain('substantial risk of forfeiture');

    const state = tool.getState();
    expect(state.name).toContain('Section 83(b)');

    tool.destroy();
  });
});
