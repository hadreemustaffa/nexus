import Tokenizer from './Tokenizer';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer();
  });

  it('lowercases and splits on non-alphanumeric characters', () => {
    const result = tokenizer.tokenize(
      'React + TypeScript for note-taking apps'
    );

    expect(result).toStrictEqual([
      'react',
      'typescript',
      'note',
      'taking',
      'apps',
    ]);
  });

  it('drops stopwords', () => {
    const result = tokenizer.tokenize('build notes with a search index');

    expect(result).toStrictEqual(['build', 'notes', 'search', 'index']);
  });

  it('returns [] for single-character tokens', () => {
    const result = tokenizer.tokenize('x');

    expect(result).toStrictEqual([]);
  });

  it('returns [] for empty or stopword-only input', () => {
    const stopwordOnly = tokenizer.tokenize('and the or in');
    const empty = tokenizer.tokenize('');

    expect(stopwordOnly).toStrictEqual([]);
    expect(empty).toStrictEqual([]);
  });

  it('splits punctuation-heavy text correctly', () => {
    const result = tokenizer.tokenize(
      'Clean Architecture: entities, use cases, adapters.'
    );

    expect(result).toStrictEqual([
      'clean',
      'architecture',
      'entities',
      'use',
      'cases',
      'adapters',
    ]);
  });
});
