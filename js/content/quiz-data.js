export const quizData = [
  {
    question: 'What does lps[i] represent for the prefix pattern[0..i]?',
    options: [
      {
        text: 'The length of its longest proper prefix that is also a suffix',
        correct: true,
        explanation: 'Exactly. LPS stores an overlap length for each pattern prefix.',
      },
      {
        text: 'The index of the last matching character in the text',
        correct: false,
        explanation: 'LPS depends only on the pattern prefix; it is computed before searching the text.',
      },
      {
        text: 'The number of times this prefix occurs in the text',
        correct: false,
        explanation: 'LPS describes a prefix-suffix overlap inside the pattern, not its frequency in the text.',
      },
      {
        text: 'The length of the longest prefix, including the whole substring',
        correct: false,
        explanation: 'The prefix must be proper, so it must be shorter than the substring being measured.',
      },
    ],
  },
  {
    question: 'Why must the prefix in LPS be proper?',
    options: [
      {
        text: 'So the entire substring cannot count as its own prefix and suffix',
        correct: true,
        explanation: 'Right. The overlap must be shorter than the current substring, or the fallback would make no progress.',
      },
      {
        text: 'So prefixes are not allowed to start at index 0',
        correct: false,
        explanation: 'A prefix does start at index 0. “Proper” only excludes the entire substring.',
      },
      {
        text: 'So the suffix must contain exactly one character',
        correct: false,
        explanation: 'The suffix can have any length from 0 up to one less than the substring length.',
      },
      {
        text: 'So the pattern cannot contain repeated characters',
        correct: false,
        explanation: 'Repeated characters are common; proper just means shorter than the whole substring.',
      },
    ],
  },
  {
    question: 'During matching, text[i] mismatches pattern[j] while j > 0. What happens?',
    options: [
      {
        text: 'Keep i where it is and set j = lps[j - 1]',
        correct: true,
        explanation: 'Correct. KMP reuses the known overlap and compares the same text character again at the shorter pattern prefix.',
      },
      {
        text: 'Move i backward and keep j unchanged',
        correct: false,
        explanation: 'KMP never moves i backward. The LPS table changes j while i stays at the mismatching text character.',
      },
      {
        text: 'Set j = j - 1',
        correct: false,
        explanation: 'Dropping one character can miss a longer valid overlap. Use j = lps[j - 1].',
      },
      {
        text: 'Set both i and j to 0',
        correct: false,
        explanation: 'Restarting loses the work captured by LPS and repeats comparisons.',
      },
    ],
  },
  {
    question: 'What should KMP do immediately after finding a full match?',
    options: [
      {
        text: 'Record the match, then set j = lps[j - 1]',
        correct: true,
        explanation: 'Yes. This preserves a possible overlapping match without moving the text pointer backward.',
      },
      {
        text: 'Set j to 0 so the next search starts from scratch',
        correct: false,
        explanation: 'Resetting to 0 can lose overlapping matches. Fall back to the longest border with j = lps[j - 1].',
      },
      {
        text: 'Move i backward by the pattern length',
        correct: false,
        explanation: 'i never decreases. The overlap is retained by updating j from the LPS table.',
      },
      {
        text: 'Stop searching because a pattern can occur only once',
        correct: false,
        explanation: 'A pattern may occur multiple times, including overlapping occurrences.',
      },
    ],
  },
  {
    question: 'Which argument explains why KMP matching takes O(n) time?',
    options: [
      {
        text: 'i never decreases; j rises at most n times; each fallback lowers j',
        correct: true,
        explanation: 'Correct. Since j cannot fall below zero, total fallback decreases are bounded by its total increases, at most n.',
      },
      {
        text: 'Every text character is compared exactly once',
        correct: false,
        explanation: 'A character can be compared again after a fallback. The amortized pointer argument bounds those repeats.',
      },
      {
        text: 'The LPS table makes every search step constant time, so total time is O(m)',
        correct: false,
        explanation: 'Matching depends on text length n, and preprocessing depends on pattern length m; together they are O(n + m).',
      },
      {
        text: 'KMP checks all possible alignments but does fewer work per alignment',
        correct: false,
        explanation: 'KMP does not restart at every alignment. Its forward-moving i and bounded j changes give linear matching.',
      },
    ],
  },
  {
    question: 'Spot the bug: what is wrong with this mismatch fallback?',
    snippet: 'while j > 0 and text[i] != pattern[j]:\n    j = lps[j]',
    options: [
      {
        text: 'It should use j = lps[j - 1]',
        correct: true,
        explanation: 'Correct. j is the length matched, so the current prefix ends at j - 1.',
      },
      {
        text: 'It should use j = j - 1',
        correct: false,
        explanation: 'A one-step decrement ignores longer borders. The LPS entry gives the longest safe fallback.',
      },
      {
        text: 'It should use i = lps[j]',
        correct: false,
        explanation: 'The text index i must not change during a fallback; only j is updated from LPS.',
      },
      {
        text: 'There is no bug; lps[j] is the correct entry',
        correct: false,
        explanation: 'The matched prefix ends at j - 1, so lps[j - 1] is the valid fallback entry.',
      },
    ],
  },
];

export const codingChallenge = {
  title: 'Find the shortest repeating unit',
  prompt: 'Return the shortest substring that can be repeated to form the whole string. If no shorter unit works, return the original string.',
  starterCode: `def shortest_repeating_unit(s):
    if not s:
        return ""

    n = len(s)
    lps = [0] * n
    length = 0

    for i in range(1, n):
        while length > 0 and s[i] != s[length]:
        length = lps[length - 1]
        if s[i] == s[length]:
            length += 1
        lps[i] = length

    candidate_len = n - lps[n - 1]
    # TODO: return the candidate slice only when it divides n exactly
    return s
`,
  hiddenTests: [
    { input: 'ababab', expected: 'ab' },
    { input: 'abcabcabc', expected: 'abc' },
    { input: 'aaaa', expected: 'a' },
    { input: 'abcd', expected: 'abcd' },
  ],
  hints: [
    'The last LPS value tells you how many characters at the end of the string match a prefix at the beginning.',
    'Try candidate_len = len(s) - lps[-1]. It is a repeating-unit length only if len(s) is divisible by candidate_len.',
    'Build the LPS table with the same fallback rule as KMP: length = lps[length - 1]. Return s[:candidate_len] when it divides evenly; otherwise return s.',
  ],
};
