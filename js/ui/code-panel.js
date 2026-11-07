import { buildLpsSteps, kmpSearchSteps } from '../core/kmp.js';
import { Stepper } from '../core/stepper.js';

const codeLines = [
  'def build_lps(p):',
  '    lps = [0] * len(p)',
  '    length = 0',
  '    for i in range(1, len(p)):',
  '        while length > 0 and p[i] != p[length]:',
  '            length = lps[length - 1]',
  '        if p[i] == p[length]:',
  '            length += 1',
  '        lps[i] = length',
  '    return lps',
  '',
  'def kmp_search(text, p):',
  '    if not p:',
  '        return []',
  '    lps, j, matches = build_lps(p), 0, []',
  '    for i in range(len(text)):',
  '        while j > 0 and text[i] != p[j]:',
  '            j = lps[j - 1]',
  '        if text[i] == p[j]:',
  '            j += 1',
  '        if j == len(p):',
  '            matches.append(i - j + 1)',
  '            j = lps[j - 1]',
  '    return matches',
];

const commonMistakes = [
  {
    wrong: 'j = j - 1',
    right: 'j = lps[j - 1]',
    reason: 'Fallback to the longest border, not one character less.',
  },
  {
    wrong: 'matches.append(i - j + 1)  # then keep j unchanged',
    right: 'j = lps[j - 1]',
    reason: 'After a full match, retain the overlap so overlapping matches remain possible.',
  },
  {
    wrong: 'i -= 1',
    right: 'j = lps[j - 1]  # keep i unchanged',
    reason: 'A mismatch changes the pattern position; KMP never moves the text pointer backward.',
  },
  {
    wrong: 'j = lps[j]',
    right: 'j = lps[j - 1]',
    reason: 'The current matched prefix ends at j - 1, so that is the LPS entry to use.',
  },
  {
    wrong: 'lps[i] = i + 1',
    right: 'lps[i] = length',
    reason: 'A proper prefix must be shorter than the substring being measured.',
  },
];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

export function renderCodePanel(targetId = 'module-4-body') {
  const container = document.getElementById(targetId);
  if (!container || container.dataset.initialized === 'true') return;

  const steps = [
    ...buildLpsSteps('ABABC'),
    ...kmpSearchSteps('ABABABCABABX', 'ABABX'),
  ];
  const stepper = new Stepper(steps);
  let playing = false;
  let timer = null;

  container.innerHTML = `
    <div class="code-panel-layout">
      <div class="code-demo">
        <div class="code-step-controls" aria-label="Code walkthrough controls">
          <button type="button" class="ghost-btn" data-action="back" disabled>Back</button>
          <button type="button" class="primary-btn" data-action="step">Step</button>
          <button type="button" class="ghost-btn" data-action="play">Play</button>
          <button type="button" class="ghost-btn" data-action="reset">Reset</button>
          <span class="code-step-count" aria-live="polite"></span>
        </div>
        <pre class="python-source"><code>${codeLines
          .map((line, index) => `<span class="code-line" data-line="${index + 1}">${escapeHTML(line) || ' '}</span>`)
          .join('\n')}</code></pre>
        <p class="code-step-message" aria-live="polite"></p>
      </div>
      <aside class="mistakes-panel">
        <h3>Common mistakes</h3>
        <ol>
          ${commonMistakes.map((mistake) => `
            <li>
              <span class="mistake-wrong"><strong>Wrong</strong><code>${escapeHTML(mistake.wrong)}</code></span>
              <span class="mistake-right"><strong>Right</strong><code>${escapeHTML(mistake.right)}</code></span>
              <p>${escapeHTML(mistake.reason)}</p>
            </li>
          `).join('')}
        </ol>
      </aside>
    </div>
  `;

  const update = () => {
    const step = stepper.current();
    container.querySelectorAll('[data-line]').forEach((line) => {
      const active = Number(line.dataset.line) === step?.line;
      line.classList.toggle('active', active);
      if (active) line.setAttribute('aria-current', 'step');
      else line.removeAttribute('aria-current');
    });
    container.querySelector('.code-step-message').textContent = step?.message ?? 'Walkthrough complete.';
    container.querySelector('.code-step-count').textContent = `Step ${stepper.index + 1} of ${stepper.length()}`;
    container.querySelector('[data-action="back"]').disabled = stepper.index === 0;
    container.querySelector('[data-action="step"]').disabled = stepper.index >= stepper.length() - 1;
    container.querySelector('[data-action="play"]').disabled = stepper.index >= stepper.length() - 1 && !playing;
    container.querySelector('[data-action="play"]').textContent = playing ? 'Pause' : 'Play';
  };

  const stop = () => {
    clearInterval(timer);
    playing = false;
    update();
  };

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    if (button.dataset.action === 'back') {
      stop();
      stepper.prev();
      update();
    } else if (button.dataset.action === 'step') {
      stepper.next();
      update();
    } else if (button.dataset.action === 'reset') {
      stop();
      stepper.reset();
      update();
    } else if (button.dataset.action === 'play') {
      if (playing) {
        stop();
      } else {
        playing = true;
        update();
        timer = setInterval(() => {
          if (stepper.index >= stepper.length() - 1) {
            stop();
            return;
          }
          stepper.next();
          update();
        }, 900);
      }
    }
  });

  container.dataset.initialized = 'true';
  update();
}