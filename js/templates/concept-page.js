/**
 * concept-page.js — Client-side runtime for concept pages.
 * Handles collapsible drawers, KaTeX rendering, and tool mounting.
 */
import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render';

// Render KaTeX for explicit elements and inline math in markdown prose
function renderMath() {
  document.querySelectorAll('[data-katex]').forEach(el => {
    if (el.querySelector('.katex')) return;
    const tex = el.getAttribute('data-katex');
    const displayMode = el.getAttribute('data-display') !== 'false';
    try {
      katex.render(tex, el, {
        displayMode,
        throwOnError: false,
        strict: false
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
    }
  });

  const content = document.querySelector('.concept-content');
  if (content) {
    try {
      renderMathInElement(content, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoredClasses: ['katex', 'katex-display'],
        throwOnError: false,
        strict: false
      });
    } catch (err) {
      console.warn('KaTeX auto-render error:', err);
    }
  }
}

// Collapsible sections
function initCollapsibles() {
  document.querySelectorAll('.collapsible-box').forEach(box => {
    const header = box.querySelector('.collapsible-box__header');
    if (!header) return;
    header.addEventListener('click', () => {
      box.classList.toggle('collapsible-box--open');
      const icon = header.querySelector('.collapsible-icon');
      if (icon) {
        icon.textContent = box.classList.contains('collapsible-box--open') ? '▼' : '▶';
      }
    });
  });
}

// Interactive component mounting
async function initInteractiveTool() {
  const mountEl = document.getElementById('tool-mount');
  if (!mountEl) return;

  const componentId = mountEl.getAttribute('data-component');
  if (!componentId) return;

  let defaults = {};
  try {
    defaults = JSON.parse(mountEl.getAttribute('data-defaults') || '{}');
  } catch (e) {
    console.error('Failed to parse component defaults:', e);
  }

  let activeTool = null;

  try {
    // Attempt to load the component module from js/tools/
    const module = await import(`../tools/${componentId}.js`);
    if (typeof module.create === 'function') {
      activeTool = module.create(mountEl, defaults);
    }
  } catch (err) {
    // Component not yet built (Milestone 4/5)
    mountEl.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; background: var(--color-gray-50); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);">
        <div style="font-size: 2rem; margin-bottom: 0.75rem;">⚙️</div>
        <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--color-gray-900); margin-bottom: 0.5rem;">
          Tool: <code>${componentId}</code>
        </h3>
        <p style="font-size: 0.875rem; color: var(--color-text-secondary); max-width: 500px; margin: 0 auto 1.25rem;">
          This interactive component is scheduled for delivery in Milestone 4/5 per ADR-0003.
        </p>
        <details style="text-align: left; max-width: 500px; margin: 0 auto; background: var(--color-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <summary style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; cursor: pointer; color: var(--color-primary);">
            Default Configuration Parameters
          </summary>
          <pre style="margin-top: 0.5rem; font-size: 0.75rem; font-family: var(--font-mono); overflow-x: auto; color: var(--color-gray-800);">${JSON.stringify(defaults, null, 2)}</pre>
        </details>
      </div>
    `;
  }

  // Preset scenarios
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      try {
        const config = JSON.parse(btn.getAttribute('data-config') || '{}');
        if (activeTool && typeof activeTool.update === 'function') {
          activeTool.update(config);
        }
      } catch (err) {
        console.error('Failed to apply preset:', err);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderMath();
  initCollapsibles();
  initInteractiveTool();
});
