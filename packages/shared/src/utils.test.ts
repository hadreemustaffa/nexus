import { countCharacters, countWords } from './utils';

describe('countWords', () => {
  it('counts simple space-separated words', () => {
    expect(countWords('apple banana')).toBe(2);
  });

  it('treats numbers as words', () => {
    expect(countWords('there are 100 apples')).toBe(4);
  });

  it('treats hyphenated words as a single word', () => {
    expect(countWords('a note-taking app')).toBe(3);
  });

  it('treats underscore-joined words as a single word', () => {
    expect(countWords('an underscore_joined word')).toBe(3);
  });

  it('handles mixed whitespace (tabs, newlines, multiple spaces)', () => {
    expect(countWords('eating\t\thealthy\n\n    food')).toBe(3);
  });

  it('handles unicode characters', () => {
    expect(countWords('café')).toBe(1);
    expect(countWords('日本語')).toBe(1);
  });

  it('treats punctuation attached to words as part of word boundaries', () => {
    expect(countWords('hello, world!')).toBe(2);
  });

  it('treats straight apostrophes inside words as part of the word', () => {
    expect(countWords("world's first")).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only strings', () => {
    expect(countWords('   \n\t  ')).toBe(0);
  });

  it('returns 0 for punctuation-only input', () => {
    expect(countWords('!!! ... ???')).toBe(0);
  });

  it('treats a hyphen-joined numeric sequence as one word', () => {
    expect(countWords('3-2-1')).toBe(1);
  });

  // The following tests document current behavior at the edges of the
  // separator rule (`['_-]` must sit directly between two letter/number
  // runs). They're not necessarily "correct" from a user's perspective —
  // worth revisiting if real note content hits these often.

  it('splits contractions typed with a curly apostrophe (not in the separator class)', () => {
    expect(countWords('don’t')).toBe(2); // "don", "t" — a straight ' would give 1
  });

  it('splits on doubled separators instead of treating them as one', () => {
    expect(countWords('well--known')).toBe(2); // "well", "known"
  });

  it('drops a trailing separator with nothing after it', () => {
    expect(countWords('auto-')).toBe(1); // "auto"
  });

  it('splits decimal numbers into separate words', () => {
    expect(countWords('3.14')).toBe(2); // "3", "14"
  });

  it('splits thousands-separated numbers into separate words', () => {
    expect(countWords('1,000')).toBe(2); // "1", "000"
  });
});

describe('countCharacters', () => {
  it('counts characters excluding leading/trailing whitespace', () => {
    expect(countCharacters(' note ')).toBe(4);
  });

  it('counts all visible characters including internal spaces', () => {
    expect(countCharacters('a note')).toBe(6);
  });

  it('counts internal tabs, newlines, and multiple spaces as characters', () => {
    expect(countCharacters('a\n\tb')).toBe(4);
    expect(countCharacters('a   b')).toBe(5);
  });

  it('counts a single-codepoint emoji as one character', () => {
    expect(countCharacters('🧐')).toBe(1);
  });

  it('returns 0 for whitespace-only strings', () => {
    expect(countCharacters('   \n\t')).toBe(0);
  });
});
