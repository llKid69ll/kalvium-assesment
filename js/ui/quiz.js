import { codingChallenge, quizData } from '../content/quiz-data.js';

const PYODIDE_VERSION = '0.27.7';
let pyodidePromise;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function loadPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      const start = () => {
        if (typeof window.loadPyodide !== 'function') {
          reject(new Error('Python runtime failed to initialize.'));
          return;
        }
        window.loadPyodide({
          indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
        }).then(resolve, reject);
      };

      if (typeof window.loadPyodide === 'function') {
        start();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
      script.onload = start;
      script.onerror = () => reject(new Error('Could not load the Python runtime. Check your internet connection and try again.'));
      document.head.appendChild(script);
    });
  }
  return pyodidePromise;
}

function getChallengeRunner(source) {
  const cases = JSON.stringify(codingChallenge.hiddenTests.map(({ input, expected }) => [input, expected]));
  return `${source}

import json
_kmp_hidden_cases = ${cases}
_kmp_hidden_results = []
for _kmp_value, _kmp_expected in _kmp_hidden_cases:
    try:
        _kmp_actual = shortest_repeating_unit(_kmp_value)
        _kmp_hidden_results.append(_kmp_actual == _kmp_expected)
    except Exception:
        _kmp_hidden_results.append(False)
json.dumps(_kmp_hidden_results)
`;
}

export function renderQuiz(targetId = 'module-6-body') {
  const container = document.getElementById(targetId);
  if (!container || container.dataset.initialized === 'true') return;

  const selections = Array(quizData.length).fill(null);
  let revealedHints = 0;

  container.innerHTML = `
    <div class="quiz-layout">
      <section class="quiz-questions" aria-label="Knowledge check">
        <div class="quiz-score" aria-live="polite">0 / ${quizData.length} correct</div>
        ${quizData.map((item, questionIndex) => `
          <fieldset class="quiz-item" data-question="${questionIndex}">
            <legend><span class="quiz-number">${questionIndex + 1}</span>${escapeHTML(item.question)}</legend>
            ${item.snippet ? `<pre class="quiz-snippet"><code>${escapeHTML(item.snippet)}</code></pre>` : ''}
            <div class="quiz-options">
              ${item.options.map((option, optionIndex) => `
                <label class="quiz-option" for="quiz-${questionIndex}-${optionIndex}">
                  <input id="quiz-${questionIndex}-${optionIndex}" type="radio" name="quiz-${questionIndex}" value="${optionIndex}" />
                  <span>${escapeHTML(option.text)}</span>
                </label>
              `).join('')}
            </div>
            <p class="quiz-feedback" aria-live="polite">Choose an answer to see the explanation.</p>
          </fieldset>
        `).join('')}
      </section>

      <section class="coding-challenge" aria-labelledby="challenge-title">
        <header class="challenge-header">
          <p class="module-kicker">Coding challenge</p>
          <h3 id="challenge-title">${escapeHTML(codingChallenge.title)}</h3>
          <p>${escapeHTML(codingChallenge.prompt)}</p>
        </header>
        <label class="challenge-editor-label" for="challenge-code">Python starter</label>
        <textarea id="challenge-code" class="challenge-editor" spellcheck="false" autocapitalize="off">${escapeHTML(codingChallenge.starterCode)}</textarea>
        <div class="challenge-controls">
          <button type="button" class="primary-btn" data-action="run-challenge">Run hidden tests</button>
          <button type="button" class="ghost-btn" data-action="show-hint">Show hint 1</button>
        </div>
        <p class="challenge-status" aria-live="polite">Four test cases are hidden. The Python runtime loads when you run the tests.</p>
        <ol class="hint-ladder" aria-label="Hints">
          ${codingChallenge.hints.map((hint, index) => `<li data-hint="${index}" hidden>${escapeHTML(hint)}</li>`).join('')}
        </ol>
      </section>
    </div>
  `;

  const updateScore = () => {
    const correctCount = selections.reduce((count, optionIndex, questionIndex) => {
      if (optionIndex === null) return count;
      return count + Number(quizData[questionIndex].options[optionIndex].correct);
    }, 0);
    container.querySelector('.quiz-score').textContent = `${correctCount} / ${quizData.length} correct`;
  };

  container.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="radio"][name^="quiz-"]')) return;
    const questionIndex = Number(event.target.name.slice('quiz-'.length));
    const optionIndex = Number(event.target.value);
    const option = quizData[questionIndex].options[optionIndex];
    const item = event.target.closest('.quiz-item');
    const feedback = item.querySelector('.quiz-feedback');
    selections[questionIndex] = optionIndex;
    feedback.textContent = `${option.correct ? 'Correct. ' : 'Not quite. '}${option.explanation}`;
    feedback.classList.toggle('is-correct', option.correct);
    feedback.classList.toggle('is-incorrect', !option.correct);
    updateScore();
  });

  container.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    if (button.dataset.action === 'show-hint') {
      if (revealedHints < codingChallenge.hints.length) {
        container.querySelector(`[data-hint="${revealedHints}"]`).hidden = false;
        revealedHints += 1;
      }
      button.textContent = revealedHints < codingChallenge.hints.length
        ? `Show hint ${revealedHints + 1}`
        : 'All hints revealed';
      button.disabled = revealedHints >= codingChallenge.hints.length;
      return;
    }

    if (button.dataset.action === 'run-challenge') {
      const status = container.querySelector('.challenge-status');
      const source = container.querySelector('#challenge-code').value;
      button.disabled = true;
      status.textContent = 'Loading Python and running the hidden tests…';
      try {
        const pyodide = await loadPyodide();
        const result = await pyodide.runPythonAsync(getChallengeRunner(source));
        const outcomes = JSON.parse(result);
        const passed = outcomes.filter(Boolean).length;
        status.textContent = passed === outcomes.length
          ? `All ${outcomes.length} hidden tests passed.`
          : `${passed} of ${outcomes.length} hidden tests passed. Recheck the LPS fallback and divisibility condition.`;
        status.classList.toggle('is-success', passed === outcomes.length);
        status.classList.toggle('is-error', passed !== outcomes.length);
      } catch (error) {
        status.textContent = error instanceof SyntaxError
          ? 'The starter code is incomplete or has a Python syntax error. Check the TODO lines.'
          : error.message || 'The challenge could not run. Check the code and try again.';
        status.classList.add('is-error');
      } finally {
        button.disabled = false;
      }
    }
  });

  container.dataset.initialized = 'true';
}