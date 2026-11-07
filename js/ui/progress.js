export function setupProgress() {
  const nav = document.querySelector('.progress-track');
  if (!nav) return;

  const tabs = [...nav.querySelectorAll('.progress-step')];
  const panels = [...document.querySelectorAll('.module-panel')];
  const previousButton = document.getElementById('previousModuleBtn');
  const nextButton = document.getElementById('nextModuleBtn');
  if (tabs.length === 0 || panels.length === 0) return;

  let activeIndex = tabs.findIndex((tab) => tab.getAttribute('aria-current') === 'true');
  if (activeIndex < 0) activeIndex = 0;

  const selectStep = (requestedIndex) => {
    activeIndex = Math.max(0, Math.min(requestedIndex, tabs.length - 1));
    tabs.forEach((tab, index) => {
      const selected = index === activeIndex;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-current', selected ? 'step' : 'false');
    });
    panels.forEach((panel, index) => {
      const selected = index === activeIndex;
      panel.hidden = !selected;
      panel.classList.toggle('is-visible', selected);
    });
    if (previousButton) previousButton.disabled = activeIndex === 0;
    if (nextButton) nextButton.disabled = activeIndex === tabs.length - 1;
  };

  tabs.forEach((tab, index) => tab.addEventListener('click', () => selectStep(index)));
  previousButton?.addEventListener('click', () => selectStep(activeIndex - 1));
  nextButton?.addEventListener('click', () => selectStep(activeIndex + 1));
  selectStep(activeIndex);
}
