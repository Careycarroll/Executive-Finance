// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from '../js/tools/binomial-tree.js';

describe('Tool: binomial-tree (ADR-0003 contract & Hull Ch. 13)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders and mounts CRR binomial tree in DOM', () => {
    const tool = create(container, {
      s0: 100,
      strike: 100,
      rate: 0.05,
      vol: 0.20,
      steps: 3,
      option_type: 'call',
      exercise_style: 'european',
    });

    const priceEl = container.querySelector('#bt-price-val');
    expect(priceEl).not.toBeNull();
    const price = parseFloat(priceEl.textContent.replace('$', ''));
    expect(price).toBeGreaterThan(8);
    expect(price).toBeLessThan(14); // Close to BSM Call ~10.45

    const treeData = tool.getTree();
    expect(treeData.tree).toHaveLength(4); // 0, 1, 2, 3 steps = 4 arrays

    tool.destroy();
  });

  it('detects American early exercise on deep ITM put', () => {
    const tool = create(container, {
      s0: 70,
      strike: 100,
      rate: 0.10,
      vol: 0.20,
      steps: 4,
      option_type: 'put',
      exercise_style: 'american',
    });

    const treeData = tool.getTree();
    let hasExercised = false;

    treeData.tree.forEach(stepNodes => {
      stepNodes.forEach(node => {
        if (node.isExercised) hasExercised = true;
      });
    });

    expect(hasExercised).toBe(true);
    expect(container.textContent).toContain('EXERCISE');

    tool.destroy();
  });

  it('supports update(newConfig) and destroy() cleanly', () => {
    const tool = create(container);

    tool.update({
      s0: 120,
      strike: 100,
    });

    const tree = tool.getTree();
    expect(tree.price).toBeGreaterThan(20);

    tool.destroy();
    expect(container.innerHTML).toBe('');
  });
});
