function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createCaption(text) {
  return createElement('div', 'pb-caption', text);
}

function createTextCell(text, index, step) {
  const classes = ['pb-cell'];
  if (index < step.shift) classes.push('pb-grey');
  if (step.matched > 0 && index >= step.shift && index < step.shift + step.matched) {
    classes.push('pb-good');
  }
  if (index === step.t && step.equal) classes.push('pb-ok');
  if (index === step.t && !step.equal) classes.push('pb-bad');
  return createElement('div', classes.join(' '), text);
}

function createPatternCell(character, index, step) {
  const classes = ['pb-cell'];
  if (index < step.matched) classes.push('pb-good');
  if (index === step.p && step.equal) classes.push('pb-ok');
  if (index === step.p && !step.equal) classes.push('pb-bad');
  return createElement('div', classes.join(' '), character);
}

export function renderBoard(host, text, pattern, step) {
  host.replaceChildren();

  const board = createElement('div', 'pb-board');
  const textSection = createElement('section', 'pb-section');
  textSection.append(createCaption('Text (with index)'));

  const indexRow = createElement('div', 'pb-row pb-index-row');
  const textRow = createElement('div', 'pb-row pb-text-row');
  [...text].forEach((character, index) => {
    indexRow.append(createElement('div', 'pb-cell', String(index)));
    textRow.append(createTextCell(character, index, step));
  });
  textSection.append(indexRow, textRow);

  const patternSection = createElement('section', 'pb-section');
  patternSection.append(createCaption('Pattern (slides along the text)'));
  const patternRow = createElement('div', 'pb-row pb-slide');
  patternRow.style.setProperty('--shift', String(step.shift));
  [...pattern].forEach((character, index) => {
    patternRow.append(createPatternCell(character, index, step));
  });
  patternSection.append(patternRow);

  const seenSection = createElement('section', 'pb-section');
  seenSection.append(createCaption('Times each text character has been compared'));
  const seenRow = createElement('div', 'pb-row pb-seen-row');
  [...text].forEach((character, index) => {
    const count = step.seen[index] ?? 0;
    const classes = ['pb-cell'];
    if (count >= 2) classes.push('pb-amber');
    seenRow.append(createElement('div', classes.join(' '), count > 0 ? `×${count}` : ''));
  });
  seenSection.append(seenRow);

  board.append(textSection, patternSection, seenSection);
  host.append(board);
}
