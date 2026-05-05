/**
 * index.js -- Learn section chapter grid
 */
import { isChapterComplete, getProgress } from '/js/core/progress-tracker.js';

const CHAPTERS = [
  { id: 'ch01', num: 1,  title: 'Financial Management and Value Creation: An Overview',  part: 'I' },
  { id: 'ch02', num: 2,  title: 'The Time Value of Money',                                part: 'I' },
  { id: 'ch03', num: 3,  title: 'Risk and Return',                                        part: 'I' },
  { id: 'ch04', num: 4,  title: 'Interpreting Financial Statements',                      part: 'II' },
  { id: 'ch05', num: 5,  title: 'Analyzing Operational Efficiency and Liquidity',         part: 'II' },
  { id: 'ch06', num: 6,  title: 'Analyzing Profitability, Risk, and Growth',              part: 'II' },
  { id: 'ch07', num: 7,  title: 'Using the Net Present Value Rule',                       part: 'III' },
  { id: 'ch08', num: 8,  title: 'Alternatives to the Net Present Value Rule',             part: 'III' },
  { id: 'ch09', num: 9,  title: 'Identifying and Estimating a Project's Cash Flows',     part: 'III' },
  { id: 'ch10', num: 10, title: 'Valuing Bonds and Stocks',                               part: 'IV' },
  { id: 'ch11', num: 11, title: 'Raising Capital and Paying Out Cash',                    part: 'IV' },
  { id: 'ch12', num: 12, title: 'Estimating the Cost of Capital',                         part: 'IV' },
  { id: 'ch13', num: 13, title: 'Designing a Capital Structure',                          part: 'IV' },
  { id: 'ch14', num: 14, title: 'Valuing and Acquiring a Business',                       part: 'V' },
  { id: 'ch15', num: 15, title: 'Managing Corporate Risk',                                part: 'V' },
  { id: 'ch16', num: 16, title: 'Understanding Forward, Futures, and Options',            part: 'V' },
  { id: 'ch17', num: 17, title: 'Making International Business Decisions',                part: 'V' },
  { id: 'ch18', num: 18, title: 'Managing for Value Creation',                            part: 'V' },
];

const PARTS = {
  'I':   'Financial Concepts and Techniques',
  'II':  'Assessing Business Performance',
  'III': 'Making Investment Decisions',
  'IV':  'Making Financing Decisions',
  'V':   'Making Business Decisions',
};

function renderGrid() {
  const grid = document.getElementById('chapter-grid');
  if (!grid) return;

  let currentPart = null;
  let html = '';

  CHAPTERS.forEach(ch => {
    if (ch.part !== currentPart) {
      currentPart = ch.part;
      html += '<div class="chapter-part-header">Part ' + ch.part + ': ' + PARTS[ch.part] + '</div>';
    }
    const done = isChapterComplete(ch.id);
    html += '<a href="/pages/learn/' + ch.id + '.html" class="chapter-card ' + (done ? 'chapter-card--complete' : '') + '">'
      + '<div class="chapter-card__num">Ch. ' + ch.num + '</div>'
      + '<div class="chapter-card__title">' + ch.title + '</div>'
      + (done ? '<div class="chapter-card__badge">&#10003; Complete</div>' : '')
      + '</a>';
  });

  grid.innerHTML = html;
}

function renderProgress() {
  const prog  = getProgress();
  const total = CHAPTERS.length;
  const done  = prog.completed;
  const pct   = Math.round((done / total) * 100);
  const bar   = document.getElementById('learn-progress-fill');
  const label = document.getElementById('learn-progress-label');
  if (bar)   bar.style.width   = pct + '%';
  if (label) label.textContent = done + ' of ' + total + ' chapters complete';
}

document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  renderProgress();
});
