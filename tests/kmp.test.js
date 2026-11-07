const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors.json'), 'utf8'));

function buildLps(pattern) {
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

function kmpSearch(text, pattern) {
  if (!pattern) return [];

  const lps = buildLps(pattern);
  let j = 0;
  const matches = [];

  for (let i = 0; i < text.length; i += 1) {
    while (j > 0 && text[i] !== pattern[j]) {
      j = lps[j - 1];
    }

    if (text[i] === pattern[j]) {
      j += 1;
    }

    if (j === pattern.length) {
      matches.push(i - j + 1);
      j = lps[j - 1] || 0;
    }
  }

  return matches;
}

test('buildLps matches expected values', () => {
  for (const vector of vectors) {
    assert.deepEqual(buildLps(vector.pattern), vector.lps);
  }
});

test('kmpSearch matches expected positions', () => {
  for (const vector of vectors) {
    assert.deepEqual(kmpSearch(vector.text, vector.pattern), vector.matches);
  }
});

test('repeated-prefix input reports one match', () => {
  const matches = kmpSearch('AAAAAAAAAAAAAB', 'AAAAB');
  assert.equal(matches.length, 1);
});
