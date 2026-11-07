export function* naiveSteps(text, pattern) {
  const n = text.length;
  const m = pattern.length;
  const seen = Array(n).fill(0);
  const matches = [];
  let comparisons = 0;
  let lastShift = 0;

  if (m === 0 || m > n) {
    yield {
      event: 'done',
      shift: 0,
      t: -1,
      p: -1,
      matched: 0,
      equal: null,
      comparisons: 0,
      seen: [...seen],
      matches: [...matches],
      message: m === 0
        ? 'Done: the pattern is empty, so there are no comparisons or matches.'
        : `Done: pattern length ${m} is greater than text length ${n}, so there are no comparisons or matches.`,
    };
    return;
  }

  for (let shift = 0; shift <= n - m; shift += 1) {
    lastShift = shift;
    yield {
      event: 'shift',
      shift,
      t: -1,
      p: -1,
      matched: 0,
      equal: null,
      comparisons,
      seen: [...seen],
      matches: [...matches],
      message: `Try alignment ${shift}: compare the pattern from its first character.`,
    };

    let matched = 0;
    let mismatchFound = false;

    for (let patternIndex = 0; patternIndex < m; patternIndex += 1) {
      const textIndex = shift + patternIndex;
      const equal = text[textIndex] === pattern[patternIndex];
      comparisons += 1;
      seen[textIndex] += 1;

      if (equal) {
        yield {
          event: 'match',
          shift,
          t: textIndex,
          p: patternIndex,
          matched,
          equal: true,
          comparisons,
          seen: [...seen],
          matches: [...matches],
          message: `Match: text[${textIndex}] = '${text[textIndex]}' equals pattern[${patternIndex}] = '${pattern[patternIndex]}'.`,
        };
        matched += 1;
        continue;
      }

      yield {
        event: 'mismatch',
        shift,
        t: textIndex,
        p: patternIndex,
        matched,
        equal: false,
        comparisons,
        seen: [...seen],
        matches: [...matches],
        message: `Mismatch: text[${textIndex}] = '${text[textIndex]}' but pattern[${patternIndex}] = '${pattern[patternIndex]}'. We had already matched ${matched} character${matched === 1 ? '' : 's'}, but naive search forgets that, slides right by 1 and starts over, so those characters get compared again.`,
      };
      mismatchFound = true;
      break;
    }

    if (!mismatchFound && matched === m) {
      matches.push(shift);
      yield {
        event: 'found',
        shift,
        t: -1,
        p: -1,
        matched,
        equal: null,
        comparisons,
        seen: [...seen],
        matches: [...matches],
        message: `Found the complete pattern at text index ${shift} after ${comparisons} total comparisons.`,
      };
    }
  }

  yield {
    event: 'done',
    shift: lastShift,
    t: -1,
    p: -1,
    matched: 0,
    equal: null,
    comparisons,
    seen: [...seen],
    matches: [...matches],
    message: `Done: ${matches.length ? `matches at ${matches.join(', ')}` : 'no matches'} after ${comparisons} comparisons.`,
  };
}
