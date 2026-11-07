# Instructor Guide

## Facilitation

Follow the 45-minute sequence in [lesson-plan.md](lesson-plan.md). Keep learners predicting before each reveal; the goal is to make the reused overlap visible, not to race through the animation. Let learners change inputs after each worked example. Ask them to explain what remains known after a mismatch before naming the LPS rule.

## Five Pause-and-Ask Questions

1. **After the naive example:** “When the final `B` fails in `AAAAB`, which earlier comparisons are repeated on the next shift?”  
	Listen for: the leading run of `A`s is checked again from the next text position.

2. **While building LPS for `ABAB`:** “Which string is both a proper prefix and a suffix, and why can the whole `ABAB` not count?”  
	Listen for: `AB` is the overlap; “proper” excludes the entire substring.

3. **At a KMP mismatch with `j > 0`:** “Which pointer moves now, and what does `lps[j - 1]` preserve?”  
	Listen for: `i` stays fixed; `j` falls to the longest prefix already known to match the suffix.

4. **Immediately after a full match:** “Why not reset `j` to zero before continuing?”  
	Listen for: falling back to `lps[j - 1]` keeps a possible overlapping occurrence.

5. **During the complexity proof:** “If `j` can rise at most n times and every fallback lowers it, how can the total number of fallbacks exceed n?”  
	Listen for: it cannot; `j` is nonnegative, so total downward movement is bounded by total upward movement.

## Common Teaching Moves

- For LPS, trace the candidate overlap with two colored spans; do not call it a “shift” until learners can name the matching prefix and suffix.
- For matching, emphasize that a fallback retries the same text character against a shorter prefix. A fallback is not a text-pointer move.
- After a full match, use `AAAAAA` / `AAA` to make overlap handling concrete.
- Ask learners to distinguish a measured comparison count from an asymptotic proof.
- Treat the coding challenge as transfer: the final LPS value gives the candidate unit length `n - lps[n - 1]`; divisibility decides whether it repeats exactly.

## Misconceptions to Watch

- “Proper prefix” means a prefix that starts after index zero. Correct this: it means shorter than the whole string.
- “KMP never compares a text character twice.” It can; it never moves the text pointer backward, and the amortized argument bounds repeats.
- “The whole-match fallback is optional.” It is necessary to find overlapping matches.
- “The candidate length is always the period.” It must divide the string length; otherwise the whole string is the shortest repeating unit under this definition.

## Challenge Support

Reveal hints one at a time. First direct attention to the final LPS entry, then to `candidate_len = n - lps[-1]`, and only then to the divisibility test and returned slice. The four test cases cover repeated blocks, a single-character unit, and a string with no shorter repeating unit. Avoid showing the inputs or expected outputs before learners submit their attempt.
