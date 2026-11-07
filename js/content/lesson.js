export const lessonData = [
  {
    id: 'module-1',
    title: 'The Problem',
    summary: 'Naive search re-compares characters and wastes work.',
  },
  {
    id: 'module-2',
    title: 'The LPS Table',
    summary: 'Prefix-suffix overlaps guide rolling back safely.',
  },
  {
    id: 'module-3',
    title: 'Matching Phase',
    summary: 'Pointer i never moves backward while j falls back using LPS.',
  },
  {
    id: 'module-4',
    title: 'The Code',
    summary: 'The Python implementation is displayed and explained live.',
  },
  {
    id: 'module-5',
    title: 'Complexity',
    summary: 'Compare naive and KMP counts for the same input.',
  },
  {
    id: 'module-6',
    title: 'Check Yourself',
    summary: 'Quiz and challenge reinforce the key ideas.',
  },
];

export const moduleTwoContent = {
  title: 'The LPS table',
  intro:
    'LPS tells us the longest proper prefix that is also a suffix. That overlap tells KMP how far to fall back without rechecking earlier characters.',
  presets: [
    {
      pattern: 'ABABC',
      notice: 'The prefix "AB" reappears at the end, so the table grows and then resets in a useful way.',
    },
    {
      pattern: 'AAAA',
      notice: 'Every new character extends the current run, so the overlap keeps growing in a very regular pattern.',
    },
    {
      pattern: 'ABCABC',
      notice: 'The pattern starts over cleanly after the first full block, which is a classic prefix-suffix reuse.',
    },
    {
      pattern: 'AABAAB',
      notice: 'The overlap is not obvious at first glance, but the repeated prefix-suffix structure is exactly what the LPS table tracks.',
    },
  ],
};
