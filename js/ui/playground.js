export function renderPlayground() {
  const output = document.getElementById('codeOutput');
  if (!output) return;

  const note = document.createElement('p');
  note.textContent = 'Pyodide is lazy-loaded for the live Python playground. This scaffold keeps the browser app working without a backend and prepares the interactive Python environment.';
  output.appendChild(note);
}
