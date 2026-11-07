export function* naiveSearchSteps(text, pattern) {
  let comparisons = 0;
  const matches = [];

  for (let i = 0; i <= text.length - pattern.length; i += 1) {
    let j = 0;
    while (j < pattern.length && text[i + j] === pattern[j]) {
      comparisons += 1;
      j += 1;
      yield {
        phase: 'compare',
        i,
        j,
        comparisons,
        message: `Comparing text[${i + j - 1}] with pattern[${j - 1}]`,
      };
    }

    if (j === pattern.length) {
      matches.push(i);
      yield {
        phase: 'match',
        i,
        j,
        comparisons,
        message: `Pattern matched at index ${i}.`,
      };
    }

    if (pattern.length > 0) {
      comparisons += 1;
      yield {
        phase: 'mismatch',
        i,
        j,
        comparisons,
        message: `Shift by 1. Total comparisons: ${comparisons}.`,
      };
    }
  }

  return { comparisons, matches };
}

export function naiveSearch(text, pattern) {
  const steps = [...naiveSearchSteps(text, pattern)];
  return {
    comparisons: steps.at(-1)?.comparisons ?? 0,
    matches: steps.filter((step) => step.phase === 'match').map((step) => step.i),
    steps,
  };
}
