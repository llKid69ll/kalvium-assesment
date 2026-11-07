export function buildLps(pattern) {
  const lps = Array(pattern.length).fill(0);
  let length = 0;

  for (let i = 1; i < pattern.length; i += 1) {
    while (length > 0 && pattern[i] !== pattern[length]) {
      length = lps[length - 1];
    }
    if (pattern[i] === pattern[length]) {
      length += 1;
    }
    lps[i] = length;
  }

  return lps;
}

export function* buildLpsSteps(pattern) {
  const lps = Array(pattern.length).fill(0);
  let length = 0;

  if (pattern.length === 0) {
    yield {
      phase: 'lps',
      i: 0,
      j: 0,
      length: 0,
      lps: [],
      line: 10,
      event: 'done',
      message: 'Empty pattern => empty LPS table.',
      result: [],
    };
    return;
  }

  for (let i = 1; i < pattern.length; i += 1) {
    while (length > 0 && pattern[i] !== pattern[length]) {
      const previous = length;
      length = lps[length - 1];
      yield {
        phase: 'lps',
        i,
        j: previous,
        length,
        lps: [...lps],
        line: 6,
        event: 'fallback',
        message: `Mismatch at pattern[${i}] = '${pattern[i]}' and pattern[${previous}] = '${pattern[previous]}'. j drops from ${previous} to ${length} because '${pattern.slice(0, previous)}' is both the end of the matched prefix and the start of the pattern.`,
      };
    }

    if (pattern[i] === pattern[length]) {
      length += 1;
      yield {
        phase: 'lps',
        i,
        j: length - 1,
        length,
        lps: [...lps],
        line: 7,
        event: 'compare',
        message: `Compare pattern[${i}] = '${pattern[i]}' with pattern[${length - 1}] = '${pattern[length - 1]}'. They match, so the prefix grows to ${length}.`,
      };
    } else {
      yield {
        phase: 'lps',
        i,
        j: length,
        length,
        lps: [...lps],
        line: 7,
        event: 'mismatch',
        message: `pattern[${i}] = '${pattern[i]}' does not match pattern[${length}] = '${pattern[length]}', so this prefix cannot extend.`,
      };
    }

    lps[i] = length;
    yield {
      phase: 'lps',
      i,
      j: length,
      length,
      lps: [...lps],
      line: 9,
      event: 'match',
      message: `lps[${i}] = ${length}. The longest proper prefix that is also a suffix of pattern[0..${i}] is ${length}.`,
    };
  }

  yield {
    phase: 'lps',
    i: pattern.length - 1,
    j: length,
    length,
    lps: [...lps],
    line: 10,
    event: 'done',
    message: `LPS table is complete: ${lps.join(', ')}.`,
    result: [...lps],
  };
}

export function* kmpSearchSteps(text, pattern) {
  if (pattern.length === 0) {
    yield {
      phase: 'match',
      i: 0,
      j: 0,
      length: 0,
      lps: [],
      line: 14,
      event: 'done',
      message: 'Empty pattern => no search work and no matches.',
      result: { matches: [], comparisons: 0 },
    };
    return;
  }

  const lps = buildLps(pattern);
  let i = 0;
  let j = 0;
  const matches = [];
  let comparisons = 0;

  while (i < text.length) {
    if (text[i] === pattern[j]) {
      comparisons += 1;
      yield {
        phase: 'match',
        i,
        j,
        length: j + 1,
        lps: [...lps],
        line: 19,
        event: 'compare',
        message: `Compare text[${i}] = '${text[i]}' with pattern[${j}] = '${pattern[j]}'. They match, so j advances to ${j + 1}.`,
      };

      j += 1;

      if (j === pattern.length) {
        const start = i - j + 1;
        matches.push(start);
        const fallback = lps[j - 1];
        yield {
          phase: 'match-complete',
          i,
          j,
          length: j,
          lps: [...lps],
          line: 22,
          event: 'found',
          message: `Full match found at index ${start}. j falls from ${j} to ${fallback} to allow overlaps.`,
          result: { matches: [...matches], comparisons },
        };
        j = fallback;
      }

      i += 1;
      continue;
    }

    comparisons += 1;

    if (j > 0) {
      const fallback = lps[j - 1];
      yield {
        phase: 'match',
        i,
        j,
        length: j,
        lps: [...lps],
        line: 18,
        event: 'fallback',
        message: `Mismatch at text[${i}] = '${text[i]}' and pattern[${j}] = '${pattern[j]}'. j drops from ${j} to ${fallback} because the matched suffix is also a prefix.`,
      };
      j = fallback;
    } else {
      yield {
        phase: 'match',
        i,
        j,
        length: j,
        lps: [...lps],
        line: 19,
        event: 'advance',
        message: `Mismatch at text[${i}] = '${text[i]}' and pattern[0] = '${pattern[0]}'. j is 0, so i advances to ${i + 1}.`,
      };
      i += 1;
    }
  }

  yield {
    phase: 'match',
    i,
    j,
    length: j,
    lps: [...lps],
    line: 24,
    event: 'done',
    message: `Search complete. Matches: ${matches.length ? matches.join(', ') : 'none'}.`,
    result: { matches: [...matches], comparisons },
  };
}

export function kmpSearch(text, pattern) {
  const steps = [...kmpSearchSteps(text, pattern)];
  const result = steps.at(-1)?.result ?? { matches: [], comparisons: 0 };

  return {
    matches: result.matches ?? [],
    comparisons: result.comparisons ?? 0,
    steps,
  };
}
