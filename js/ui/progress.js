import { lessonData } from '../content/lesson.js';

export function setupProgress() {
  const nav = document.querySelector('.progress-track');
  if (!nav) return;

  nav.querySelectorAll('.progress-step').forEach((button) => {
    button.addEventListener('click', () => {
      const stepIndex = Number(button.dataset.step);
      document.querySelectorAll('.module-panel').forEach((panel, index) => {
        const isActive = index === stepIndex;
        panel.hidden = !isActive;
        panel.classList.toggle('is-visible', isActive);
      });
      nav.querySelectorAll('.progress-step').forEach((tab) => {
        const isSelected = Number(tab.dataset.step) === stepIndex;
        tab.classList.toggle('is-active', isSelected);
        tab.setAttribute('aria-current', isSelected ? 'true' : 'false');
      });
    });
  });
}
