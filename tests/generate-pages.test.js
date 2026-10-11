// tests/generate-pages.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const loadJson = (rel) => JSON.parse(readFileSync(resolve(repoRoot, rel), 'utf8'));
const loadText = (rel) => readFileSync(resolve(repoRoot, rel), 'utf8');

describe('generate-pages output verification', () => {
  let registry;

  beforeAll(() => {
    execSync('node scripts/generate-pages.js', { cwd: repoRoot });
    registry = loadJson('concepts/registry.json');
  });

  it('generates an HTML file for every concept in registry', () => {
    for (const concept of registry.concepts) {
      const htmlPath = resolve(repoRoot, `pages/learn/${concept.id}.html`);
      expect(existsSync(htmlPath), `Expected ${htmlPath} to exist`).toBe(true);

      const html = loadText(`pages/learn/${concept.id}.html`);
      expect(html).toContain(concept.title);
      expect(html).toContain(`badge-domain--${concept.domain}`);
      expect(html).toContain(`badge-tier--${concept.tier}`);
      expect(html).toContain('Notes for Future-Me');
    }
  });

  it('renders formula template with KaTeX math block', () => {
    const tvmHtml = loadText('pages/learn/tvm.html');
    expect(tvmHtml).toContain('data-katex=');
    expect(tvmHtml).toContain('Variable Glossary');
    expect(tvmHtml).toContain('Worked Numerical Example');
  });

  it('renders explainer template with overview and common misconceptions', () => {
    const emhHtml = loadText('pages/learn/market-efficiency.html');
    expect(emhHtml).toContain('Overview & Intuition');
    expect(emhHtml).toContain('Common Misconceptions');
  });

  it('renders interactive template with tool-mount and scenario presets', () => {
    const bsHtml = loadText('pages/learn/black-scholes.html');
    expect(bsHtml).toContain('id="tool-mount"');
    expect(bsHtml).toContain('data-component="sensitivity-panel"');
    expect(bsHtml).toContain('data-defaults=');
    expect(bsHtml).toContain('At-the-Money 1Y');
  });

  it('generates domain-grouped learn index.html', () => {
    const indexHtml = loadText('pages/learn/index.html');
    expect(indexHtml).toContain('Concepts Library');
    expect(indexHtml).toContain('Corporate Finance & Foundations');
    expect(indexHtml).toContain('Time Value of Money');
    expect(indexHtml).toContain('Black-Scholes Option Pricing');
  });

  it('generates bibliography.html with canonical reference books', () => {
    const bibHtml = loadText('pages/reference/bibliography.html');
    expect(bibHtml).toContain('Finance for Executives');
    expect(bibHtml).toContain('Options, Futures and Other Derivatives');
    expect(bibHtml).toContain('Financial Statement Analysis and Security Valuation');
  });
});

