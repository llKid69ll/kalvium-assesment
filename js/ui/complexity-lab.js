import { kmpSearch } from '../core/kmp.js';

const MIN_N = 10;
const MAX_N = 200;
const WORST_PATTERN = 'AAAAB';

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function countNaiveComparisons(text, pattern) {
  let comparisons = 0;
  const matches = [];

  if (pattern.length === 0 || pattern.length > text.length) {
    return { comparisons, matches };
  }

  for (let start = 0; start <= text.length - pattern.length; start += 1) {
    let offset = 0;
    while (offset < pattern.length) {
      comparisons += 1;
      if (text[start + offset] !== pattern[offset]) break;
      offset += 1;
    }
    if (offset === pattern.length) matches.push(start);
  }

  return { comparisons, matches };
}

function measureWorstCase(n) {
  const text = 'A'.repeat(n);
  const naive = countNaiveComparisons(text, WORST_PATTERN);
  const kmp = kmpSearch(text, WORST_PATTERN);
  return { n, naive: naive.comparisons, kmp: kmp.comparisons };
}

function renderCurve(n) {
  const values = Array.from({ length: MAX_N - MIN_N + 1 }, (_, index) => measureWorstCase(index + MIN_N));
  const chart = { left: 44, right: 620, top: 20, bottom: 188 };
  const maximum = Math.max(...values.map((point) => point.naive));
  const x = (value) => chart.left + ((value - MIN_N) / (MAX_N - MIN_N)) * (chart.right - chart.left);
  const y = (value) => chart.bottom - (value / maximum) * (chart.bottom - chart.top);
  const naivePoints = values.map((point) => `${x(point.n).toFixed(1)},${y(point.naive).toFixed(1)}`).join(' ');
  const kmpPoints = values.map((point) => `${x(point.n).toFixed(1)},${y(point.kmp).toFixed(1)}`).join(' ');
  const selected = values[n - MIN_N];
  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((fraction) => {
      const position = chart.bottom - fraction * (chart.bottom - chart.top);
      return `<line x1="${chart.left}" y1="${position}" x2="${chart.right}" y2="${position}" class="chart-grid" />`;
    })
    .join('');

  return `
    <div class="curve-chart">
      <div class="curve-heading"><strong>Adversarial family: text = A<sup>n</sup>, pattern = AAAAB</strong><span>At n = ${n}: naive ${selected.naive}, KMP ${selected.kmp}</span></div>
      <svg class="complexity-curve-svg" viewBox="0 0 660 230" role="img" aria-label="Worst-case comparisons as text length grows from 10 to 200">
        ${gridLines}
        <line x1="${chart.left}" y1="${chart.top}" x2="${chart.left}" y2="${chart.bottom}" class="chart-axis" />
        <line x1="${chart.left}" y1="${chart.bottom}" x2="${chart.right}" y2="${chart.bottom}" class="chart-axis" />
        <polyline points="${naivePoints}" class="curve-naive" />
        <polyline points="${kmpPoints}" class="curve-kmp" />
        <text x="${chart.left}" y="215" class="chart-label">10</text>
        <text x="${chart.right}" y="215" text-anchor="end" class="chart-label">200 text characters (n)</text>
        <text x="12" y="${chart.top + 6}" class="chart-label">comparisons</text>
      </svg>
      <div class="curve-legend"><span><i class="curve-key naive-key"></i>Naive</span><span><i class="curve-key kmp-key"></i>KMP</span></div>
    </div>
  `;
}

export function renderComplexity(
  text = 'AAAAAAAAAAAAAB',
  pattern = 'AAAAB',
  targetId = 'module-5-body',
) {
  const target = document.getElementById(targetId);
  if (!target || target.dataset.initialized === 'true') return;

  const state = { text, pattern, n: 40 };

  target.innerHTML = `
    <div class="complexity-lab">
      <section class="card complexity-inputs">
        <div class="complexity-input-row">
          <label>Text <input class="input" data-field="text" value="${escapeHTML(state.text)}" /></label>
          <label>Pattern <input class="input" data-field="pattern" value="${escapeHTML(state.pattern)}" /></label>
          <button type="button" class="primary-btn" data-action="compare">Compare</button>
        </div>
      </section>

      <section class="comparison-panel" aria-live="polite">
        <h3>Comparisons on your input</h3>
        <div class="comparison-bars"></div>
        <div class="comparison-summary"></div>
      </section>

      <section class="curve-panel">
        <div class="curve-controls">
          <label for="complexity-n-slider">Text length n</label>
          <input id="complexity-n-slider" type="range" min="${MIN_N}" max="${MAX_N}" value="${state.n}" />
          <output id="complexity-n-value">${state.n}</output>
        </div>
        <div class="curve-chart-container"></div>
      </section>

      <section class="proof-panel">
        <h3>Why matching is linear</h3>
        <ol>
          <li><strong>i never decreases.</strong> It moves from left to right across the text, at most n positions.</li>
          <li><strong>j rises at most n times.</strong> Each increase is one successful character comparison while i advances.</li>
          <li><strong>Every fallback lowers j.</strong> j cannot fall below zero, so the total number of fallbacks is at most the total increases: n.</li>
          <li><strong>So the total is O(n + m).</strong> Matching is O(n), and building the LPS table is O(m).</li>
        </ol>
        <p class="space-reason"><strong>Space: O(m).</strong> The LPS table stores one value per pattern position; matching uses O(1) extra space apart from the returned match list.</p>
      </section>
    </div>
  `;

  const updateComparison = () => {
    const naive = countNaiveComparisons(state.text, state.pattern);
    const kmp = kmpSearch(state.text, state.pattern);
    const maximum = Math.max(naive.comparisons, kmp.comparisons, 1);
    const bars = target.querySelector('.comparison-bars');
    bars.innerHTML = [
      { label: 'Naive', value: naive.comparisons, className: 'bar-naive' },
      { label: 'KMP', value: kmp.comparisons, className: 'bar-kmp' },
    ].map(({ label, value, className }) => `
      <div class="comparison-row">
        <span>${label}</span>
        <div class="bar-track"><div class="comparison-bar ${className}" style="width:${(value / maximum) * 100}%"></div></div>
        <strong>${value}</strong>
      </div>
    `).join('');
    target.querySelector('.comparison-summary').textContent =
      `Matches: naive ${naive.matches.length}; KMP ${kmp.matches.length}.`;
  };

  const updateCurve = () => {
    target.querySelector('#complexity-n-value').textContent = state.n;
    target.querySelector('.curve-chart-container').innerHTML = renderCurve(state.n);
  };

  target.addEventListener('input', (event) => {
    if (event.target.dataset.field === 'text') {
      state.text = event.target.value;
    } else if (event.target.dataset.field === 'pattern') {
      state.pattern = event.target.value;
    } else if (event.target.id === 'complexity-n-slider') {
      state.n = Number(event.target.value);
      updateCurve();
    }
  });

  target.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="compare"]')) {
      state.text = target.querySelector('[data-field="text"]').value;
      state.pattern = target.querySelector('[data-field="pattern"]').value;
      updateComparison();
    }
  });

  target.dataset.initialized = 'true';
  updateComparison();
  updateCurve();
}