import json
import unittest

from python.kmp import build_lps, kmp_search


with open('tests/vectors.json', 'r', encoding='utf-8') as f:
    vectors = json.load(f)


class KMPTests(unittest.TestCase):
    def test_build_lps(self):
        for vector in vectors:
            self.assertEqual(build_lps(vector['pattern']), vector['lps'])

    def test_kmp_search(self):
        for vector in vectors:
            self.assertEqual(kmp_search(vector['text'], vector['pattern']), vector['matches'])


if __name__ == '__main__':
    unittest.main()
