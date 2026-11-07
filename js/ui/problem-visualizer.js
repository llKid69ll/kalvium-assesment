import { naiveSteps } from '../core/naive-steps.js';
import { COPY, PRESETS } from '../content/problem-copy.js';
import { renderBoard } from './problem-board.js';

export function mountProblem(root) {
  if (!root) return;

  root.innerHTML = `
    <section class="pb-problem">
      <h3 class="pb-goal"></h3>
      <p class="pb-explain"></p>
      <div class="pb-inputs">
        <label class="pb-field">Text <input class="pb-input" data-field="text" maxlength="24"></label>
        <label class="pb-field">Pattern <input class="pb-input" data-field="pattern" maxlength="12"></label>
        <button class="pb-button" type="button" data-action="load">Load</button>
      </div>
      <div class="pb-presets" aria-label="Examples">
        <button class="pb-button" type="button" data-preset="0"></button>
        <button class="pb-button" type="button" data-preset="1"></button>
        <button class="pb-button" type="button" data-preset="2"></button>
      </div>
      <div class="pb-controls">
        <button class="pb-button" type="button" data-action="reset">Reset</button>
        <button class="pb-button" type="button" data-action="back">◀ Step back</button>
        <button class="pb-button" type="button" data-action="step">Step ▶</button>
        <button class="pb-button" type="button" data-action="play">Play</button>
        <span class="pb-step-label"></span>
      </div>
      <div class="pb-scroll"><div class="pb-board-host"></div></div>
      <p class="pb-message" aria-live="polite"></p>
      <dl class="pb-stats">
        <div><dt>Comparisons</dt><dd data-stat="comparisons">0</dd></div>
        <div><dt>Re-reads</dt><dd data-stat="rereads">0</dd></div>
        <div><dt>Matches</dt><dd data-stat="matches">0</dd></div>
      </dl>
      <section class="pb-predict">
        <p class="pb-predict-question"></p>
        <label class="pb-field">Your prediction <input class="pb-input" data-field="guess" type="number" min="0"></label>
        <button class="pb-button" type="button" data-action="check">Check</button>
        <p class="pb-feedback" aria-live="polite"></p>
      </section>
      <p class="pb-takeaway"></p>
    </section>
  `;

  const textInput = root.querySelector('[data-field="text"]');
  const patternInput = root.querySelector('[data-field="pattern"]');
  const guessInput = root.querySelector('[data-field="guess"]');
  const host = root.querySelector('.pb-board-host');
  const message = root.querySelector('.pb-message');
  const backButton = root.querySelector('[data-action="back"]');
  const stepButton = root.querySelector('[data-action="step"]');
  const playButton = root.querySelector('[data-action="play"]');
  const state = { steps: [], idx: 0, timer: null, text: '', pattern: '' };

  root.querySelector('.pb-goal').textContent = COPY.goal;
  root.querySelector('.pb-explain').textContent = COPY.explain;
  root.querySelector('.pb-takeaway').textContent = COPY.takeaway;
  root.querySelectorAll('[data-preset]').forEach((button, index) => {
    button.textContent = PRESETS[index].label;
  });

  const stopTimer = () => {
    if (state.timer !== null) clearInterval(state.timer);
    state.timer = null;
    playButton.textContent = 'Play';
  };

  const show = () => {
    const step = state.steps[state.idx];
    if (!step) return;
    renderBoard(host, state.text, state.pattern, step);
    message.textContent = step.message;
    root.querySelector('.pb-step-label').textContent = `Step ${state.idx + 1} of ${state.steps.length}`;
    root.querySelector('[data-stat="comparisons"]').textContent = step.comparisons;
    root.querySelector('[data-stat="rereads"]').textContent = step.comparisons - step.seen.filter((count) => count > 0).length;
    root.querySelector('[data-stat="matches"]').textContent = step.matches.length;
    backButton.disabled = state.idx === 0;
    stepButton.disabled = state.idx === state.steps.length - 1;
  };

  const load = (text, pattern) => {
    stopTimer();
    if (!text || !pattern) {
      host.replaceChildren();
      message.textContent = 'Enter both a text and a pattern to begin.';
      root.querySelector('.pb-step-label').textContent = 'Step 0 of 0';
      return;
    }
    state.text = text;
    state.pattern = pattern;
    state.steps = [...naiveSteps(text, pattern)];
    state.idx = 0;
    root.querySelector('.pb-predict-question').textContent = `Predict: how many character comparisons will naive search make for pattern "${pattern}" in "${text}"?`;
    guessInput.value = '';
    root.querySelector('.pb-feedback').textContent = '';
    show();
  };

  const forward = () => {
    if (state.idx < state.steps.length - 1) state.idx += 1;
    show();
    if (state.idx === state.steps.length - 1) stopTimer();
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action], [data-preset]');
    if (!button) return;
    const action = button.dataset.action;

    if (action !== 'play') stopTimer();
    if (button.dataset.preset !== undefined) {
      const preset = PRESETS[Number(button.dataset.preset)];
      textInput.value = preset.text;
      patternInput.value = preset.pattern;
      load(preset.text, preset.pattern);
    } else if (action === 'load') {
      load(textInput.value, patternInput.value);
    } else if (action === 'reset') {
      state.idx = 0;
      show();
    } else if (action === 'back') {
      if (state.idx > 0) state.idx -= 1;
      show();
    } else if (action === 'step') {
      forward();
    } else if (action === 'play') {
      if (state.timer !== null) stopTimer();
      else {
        if (state.idx === state.steps.length - 1) {
          state.idx = 0;
          show();
        }
        playButton.textContent = 'Pause';
        state.timer = setInterval(forward, 550);
      }
    } else if (action === 'check') {
      const feedback = root.querySelector('.pb-feedback');
      if (guessInput.value.trim() === '') feedback.textContent = 'Type a number first.';
      else {
        const answer = state.steps.at(-1)?.comparisons ?? 0;
        feedback.textContent = Number(guessInput.value) === answer
          ? `Correct: naive search makes ${answer} comparisons.`
          : `Not quite. Naive search makes ${answer} comparisons.`;
      }
    }
  });

  load(PRESETS[0].text, PRESETS[0].pattern);
}