#!/usr/bin/env node
/**
 * scripts/generate-pages.js
 *
 * Build-time code generation for concept pages per ADR-0002.
 * Reads concepts/registry.json and concepts/books.json,
 * generates:
 *   - pages/learn/<concept-id>.html (for each registered concept)
 *   - pages/learn/index.html (domain-grouped concept index)
 *   - pages/reference/bibliography.html (machine-generated bibliography page)
 *   - concepts/crosswalk.json (concept-to-book mapping)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { marked } from 'marked';
import katex from 'katex';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

/**
 * Parse Markdown while protecting $$...$$ and $...$ LaTeX expressions from marked's
 * underscore/backslash stripping, then pre-rendering math via KaTeX.
 */
function parseMarkdownWithMath(md) {
  if (!md) return '';

  // 0. Protect fenced code blocks ```...``` and inline code `...` so $100 inside ASCII diagrams is untouched
  const codeBlocks = [];
  let protectedCode = md.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
    const idx = codeBlocks.length;
    codeBlocks.push(match);
    return `@@CODETOKEN_${idx}@@`;
  });

  // Ensure bold glossary variables like `- **\text{ReOI}_t**:` have $...$ delimiters
  const normalized = protectedCode.replace(
    /^(\s*[-*]\s+\*\*)([^$*\n]+?)(\*\*\s*:)/gm,
    (full, pre, expr, post) => {
      const trimmed = expr.trim();
      if (trimmed.includes('&') || trimmed.includes('@@CODETOKEN_')) return full;
      if (/[\\_^()]/.test(trimmed) || /^[A-Za-z0-9\s/+=-]{1,4}$/.test(trimmed)) {
        return `${pre}$${trimmed}$${post}`;
      }
      return full;
    }
  );

  const mathBlocks = [];

  // 1. Extract display math $$...$$
  let protectedMd = normalized.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    const idx = mathBlocks.length;
    mathBlocks.push({ tex: tex.trim(), displayMode: true });
    return `@@MATHTOKEN_${idx}@@`;
  });

  // 2. Extract inline math $...$ (allowing escaped \$ inside the math expression)
  protectedMd = protectedMd.replace(/(?<!\\)\$((?:\\\$|[^$\n])+?)(?<!\\)\$/g, (_, tex) => {
    const idx = mathBlocks.length;
    mathBlocks.push({ tex: tex.trim(), displayMode: false });
    return `@@MATHTOKEN_${idx}@@`;
  });

  // Restore code blocks before marked.parse so marked renders <pre><code> properly
  protectedMd = protectedMd.replace(/@@CODETOKEN_(\d+)@@/g, (_, idxStr) => codeBlocks[Number(idxStr)] || '');

  const html = marked.parse(protectedMd);

  return html.replace(/@@MATHTOKEN_(\d+)@@/g, (_, idxStr) => {
    const item = mathBlocks[Number(idxStr)];
    if (!item) return '';
    try {
      return katex.renderToString(item.tex, {
        displayMode: item.displayMode,
        throwOnError: false,
        strict: false
      });
    } catch {
      return item.displayMode ? `$$${item.tex}$$` : `$${item.tex}$`;
    }
  });
}

/**
 * Split a ## Formula section into individual equation blocks and pre-render each with KaTeX
 */
function renderFormulaBlocks(formulaRaw) {
  if (!formulaRaw) return '';
  const stripped = formulaRaw
    .replace(/^```(latex|math)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
  if (!stripped) return '';

  const blocks = stripped
    .split(/\$\$/)
    .flatMap(chunk => (/\\begin\{/.test(chunk) ? [chunk] : chunk.split(/\n\s*\n/)))
    .map(s => s.trim())
    .filter(Boolean);

  if (blocks.length === 0) return '';

  return blocks
    .map(eq => {
      const rendered = katex.renderToString(eq, {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
      const safeAttr = eq.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return `<div class="concept-formula-katex" data-katex="${safeAttr}">${rendered}</div>`;
    })
    .join('\n          ');
}


const loadJson = (rel) => JSON.parse(readFileSync(resolve(repoRoot, rel), 'utf8'));

const registry = loadJson('concepts/registry.json');
const booksData = loadJson('concepts/books.json');
const booksMap = new Map(booksData.books.map(b => [b.id, b]));

const DOMAIN_LABELS = {
  corpfin: 'Corporate Finance & Foundations',
  fsa: 'Financial Statement Analysis',
  invest: 'Investments & Fixed Income',
  deriv: 'Derivatives & Options',
  risk: 'Risk Management',
  tax: 'Business Taxation',
  macro: 'Macro & Rates',
  behav: 'Behavioral Finance'
};

// Ensure target directories exist
const learnDir = resolve(repoRoot, 'pages/learn');
const refDir = resolve(repoRoot, 'pages/reference');
const proseDir = resolve(repoRoot, 'concepts/prose');
if (!existsSync(learnDir)) mkdirSync(learnDir, { recursive: true });
if (!existsSync(refDir)) mkdirSync(refDir, { recursive: true });
if (!existsSync(proseDir)) mkdirSync(proseDir, { recursive: true });

// Parse Markdown into sections by H2 headings
function parseProseSections(markdown) {
  const sections = {};
  let currentKey = 'intro';
  sections[currentKey] = [];

  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      currentKey = match[1].trim().toLowerCase();
      sections[currentKey] = [];
    } else {
      sections[currentKey].push(line);
    }
  }

  const result = {};
  for (const [k, v] of Object.entries(sections)) {
    result[k] = v.join('\n').trim();
  }
  return result;
}

// Format book citations
function formatCitations(sources) {
  let primaryStr = '';
  const alsoList = [];

  for (const s of sources || []) {
    const book = booksMap.get(s.book);
    const bookName = book ? (book.authors[0] || book.title) : s.book;
    const chStr = (s.chapters && s.chapters.length > 0) ? ` Ch. ${s.chapters.join(', ')}` : '';
    const cite = `${bookName}${chStr}`;

    if (s.primary) {
      primaryStr = cite;
    } else {
      alsoList.push(cite);
    }
  }

  return {
    primary: primaryStr,
    also: alsoList.join(' · ')
  };
}

// Generate shared site header
function renderSiteHeader(activeNav = 'learn') {
  return `
  <header class="site-header" role="banner">
    <div class="site-header__inner">
      <a href="/" class="site-header__logo">
        <span>📈</span>
        <span>Executive Finance</span>
      </a>
      <nav class="site-header__nav" role="navigation" aria-label="Main navigation">
        <a href="/pages/learn/" class="site-header__nav-link ${activeNav === 'learn' ? 'site-header__nav-link--active' : ''}">Learn</a>
        <a href="/pages/toolbox.html" class="site-header__nav-link ${activeNav === 'toolbox' ? 'site-header__nav-link--active' : ''}">Toolbox</a>
        <a href="/pages/analyze/" class="site-header__nav-link ${activeNav === 'analyze' ? 'site-header__nav-link--active' : ''}">Analyze</a>
        <a href="/pages/formulas.html" class="site-header__nav-link ${activeNav === 'formulas' ? 'site-header__nav-link--active' : ''}">Formulas</a>
        <a href="/pages/glossary.html" class="site-header__nav-link ${activeNav === 'glossary' ? 'site-header__nav-link--active' : ''}">Glossary</a>
        <a href="/pages/reference/bibliography.html" class="site-header__nav-link ${activeNav === 'bibliography' ? 'site-header__nav-link--active' : ''}">Bibliography</a>
      </nav>
    </div>
  </header>`;
}

// Generate concept hero header
function renderConceptHero(concept) {
  const citations = formatCitations(concept.sources);
  const tierClass = concept.tier === 'core' ? 'badge-tier--core' : 'badge-tier--reference';
  const domainClass = `badge-domain--${concept.domain}`;

  return `
    <header class="concept-hero">
      <div class="concept-container">
        <div class="concept-hero__nav">
          <a href="/pages/learn/" class="concept-hero__back">← All Concepts</a>
          <div class="concept-hero__badges">
            <span class="badge ${tierClass}">${concept.tier}</span>
            <span class="badge ${domainClass}">${concept.domain}</span>
          </div>
        </div>
        <h1 class="concept-hero__title">${concept.title}</h1>
        <div class="concept-hero__citations">
          ${citations.primary ? `<span class="concept-hero__citation-primary">Primary: ${citations.primary}</span>` : ''}
          ${citations.also ? `<span class="concept-hero__citation-secondary">· also: ${citations.also}</span>` : ''}
        </div>
      </div>
    </header>`;
}

// Generate concept footer (Future-Me notes + Related links)
function renderConceptFooter(concept, sections) {
  const futureMeText = sections['notes for future-me'] || sections['notes for future me'] || '';
  const futureMeHtml = futureMeText ? parseMarkdownWithMath(futureMeText) : `
    <p class="future-me-box__placeholder">
      No notes yet — future-you hasn’t recorded personal intuition on this concept yet.
    </p>`;

  let relatedHtml = '';
  if (concept.related && concept.related.length > 0) {
    const conceptLookup = new Map(registry.concepts.map(c => [c.id, c]));
    const chips = concept.related.map(relId => {
      const rel = conceptLookup.get(relId);
      const title = rel ? rel.title : relId;
      const domain = rel ? rel.domain : '';
      return `
        <a href="/pages/learn/${relId}.html" class="related-chip">
          <span>${title}</span>
          ${domain ? `<span class="badge badge-domain--${domain}" style="font-size: 0.65rem; padding: 1px 5px;">${domain}</span>` : ''}
        </a>`;
    }).join('\n');

    relatedHtml = `
      <section class="related-concepts-section">
        <h3 class="related-concepts-section__title">Related Concepts</h3>
        <div class="related-chips">
          ${chips}
        </div>
      </section>`;
  }

  return `
    <footer class="concept-footer">
      <div class="future-me-box">
        <div class="future-me-box__header">
          <span>📝</span>
          <span>Notes for Future-Me</span>
        </div>
        <div class="future-me-box__body">
          ${futureMeHtml}
        </div>
      </div>
      ${relatedHtml}
    </footer>`;
}

// Render body for 'formula' template
function renderFormulaBody(concept, sections) {
  const intuitionText = sections['intuition'] || sections['intro'] || '';
  const intuitionHtml = intuitionText ? parseMarkdownWithMath(intuitionText) : '';

  const formulaRaw = sections['formula'] || '';
  const formulaBlocksHtml = renderFormulaBlocks(formulaRaw);

  const glossaryHtml = sections['variable glossary'] || sections['variables']
    ? parseMarkdownWithMath(sections['variable glossary'] || sections['variables'])
    : '';

  const exampleHtml = sections['worked example'] || sections['example']
    ? parseMarkdownWithMath(sections['worked example'] || sections['example'])
    : '';

  const whenToUseHtml = sections['when to use'] || sections['usage']
    ? parseMarkdownWithMath(sections['when to use'] || sections['usage'])
    : '';

  return `
    <div class="concept-section">
      ${intuitionHtml ? `
        <div class="concept-intuition">
          <div class="concept-intuition__heading">Intuition</div>
          <div class="concept-intuition__text">${intuitionHtml}</div>
        </div>` : ''}

      ${formulaBlocksHtml ? `
        <div class="concept-formula-box">
          <h2 class="concept-section__title">Formula</h2>
          ${formulaBlocksHtml}
          ${glossaryHtml ? `
            <div class="variable-glossary-wrapper" style="margin-top: 1.5rem;">
              <h3 style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.75rem;">
                Variable Glossary
              </h3>
              ${glossaryHtml}
            </div>` : ''}
        </div>` : ''}

      ${exampleHtml ? `
        <div class="worked-example-card">
          <h2 class="concept-section__title">Worked Numerical Example</h2>
          <div class="worked-example-card__content">
            ${exampleHtml}
          </div>
        </div>` : ''}

      ${whenToUseHtml ? `
        <div class="concept-section">
          <h2 class="concept-section__title">When to Use / When Not to Use</h2>
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
            ${whenToUseHtml}
          </div>
        </div>` : ''}
    </div>`;
}

// Render body for 'explainer' template
function renderExplainerBody(concept, sections) {
  const introHtml = sections['intro'] || sections['intuition']
    ? parseMarkdownWithMath(sections['intro'] || sections['intuition'])
    : '';

  const diagramHtml = sections['diagram'] || sections['structure']
    ? parseMarkdownWithMath(sections['diagram'] || sections['structure'])
    : '';

  const misconceptionsHtml = sections['common misconceptions'] || sections['misconceptions']
    ? parseMarkdownWithMath(sections['common misconceptions'] || sections['misconceptions'])
    : '';

  return `
    <div class="concept-section">
      ${introHtml ? `
        <div class="concept-intuition" style="font-size: 1rem; line-height: 1.7;">
          <div class="concept-intuition__heading">Overview & Intuition</div>
          <div>${introHtml}</div>
        </div>` : ''}

      ${diagramHtml ? `
        <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
          <h2 class="concept-section__title">Framework & Structure</h2>
          <div>${diagramHtml}</div>
        </div>` : ''}

      ${misconceptionsHtml ? `
        <div class="misconception-callout">
          <div class="misconception-callout__title">
            <span>⚠️</span>
            <span>Common Misconceptions</span>
          </div>
          <div class="misconception-callout__text">
            ${misconceptionsHtml}
          </div>
        </div>` : ''}
    </div>`;
}

// Render body for 'interactive' template
function renderInteractiveBody(concept, sections) {
  const intuitionText = sections['intuition'] || sections['intro'] || '';
  const intuitionHtml = intuitionText ? parseMarkdownWithMath(intuitionText) : '';

  const defaultsStr = JSON.stringify(concept.defaults || {});
  
  // Example presets bar
  let presetsHtml = '';
  if (concept.examples && concept.examples.length > 0) {
    const buttons = concept.examples.map(ex => {
      const configStr = JSON.stringify(ex.config || {}).replace(/"/g, '&quot;');
      return `<button type="button" class="preset-btn" data-config="${configStr}">${ex.label}</button>`;
    }).join('\n');

    presetsHtml = `
      <div class="tool-presets-bar">
        <span class="tool-presets-bar__label">Load Scenario:</span>
        ${buttons}
      </div>`;
  }

  const formulaRaw = sections['formula'] || '';
  const formulaBlocksHtml = renderFormulaBlocks(formulaRaw);

  return `
    <div class="concept-section">
      ${intuitionHtml ? `
        <div class="concept-intuition" style="margin-bottom: 1.5rem;">
          <div class="concept-intuition__heading">Intuition</div>
          <div class="concept-intuition__text">${intuitionHtml}</div>
        </div>` : ''}

      <div class="tool-mount-wrapper">
        ${presetsHtml}
        <div id="tool-mount" class="tool-mount-container" data-component="${concept.component}" data-defaults="${defaultsStr.replace(/"/g, '&quot;')}">
          <!-- Interactive tool mounts here -->
        </div>
      </div>

      ${formulaBlocksHtml ? `
        <div class="collapsible-box">
          <div class="collapsible-box__header">
            <span>Underlying Mathematical Formula</span>
            <span class="collapsible-icon">▶</span>
          </div>
          <div class="collapsible-box__content">
            ${formulaBlocksHtml}
            ${sections['variable glossary'] ? `<div style="margin-top: 1rem;">${parseMarkdownWithMath(sections['variable glossary'])}</div>` : ''}
          </div>
        </div>` : ''}
    </div>`;
}

// Generate complete HTML file for a concept
function generateConceptHtml(concept) {
  let sections = {};
  if (concept.prose_ref) {
    const prosePath = resolve(repoRoot, concept.prose_ref);
    if (existsSync(prosePath)) {
      const mdContent = readFileSync(prosePath, 'utf8');
      sections = parseProseSections(mdContent);
    }
  }

  const isWide = concept.template === 'interactive';
  const containerClass = isWide ? 'concept-container concept-container--wide' : 'concept-container';

  let bodyHtml = '';
  if (concept.template === 'formula') {
    bodyHtml = renderFormulaBody(concept, sections);
  } else if (concept.template === 'explainer') {
    bodyHtml = renderExplainerBody(concept, sections);
  } else if (concept.template === 'interactive') {
    bodyHtml = renderInteractiveBody(concept, sections);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${concept.title} — Executive Finance</title>
  <link rel="stylesheet" href="/css/base.css" />
  <link rel="stylesheet" href="/css/components.css" />
  <link rel="stylesheet" href="/css/concepts.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body>

  ${renderSiteHeader('learn')}

  <main>
    ${renderConceptHero(concept)}

    <article class="concept-content">
      <div class="${containerClass}">
        ${bodyHtml}
        ${renderConceptFooter(concept, sections)}
      </div>
    </article>
  </main>

  <script type="module" src="/js/templates/concept-page.js"></script>
</body>
</html>`;
}

// Generate pages/learn/index.html (domain-grouped concept index)
function generateIndexHtml() {
  const domainGroups = {};
  for (const domain of Object.keys(DOMAIN_LABELS)) {
    domainGroups[domain] = [];
  }

  for (const c of registry.concepts) {
    if (!domainGroups[c.domain]) domainGroups[c.domain] = [];
    domainGroups[c.domain].push(c);
  }

  let sectionsHtml = '';
  for (const [domain, label] of Object.entries(DOMAIN_LABELS)) {
    const list = domainGroups[domain] || [];
    if (list.length === 0) continue;

    const cards = list.map(c => {
      const citations = formatCitations(c.sources);
      const tierBadge = `<span class="badge ${c.tier === 'core' ? 'badge-tier--core' : 'badge-tier--reference'}">${c.tier}</span>`;

      let proseSnippet = '';
      if (c.prose_ref && existsSync(resolve(repoRoot, c.prose_ref))) {
        proseSnippet = readFileSync(resolve(repoRoot, c.prose_ref), 'utf8')
          .replace(/[#*`$\\[\]()_|>-]/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 600);
      }

      const searchBlob = [
        c.id,
        c.title,
        c.domain,
        label,
        c.tier,
        c.template,
        citations.primary,
        citations.also,
        ...(c.related || []),
        proseSnippet
      ].join(' ').toLowerCase().replace(/"/g, '&quot;');

      return `
        <a href="/pages/learn/${c.id}.html" class="concept-card" data-tier="${c.tier}" data-domain="${c.domain}" data-search="${searchBlob}">
          <div class="concept-card__header">
            ${tierBadge}
            <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-text-muted);">${c.template}</span>
          </div>
          <div class="concept-card__title">${c.title}</div>
          <div class="concept-card__source">
            Primary: <strong>${citations.primary || 'Standard'}</strong>
          </div>
        </a>`;
    }).join('\n');

    sectionsHtml += `
      <section class="domain-section" data-domain="${domain}">
        <div class="domain-section__header">
          <h2 class="domain-section__title">
            <span class="badge badge-domain--${domain}">${domain}</span>
            <span>${label}</span>
          </h2>
          <span class="domain-section__count">${list.length} concept${list.length === 1 ? '' : 's'}</span>
        </div>
        <div class="concept-grid">
          ${cards}
        </div>
      </section>`;
  }

  const totalConcepts = registry.concepts.length;
  const filterBarHtml = `
    <div class="concept-filter-bar">
      <div class="concept-search-row">
        <div class="concept-search-wrapper">
          <span class="concept-search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            id="concept-search-input"
            class="concept-search-input"
            placeholder="Search ${totalConcepts} concepts by topic, keyword, formula, or book (e.g. WACC, Black-Scholes, 83(b), Penman, Kelly)..."
            aria-label="Search concepts"
            autocomplete="off"
          />
          <button type="button" id="concept-search-clear" class="concept-search-clear" title="Clear search" aria-label="Clear search">&times;</button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-group__label">Tier:</span>
        <button type="button" class="filter-btn filter-btn--active" data-filter-type="tier" data-filter-value="all">All Tiers</button>
        <button type="button" class="filter-btn" data-filter-type="tier" data-filter-value="core">Core Only</button>
        <button type="button" class="filter-btn" data-filter-type="tier" data-filter-value="reference">Reference Only</button>
      </div>
      <div class="filter-group">
        <span class="filter-group__label">Domain:</span>
        <button type="button" class="filter-btn filter-btn--active" data-filter-type="domain" data-filter-value="all">All Domains</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="corpfin">Corporate Finance</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="fsa">FSA &amp; Valuation</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="invest">Investments</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="deriv">Derivatives</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="risk">Risk</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="tax">Tax</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="macro">Macro</button>
        <button type="button" class="filter-btn" data-filter-type="domain" data-filter-value="behav">Behavioral</button>
      </div>
      <div class="concept-filter-meta">
        <span id="concept-results-count">Showing all ${totalConcepts} concepts</span>
        <span>Tip: Press <kbd style="padding: 1px 5px; background: var(--color-gray-100); border: 1px solid var(--color-border); border-radius: 3px; font-family: var(--font-mono);">/</kbd> to search</span>
      </div>
    </div>`;

  const emptyStateHtml = `
    <div id="concept-empty-state" class="concept-empty-state">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔎</div>
      <p style="font-size: 1.05rem; font-weight: 700; color: var(--color-gray-900); margin-bottom: 0.35rem;">
        No concepts match your search
      </p>
      <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1rem;">
        Try a broader keyword or reset the active domain and tier filters.
      </p>
      <button type="button" id="concept-reset-btn" class="filter-btn filter-btn--active" style="padding: 0.4rem 1rem;">
        Reset Search &amp; Filters
      </button>
    </div>`;

  if (registry.concepts.length === 0) {
    sectionsHtml = `
      <div style="padding: 4rem 2rem; text-align: center; background: var(--color-surface); border-radius: var(--radius-xl); border: 2px dashed var(--color-border);">
        <p style="font-size: 1.125rem; font-weight: 600; color: var(--color-gray-700); margin-bottom: 0.5rem;">
          Concept registry initialized
        </p>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); max-width: 500px; margin: 0 auto;">
          Concepts added to <code>concepts/registry.json</code> will automatically appear here grouped by domain.
        </p>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Concepts Reference — Executive Finance</title>
  <link rel="stylesheet" href="/css/base.css" />
  <link rel="stylesheet" href="/css/components.css" />
  <link rel="stylesheet" href="/css/concepts.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body>

  ${renderSiteHeader('learn')}

  <main>
    <section class="page__hero">
      <div class="container">
        <div class="page__hero-label">Interactive Reference</div>
        <h1 class="page__hero-title">Concepts Library</h1>
        <p class="page__hero-subtitle" style="max-width: 650px;">
          Personal reference library covering corporate finance, valuation, investments, derivatives, risk, and taxation.
          Organized by concept, driven by interactive tools, with notes for future-me.
        </p>
      </div>
    </section>

    <section class="concept-content">
      <div class="container">
        ${filterBarHtml}
        ${emptyStateHtml}
        ${sectionsHtml}
      </div>
    </section>
  </main>

  <script type="module" src="/js/learn/index.js"></script>
</body>
</html>`;
}

// Generate pages/reference/bibliography.html
function generateBibliographyHtml() {
  const booksRows = booksData.books.filter(b => b.id !== 'external').map(b => {
    const authors = b.authors.join(', ');
    const domainsHtml = (b.domains || []).map(d => `<span class="badge badge-domain--${d}" style="font-size: 0.65rem;">${d}</span>`).join(' ');
    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--color-primary);">${b.id}</td>
        <td>
          <div style="font-weight: 700; color: var(--color-gray-900);">${b.title}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${authors} ${b.edition ? `(${b.edition})` : ''}</div>
        </td>
        <td>${b.role}</td>
        <td>${domainsHtml}</td>
        <td style="font-family: var(--font-mono); font-size: 0.75rem;">${b.isbn || '—'}</td>
      </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bibliography — Executive Finance</title>
  <link rel="stylesheet" href="/css/base.css" />
  <link rel="stylesheet" href="/css/components.css" />
  <link rel="stylesheet" href="/css/concepts.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body>

  ${renderSiteHeader('bibliography')}

  <main>
    <section class="page__hero">
      <div class="container">
        <div class="page__hero-label">Reference Library</div>
        <h1 class="page__hero-title">Bibliography</h1>
        <p class="page__hero-subtitle" style="max-width: 650px;">
          The ten canonical reference texts sourcing the concepts in this application.
        </p>
      </div>
    </section>

    <section class="concept-content">
      <div class="container">
        <div style="background: var(--color-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border); overflow-x: auto; box-shadow: var(--shadow-sm);">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: var(--color-gray-50); border-bottom: 2px solid var(--color-border); text-align: left;">
                <th style="padding: 1rem;">ID</th>
                <th style="padding: 1rem;">Title & Author(s)</th>
                <th style="padding: 1rem;">Role</th>
                <th style="padding: 1rem;">Domains</th>
                <th style="padding: 1rem;">ISBN</th>
              </tr>
            </thead>
            <tbody>
              ${booksRows}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>

  <script type="module" src="/js/core/main.js"></script>
</body>
</html>`;
}

// Generate concepts/crosswalk.json
function generateCrosswalkJson() {
  const crosswalk = {};
  for (const c of registry.concepts) {
    crosswalk[c.id] = {
      title: c.title,
      domain: c.domain,
      tier: c.tier,
      sources: c.sources
    };
  }
  writeFileSync(resolve(repoRoot, 'concepts/crosswalk.json'), JSON.stringify(crosswalk, null, 2) + '\n');
}

// Main execution
console.log('Generating concept pages from concepts/registry.json...');

let generatedCount = 0;
for (const concept of registry.concepts) {
  const html = generateConceptHtml(concept);
  const outPath = resolve(learnDir, `${concept.id}.html`);
  writeFileSync(outPath, html, 'utf8');
  generatedCount++;
}

writeFileSync(resolve(learnDir, 'index.html'), generateIndexHtml(), 'utf8');
writeFileSync(resolve(refDir, 'bibliography.html'), generateBibliographyHtml(), 'utf8');
generateCrosswalkJson();

console.log(`✅ Generated ${generatedCount} concept page(s), learn index, bibliography, and crosswalk.json.`);

