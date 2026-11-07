export const COPY = {
  goal: 'See how naive search repeats comparisons after a partial match.',
  explain: 'Naive search checks the pattern at each possible text position from its first character. If a mismatch appears after several matches, it shifts right by one and starts over, even though it just learned those characters. That is like retyping a whole phone number when the last digit is wrong. On repeated-prefix inputs, this can lead to many unnecessary character comparisons.',
  takeaway: 'naive search throws away what a partial match taught it; KMP keeps that knowledge',
};

export const PRESETS = [
  { label: 'Worst case', text: 'AAAAAAAAB', pattern: 'AAAAB' },
  { label: 'No re-reads', text: 'ABCDEFGH', pattern: 'XYZ' },
  { label: 'Overlapping', text: 'AAAAAA', pattern: 'AAA' },
];
