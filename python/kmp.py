def build_lps(pattern):
    lps = [0] * len(pattern)
    length = 0

    for i in range(1, len(pattern)):
        while length > 0 and pattern[i] != pattern[length]:
            length = lps[length - 1]
        if pattern[i] == pattern[length]:
            length += 1
        lps[i] = length

    return lps


def kmp_search(text, pattern):
    if not pattern:
        return []

    lps = build_lps(pattern)
    j = 0
    matches = []

    for i in range(len(text)):
        while j > 0 and text[i] != pattern[j]:
            j = lps[j - 1]
        if text[i] == pattern[j]:
            j += 1
        if j == len(pattern):
            matches.append(i - j + 1)
            j = lps[j - 1]

    return matches
