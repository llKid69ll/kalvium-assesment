import { kmpSearchSteps } from '../core/kmp.js';

const PRESETS = [
  { text: 'ABABABCABABX', pattern: 'ABABX' },
  { text: 'AAAAAA', pattern: 'AAA' },
  { text: 'AAAAAAAAB', pattern: 'AAAAB' },
  { text: 'ABCD', pattern: 'EFG' },
];

const EVENT_LABELS = {
  compare: 'Match',
  fallback: 'Fallback',
  advance: 'Mismatch at j = 0',
  found: 'Pattern found',
  done: 'Search complete',
};

const escapeHTML = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

function getFallbackCaption(pattern, step) {
  const fallback = step.lps[step.j - 1] ?? 0;
  const matched = pattern.slice(step.j - fallback, step.j);
  const kept = pattern.slice(0, fallback);
  return `The last '${matched}' we matched is also the start of the pattern, so we keep it${kept && kept !== matched ? ` as '${kept}'` : ''}.`;
}

function getPredictionReason(step) {
  if (!step) return 'The search is complete.';
  if (step.event === 'compare') {
    return `text[${step.i}] '${step.textChar}' matches pattern[${step.j}] '${step.patternChar}', so both pointers advance.`;
  }
  if (step.event === 'fallback') {
    return `text[${step.i}] '${step.textChar}' does not match pattern[${step.j}] '${step.patternChar}'. LPS moves j from ${step.j} to ${step.length}; i stays put.`;
  }
  if (step.event === 'advance') {
    return `text[${step.i}] '${step.textChar}' does not match pattern[0] '${step.patternChar}'. Since j is 0, i advances.`;
  }
  if (step.event === 'found') return step.message;
  return step.message;
}

function makeSearchSteps(text, pattern) {
  return [...kmpSearchSteps(text, pattern)].map((step) => ({
    ...step,
    textChar: text[step.i] ?? '',
    patternChar: pattern[step.j] ?? '',
  }));
}

function runNaive(text, pattern) {
  const matches = [];
  const comparedPositions = new Map();
  let comparisons = 0;

  if (pattern.length > 0) {
    for (let start = 0; start <= text.length - pattern.length; start += 1) {
      let offset = 0;
      while (offset < pattern.length) {
        const textIndex = start + offset;
        comparisons += 1;
        comparedPositions.set(textIndex, (comparedPositions.get(textIndex) ?? 0) + 1);
        if (text[textIndex] !== pattern[offset]) break;
        offset += 1;
      }
      if (offset === pattern.length) matches.push(start);
    }
  }

  const rereads = [...comparedPositions.values()].reduce((total, count) => total + count - 1, 0);
  return { matches, comparisons, rereads };
}

export function renderMatchVisualizer(
  text = PRESETS[0].text,
  pattern = PRESETS[0].pattern,
  targetId = 'module-3-body',
) {
  const target = document.getElementById(targetId);
  if (!target || target.dataset.initialized === 'true') return;

  const state = {
    text,
    pattern,
    steps: [],
    index: 0,
    playing: false,
    timer: null,
    showNaive: false,
    predictMode: false,
    prediction: '',
    predictionChecked: false,
    predictionCorrect: false,
  };

  const reset = (nextText = state.text, nextPattern = state.pattern) => {
    clearInterval(state.timer);
    state.playing = false;
    state.text = nextText;
    state.pattern = nextPattern;
    state.steps = makeSearchSteps(state.text, state.pattern);
    state.index = 0;
    state.prediction = '';
    state.predictionChecked = false;
    state.predictionCorrect = false;
    render();
  };

  const currentStep = () => state.steps[state.index] ?? null;

  const advance = () => {
    const next = state.steps[state.index + 1];
    if (!next) return;
    if (state.predictMode && !state.predictionChecked) return;
    state.index += 1;
    state.prediction = '';
    state.predictionChecked = false;
    state.predictionCorrect = false;
    render();
  };

  const togglePlay = () => {
    if (state.playing) {
      clearInterval(state.timer);
      state.playing = false;
      render();
      return;
    }
    state.playing = true;
    state.timer = setInterval(() => {
      if (state.index >= state.steps.length - 1) {
        clearInterval(state.timer);
        state.playing = false;
        render();
        return;
      }
      if (state.predictMode && !state.predictionChecked) return;
      state.index += 1;
      state.prediction = '';
      state.predictionChecked = false;
      state.predictionCorrect = false;
      render();
    }, 1100);
    render();
  };

  const checkPrediction = () => {
    const next = state.steps[state.index + 1];
    if (!next) return;
    state.predictionChecked = true;
    state.predictionCorrect = state.prediction === next.event;
    render();
  };

  const render = () => {
    const step = currentStep();
    const fallbackValue = step?.event === 'fallback' ? step.lps[step.j - 1] ?? 0 : null;
    const displayedJ = step?.event === 'fallback' ? fallbackValue : step?.j ?? 0;
    const alignment = step ? step.i - displayedJ : 0;
    const cellStep = 44;
    const matchedText = new Map();
    for (let index = 0; index <= state.index; index += 1) {
      const recorded = state.steps[index];
      if (recorded.event === 'compare') matchedText.set(recorded.i, 'matched');
      if (recorded.event === 'advance' || recorded.event === 'fallback') matchedText.set(recorded.i, 'mismatch');
      if (recorded.event === 'found') {
        for (let matchedIndex = recorded.i - state.pattern.length + 1; matchedIndex <= recorded.i; matchedIndex += 1) {
          matchedText.set(matchedIndex, 'matched');
        }
      }
    }

    const textCells = [...state.text].map((character, index) => {
      const stateClass = matchedText.get(index) ?? '';
      const isCurrent = step && index === step.i;
      const pointer = isCurrent ? '<span class="match-pointer">i</span>' : '';
      return `<span class="match-cell ${stateClass} ${isCurrent ? 'is-current' : ''}">${escapeHTML(character)}${pointer}</span>`;
    }).join('');

    const patternCells = [...state.pattern].map((character, index) => {
      const isCurrent = step && index === displayedJ;
      let stateClass = '';
      if (step?.event === 'fallback' && index < displayedJ) stateClass = 'retained';
      else if ((step?.event === 'compare' || step?.event === 'found') && index < (step.event === 'found' ? state.pattern.length : step.j)) stateClass = 'matched';
      else if ((step?.event === 'fallback' || step?.event === 'advance') && index === step.j) stateClass = 'mismatch';
      const pointer = isCurrent ? '<span class="match-pointer">j</span>' : '';
      return `<span class="match-cell ${stateClass} ${isCurrent ? 'is-current' : ''}">${escapeHTML(character)}${pointer}</span>`;
    }).join('');

    const stepMessage = step?.event === 'fallback' ? getFallbackCaption(state.pattern, step) : step?.message ?? 'Search is ready.';
    const next = state.steps[state.index + 1];
    const predictionPanel = state.predictMode && next
      ? state.predictionChecked
        ? `<div class="match-prediction ${state.predictionCorrect ? 'predict-success' : 'predict-error'}"><strong>${state.predictionCorrect ? 'Correct' : 'Not quite'}</strong><p>${escapeHTML(getPredictionReason(next))}</p></div>`
        : `<div class="match-prediction"><label for="match-prediction-select">What happens next?</label><div class="match-controls"><select id="match-prediction-select" class="input"><option value="">Choose an outcome</option>${Object.entries(EVENT_LABELS).map(([event, label]) => `<option value="${event}" ${state.prediction === event ? 'selected' : ''}>${label}</option>`).join('')}</select><button type="button" class="primary-btn" data-action="check-prediction">Check</button></div></div>`
      : '';

    const naive = state.showNaive ? runNaive(state.text, state.pattern) : null;
    const presetButtons = PRESETS.map((preset) => `<button type="button" class="ghost-btn preset-btn" data-action="preset" data-text="${preset.text}" data-pattern="${preset.pattern}">${preset.text} / ${preset.pattern}</button>`).join('');
    const shiftAmount = step?.event === 'fallback' ? step.j - fallbackValue : 0;
    const animationClass = step?.event === 'fallback' ? 'is-sliding' : '';

    target.innerHTML = `
      <div class="match-visualizer">
        <div class="card match-inputs">
          <div class="match-presets">${presetButtons}</div>
          <div class="match-controls">
            <label>Text <input class="input" data-field="text" value="${escapeHTML(state.text)}" /></label>
            <label>Pattern <input class="input" data-field="pattern" value="${escapeHTML(state.pattern)}" /></label>
            <button type="button" class="primary-btn" data-action="load">Load</button>
          </div>
          <div class="match-options">
            <label><input type="checkbox" data-option="predict" ${state.predictMode ? 'checked' : ''} /> What happens next?</label>
            <label><input type="checkbox" data-option="naive" ${state.showNaive ? 'checked' : ''} /> Compare with naive search</label>
          </div>
        </div>

        <div class="match-workspace ${state.showNaive ? 'with-naive' : ''}">
          <section class="match-stage" aria-label="KMP search state">
            <div class="match-controls step-controls">
              <button type="button" class="ghost-btn" data-action="back" ${state.index === 0 ? 'disabled' : ''}>Back</button>
              <button type="button" class="primary-btn" data-action="step" ${!next || (state.predictMode && !state.predictionChecked) ? 'disabled' : ''}>Step</button>
              <button type="button" class="ghost-btn" data-action="play" ${!next && !state.playing ? 'disabled' : ''}>${state.playing ? 'Pause' : 'Play'}</button>
              <button type="button" class="ghost-btn" data-action="reset">Reset</button>
            </div>
            <div class="match-board-scroll">
              <div class="match-board" style="--match-columns:${state.text.length};">
                <div class="match-row text-row">${textCells}</div>
                <div class="match-pattern-row ${animationClass}" style="--pattern-offset:${alignment * cellStep}px; --fallback-shift:${shiftAmount * cellStep}px;">${patternCells}</div>
              </div>
            </div>
            <div class="match-legend"><span><i class="match-swatch matched-swatch"></i>matched</span><span><i class="match-swatch mismatch-swatch"></i>mismatch</span><span><i class="match-swatch retained-swatch"></i>retained by LPS</span></div>
            <div class="message-box" aria-live="polite">${escapeHTML(stepMessage)}</div>
            ${predictionPanel}
            <div class="match-stats"><strong>Text characters re-read</strong><output>0</output><span>KMP keeps i moving forward.</span></div>
          </section>
          ${state.showNaive ? `<section class="naive-stage" aria-label="Naive search comparison"><h3>Naive search</h3><div class="naive-row">${[...state.text].map((character) => `<span class="match-cell">${escapeHTML(character)}</span>`).join('')}</div><div class="naive-results"><p><strong>Comparisons</strong> ${naive.comparisons}</p><p><strong>Characters re-read</strong> ${naive.rereads}</p><p><strong>Matches</strong> ${naive.matches.length ? naive.matches.join(', ') : 'none'}</p></div><p class="muted-copy">Naive search restarts at the next text position after a mismatch.</p></section>` : ''}
        </div>
      </div>
    `;

    const patternRow = target.querySelector('.match-pattern-row');
    if (patternRow) {
      patternRow.style.transform = `translateX(${alignment * cellStep}px)`;
    }
  };

  target.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action === 'preset') {
      reset(button.dataset.text, button.dataset.pattern);
    } else if (button.dataset.action === 'load') {
      reset(target.querySelector('[data-field="text"]').value, target.querySelector('[data-field="pattern"]').value);
    } else if (button.dataset.action === 'step') {
      advance();
    } else if (button.dataset.action === 'back') {
      if (state.index > 0) {
        state.index -= 1;
        state.prediction = '';
        state.predictionChecked = false;
        render();
      }
    } else if (button.dataset.action === 'play') {
      togglePlay();
    } else if (button.dataset.action === 'reset') {
      reset();
    } else if (button.dataset.action === 'check-prediction') {
      checkPrediction();
    }
  });

  target.addEventListener('change', (event) => {
    if (event.target.dataset.option === 'predict') {
      state.predictMode = event.target.checked;
      state.prediction = '';
      state.predictionChecked = false;
      render();
    } else if (event.target.dataset.option === 'naive') {
      state.showNaive = event.target.checked;
      render();
    } else if (event.target.id === 'match-prediction-select') {
      state.prediction = event.target.value;
    }
  });

  target.dataset.initialized = 'true';
  reset(text, pattern);
}