def shortest_repeating_unit(s):
    if not s:
        return ""

    n = len(s)
    prefix = [0] * n
    length = 0

    for i in range(1, n):
        while length > 0 and s[i] != s[length]:
            length = prefix[length - 1]
        if s[i] == s[length]:
            length += 1
        prefix[i] = length

    repeat_len = n - prefix[-1]
    if n % repeat_len == 0:
        return s[:repeat_len]
    return s
