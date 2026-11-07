# KMP Explorer Lesson Plan

**Duration:** 45 minutes  
**Audience:** Learners comfortable with strings, arrays, loops, and function calls.  
**Materials:** KMP Explorer, a way to write down short strings, and the Module 6 Python challenge.

## Learning Outcomes

By the end, learners can define and compute LPS values, trace KMP through a mismatch and a full match, explain the O(n + m) time bound, identify common implementation errors, and apply LPS to find a shortest repeating unit.

## Minute-by-Minute Plan

| Minute | Instructor and learner activity |
|---:|---|
| 0 | State the goal: search for a pattern without restarting text comparisons. |
| 1 | Introduce text `AAAAAAAAB` and pattern `AAAAB`. Ask learners to predict where the match occurs. |
| 2 | Run the naive comparison and point out the repeated `A` checks. |
| 3 | Have learners estimate how the work changes when more `A`s are added. |
| 4 | Frame the question: which already-known characters can be reused after a mismatch? |
| 5 | Define prefix and suffix with a short string on the board. |
| 6 | Explain “proper”: the whole substring cannot count as its own prefix. |
| 7 | Work through `ABABC` at index 0 and index 1. |
| 8 | Predict the LPS value at index 2 before revealing it. |
| 9 | Compare the blue prefix and purple suffix for `ABA`. |
| 10 | Predict the LPS value at index 3 of `ABAB`. |
| 11 | Ask why `AB` is both a prefix and suffix of `ABAB`. |
| 12 | Step to index 4 of `ABABC` and observe the mismatch and fallback. |
| 13 | Learners enter a new pattern or select a preset and predict one value. |
| 14 | Review the completed table and restate what each entry stores. |
| 15 | Introduce matching pointers: `i` for text and `j` for the matched pattern prefix. |
| 16 | Step through a character match and identify which pointers advance. |
| 17 | Continue until the first mismatch in `ABABABCABABX` / `ABABX`. |
| 18 | Predict the fallback value and the resulting pattern alignment. |
| 19 | Animate the rightward shift; emphasize that `i` stays at the same text character. |
| 20 | Continue stepping and identify the eventual match at index 7. |
| 21 | Compare the pattern offset `i - j` before and after a fallback. |
| 22 | Turn on “What happens next?” and explain a prediction before revealing the next state. |
| 23 | Try `AAAAAA` / `AAA` and observe overlapping matches. |
| 24 | Summarize the three cases: match, mismatch with `j > 0`, and mismatch with `j = 0`. |
| 25 | Open the Python code panel and connect the current event to its highlighted source line. |
| 26 | Step the code panel through LPS construction. |
| 27 | Step through the matching fallback and identify the unchanged `i`. |
| 28 | Find the post-match fallback that preserves overlaps. |
| 29 | Review the five common mistakes and ask learners to correct one aloud. |
| 30 | Have learners explain why `lps[j - 1]`, not `lps[j]`, is used. |
| 31 | Recap the Python function structure: preprocess, scan, record, fall back. |
| 32 | Enter a learner-chosen text and pattern in the Complexity Lab. |
| 33 | Compare naive and KMP comparison bars for the same input. |
| 34 | Move the n slider and compare the adversarial curves. |
| 35 | State that a comparison count illustrates behavior but does not prove a bound. |
| 36 | Walk the four amortized proof statements in order. |
| 37 | Begin the six-question knowledge check individually. |
| 38 | Review the LPS definition and “proper” questions. |
| 39 | Review mismatch pointer behavior. |
| 40 | Review the full-match question, including overlaps. |
| 41 | Review the complexity and spot-the-bug questions. |
| 42 | Introduce shortest repeating unit; relate the last LPS value to the final overlap. |
| 43 | Learners inspect the starter and request hints only as needed. |
| 44 | Run the hidden tests, name one remaining question, and close with `n - lps[n - 1]`. |

## Evidence of Learning

- Learner predicts LPS values before reveal and explains at least one fallback.
- Learner states that `i` never decreases and identifies `j = lps[j - 1]` as the fallback.
- Learner justifies O(n + m) using the bounded increases and decreases of `j`.
- Learner attempts the repeating-unit challenge and interprets the test result.
