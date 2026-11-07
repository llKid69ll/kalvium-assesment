import { buildLpsSteps } from '../core/kmp.js';
import { moduleTwoContent } from '../content/lesson.js';

const PRESETS = moduleTwoContent.presets;

function normalizePattern(value) {
  return (value || '').replace(/\s+/g, '');
}

function buildFallbackText(step) {
  const previousLength = Number(step.j ?? step.length ?? 0);
  const fallbackValue = Number(step.length ?? 0);
  return `length = lps[${previousLength} - 1] = lps[${Math.max(previousLength - 1, 0)}] = ${fallbackValue}`;
}

function getReasonText(pattern, index, correctValue) {
  const prefix = pattern.slice(0, correctValue);
  const suffix = pattern.slice(index - correctValue + 1, index + 1);
  const before = pattern.slice(0, index + 1);
  return `Correct. "${prefix}" is the longest proper prefix that also matches the suffix at the end of "${before}". The suffix here is "${suffix}".`;
}

export function renderLpsVisualizer(targetId = 'module-2-body') {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (target.dataset.initialized === 'true') {
    return;
  }

  const state = {
    pattern: PRESETS[0].pattern,
    steps: [],
    index: 0,
    playing: false,
    timer: null,
    predictMode: true,
    predictionValue: '',
    predictionChecked: false,
    predictionCorrect: null,
    predictionMessage: '',
  };

  const loadPattern = (nextValue) => {
    const pattern = normalizePattern(nextValue || state.pattern);
    state.pattern = pattern || PRESETS[0].pattern;
    state.steps = [...buildLpsSteps(state.pattern)];
    state.index = 0;
    state.playing = false;
    state.predictionValue = '';
    state.predictionChecked = false;
    state.predictionCorrect = null;
    state.predictionMessage = '';
    clearInterval(state.timer);
    render();
  };

  const stepForward = () => {
    const step = state.steps[state.index];
    if (!step) return;
    if (state.predictMode && step.event === 'match' && !state.predictionChecked) {
      return;
    }
    if (state.index < state.steps.length - 1) {
      state.index += 1;
      state.predictionChecked = false;
      state.predictionCorrect = null;
      state.predictionValue = '';
      state.predictionMessage = '';
      render();
    }
  };

  const stepBackward = () => {
    if (state.index > 0) {
      state.index -= 1;
      state.predictionChecked = false;
      state.predictionCorrect = null;
      state.predictionValue = '';
      state.predictionMessage = '';
      render();
    }
  };

  const togglePlay = () => {
    if (state.playing) {
      state.playing = false;
      clearInterval(state.timer);
      render();
      return;
    }

    state.playing = true;
    state.timer = setInterval(() => {
      const step = state.steps[state.index];
      if (state.predictMode && step && step.event === 'match' && !state.predictionChecked) {
        return;
      }
      if (state.index >= state.steps.length - 1) {
        state.playing = false;
        clearInterval(state.timer);
        render();
        return;
      }
      state.index += 1;
      state.predictionChecked = false;
      state.predictionCorrect = null;
      state.predictionValue = '';
      state.predictionMessage = '';
      render();
    }, 1200);
    render();
  };

  const checkPrediction = () => {
    const step = state.steps[state.index];
    if (!step || step.event !== 'match') return;

    const guess = Number(state.predictionValue);
    const correctValue = step.lps[step.i];
    const isCorrect = Number.isFinite(guess) && guess === correctValue;

    state.predictionChecked = true;
    state.predictionCorrect = isCorrect;
    state.predictionMessage = isCorrect
      ? getReasonText(state.pattern, step.i, correctValue)
      : `Not quite. The correct value is ${correctValue}. ${getReasonText(state.pattern, step.i, correctValue)}`;
    render();
  };

  const render = () => {
    const step = state.steps[state.index];
    const patternCells = [...state.pattern].map((char, index) => {
      const prefixLength = step ? step.length ?? 0 : 0;
      const suffixStart = step && step.i !== undefined ? Math.max(0, step.i - Math.max(prefixLength - 1, 0)) : index;
      const isPrefix = index < prefixLength;
      const isSuffix = step && step.i !== undefined && index >= suffixStart && index <= step.i;
      const isCurrent = step && index === step.i;
      const cellClass = [
        'lps-cell',
        isPrefix ? 'prefix-highlight' : '',
        isSuffix ? 'suffix-highlight' : '',
        isCurrent ? 'current-highlight' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<div class="${cellClass}">${char}</div>`;
    });

    const lpsValues = Array.from({ length: state.pattern.length }, (_, index) => {
      const isRevealIndex = step && step.i === index && state.predictMode && step.event === 'match' && !state.predictionChecked;
      const baseValue = step && Array.isArray(step.lps) ? step.lps[index] : 0;
      if (isRevealIndex) {
        return '<div class="lps-cell lps-hidden">?</div>';
      }
      return `<div class="lps-cell ${index === step?.i ? 'current-highlight' : ''}">${baseValue ?? 0}</div>`;
    }).join('');

    let messageText = step ? step.message : 'Pick a preset or type a pattern to begin.';
    if (step && step.event === 'fallback') {
      messageText = buildFallbackText(step);
    }

    let predictionMarkup = '';
    if (state.predictMode && step && step.event === 'match' && !state.predictionChecked) {
      predictionMarkup = `
        <div class="predict-panel">
          <label for="lps-predict-input">Predict lps[${step.i}]</label>
          <div class="predict-row">
            <input id="lps-predict-input" type="number" min="0" value="${state.predictionValue}" placeholder="Enter a number" />
            <button type="button" class="primary-btn" data-action="check-prediction">Check</button>
          </div>
        </div>
      `;
    } else if (state.predictMode && step && step.event === 'match' && state.predictionChecked) {
      const className = state.predictionCorrect ? 'predict-success' : 'predict-error';
      predictionMarkup = `
        <div class="predict-panel ${className}">
          <strong>${state.predictionCorrect ? 'Correct' : 'Try again'}</strong>
          <p>${state.predictionMessage}</p>
        </div>
      `;
    }

    const presetButtons = PRESETS.map(
      (preset) => `
        <button type="button" class="ghost-btn preset-btn ${state.pattern === preset.pattern ? 'is-selected' : ''}" data-action="load-preset" data-pattern="${preset.pattern}">
          ${preset.pattern}
        </button>
      `,
    ).join('');

    const currentPreset = PRESETS.find((preset) => preset.pattern === state.pattern) || PRESETS[0];

    target.innerHTML = `
      <div class="card">
        <p>${moduleTwoContent.intro}</p>
        <div class="module-2-presets">
          <div class="preset-group">${presetButtons}</div>
          <div class="pattern-row">
            <input id="lps-pattern-input" class="input" type="text" value="${state.pattern}" aria-label="Pattern to analyze" />
            <button type="button" class="primary-btn" data-action="load-pattern">Load</button>
          </div>
        </div>

        <div class="step-controls">
          <button type="button" class="ghost-btn" data-action="back" ${state.index === 0 ? 'disabled' : ''}>Back</button>
          <button type="button" class="primary-btn" data-action="step" ${state.predictMode && step && step.event === 'match' && !state.predictionChecked ? 'disabled' : ''}>Step</button>
          <button type="button" class="ghost-btn" data-action="play">${state.playing ? 'Pause' : 'Play'}</button>
          <button type="button" class="ghost-btn" data-action="reset">Reset</button>
        </div>

        <div class="lps-legend">
          <span><i class="legend-swatch prefix-swatch"></i> prefix</span>
          <span><i class="legend-swatch suffix-swatch"></i> suffix</span>
        </div>

        <div class="lps-display">
          <div class="lps-row">
            <div class="lps-label">Pattern</div>
            ${patternCells}
          </div>
          <div class="lps-row">
            <div class="lps-label">LPS</div>
            ${lpsValues}
          </div>
        </div>

        <div class="info-box">
          <strong>What to notice</strong>
          <p>${currentPreset.notice}</p>
        </div>

        <div class="message-box">
          ${messageText}
        </div>

        ${predictionMarkup}
      </div>
    `;

    const input = document.getElementById('lps-pattern-input');
    if (input) {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          loadPattern(input.value);
        }
      });
    }

    const patternInputValue = document.getElementById('lps-predict-input');
    if (patternInputValue) {
      patternInputValue.addEventListener('input', (event) => {
        state.predictionValue = event.target.value;
      });
    }
  };

  target.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    if (action === 'load-pattern') {
      const input = document.getElementById('lps-pattern-input');
      loadPattern(input ? input.value : state.pattern);
      return;
    }

    if (action === 'load-preset') {
      loadPattern(button.dataset.pattern || state.pattern);
      return;
    }

    if (action === 'step') {
      stepForward();
      return;
    }

    if (action === 'back') {
      stepBackward();
      return;
    }

    if (action === 'play') {
      togglePlay();
      return;
    }

    if (action === 'reset') {
      loadPattern(state.pattern);
      return;
    }

    if (action === 'check-prediction') {
      checkPrediction();
    }
  });

  target.dataset.initialized = 'true';
  loadPattern(state.pattern);
}
