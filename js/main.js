import { lessonData } from './content/lesson.js';
import { renderLpsVisualizer } from './ui/lps-visualizer.js';
import { renderMatchVisualizer } from './ui/match-visualizer.js';
import { renderCodePanel } from './ui/code-panel.js';
import { renderComplexity } from './ui/complexity-lab.js';
import { renderQuiz } from './ui/quiz.js';
import { setupProgress } from './ui/progress.js';
import { mountProblem } from './ui/problem-visualizer.js';
import { naiveSearch } from './core/naive.js';
import { buildLps } from './core/kmp.js';

function initializeLesson() {
  setupProgress();
  mountProblem(document.getElementById('module-1-body'));
  renderCodePanel();
  renderQuiz();
  renderLpsVisualizer('module-2-body');
  renderMatchVisualizer();
  renderComplexity();

  const naiveText = document.getElementById('naiveText');
  const naivePattern = document.getElementById('naivePattern');
  const naiveBtn = document.getElementById('naiveBtn');

  if (naiveBtn && naiveText && naivePattern) {
    naiveBtn.addEventListener('click', () => {
      const result = naiveSearch(naiveText.value, naivePattern.value);
      const target = document.getElementById('naiveOutput');
      if (target) {
        target.innerHTML = `
          <div class="metric"><span>Comparisons</span><strong>${result.comparisons}</strong></div>
          <div class="metric"><span>Matches</span><strong>${result.matches.length}</strong></div>
          <div class="metric"><span>Match indexes</span><strong>${result.matches.join(', ') || 'none'}</strong></div>
          <p>Naive search slides the pattern one position at a time and rechecks earlier characters.</p>
        `;
      }
    });
  }

  const lpsBtn = document.getElementById('lpsBtn');
  const lpsPattern = document.getElementById('lpsPattern');
  if (lpsBtn && lpsPattern) {
    lpsBtn.addEventListener('click', () => {
      renderLpsVisualizer('module-2-body');
    });
  }

  const matchBtn = document.getElementById('matchBtn');
  const matchText = document.getElementById('matchText');
  const matchPattern = document.getElementById('matchPattern');
  if (matchBtn && matchText && matchPattern) {
    matchBtn.addEventListener('click', () => {
      renderMatchVisualizer(matchText.value, matchPattern.value, 'module-3-body');
    });
  }

  const complexityBtn = document.getElementById('complexityBtn');
  const complexityText = document.getElementById('complexityText');
  const complexityPattern = document.getElementById('complexityPattern');
  if (complexityBtn && complexityText && complexityPattern) {
    complexityBtn.addEventListener('click', () => {
      renderComplexity(complexityText.value, complexityPattern.value);
    });
  }

  const playBtn = document.getElementById('playBtn');
  const stepBtn = document.getElementById('stepBtn');
  const resetBtn = document.getElementById('resetBtn');

  let activeLine = 3;
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      activeLine = (activeLine + 1) % 19;
      renderCodePanel(activeLine);
    });
  }

  if (stepBtn) {
    stepBtn.addEventListener('click', () => {
      activeLine = Math.min(activeLine + 1, 18);
      renderCodePanel(activeLine);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeLine = 3;
      renderCodePanel(activeLine);
    });
  }

  console.log('KMP Explorer initialized. Demo ready.');
}

document.addEventListener('DOMContentLoaded', initializeLesson);
