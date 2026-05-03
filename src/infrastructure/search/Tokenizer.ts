export default class Tokenizer {
  private stopwords = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'was',
    'are',
    'were',
    'be',
    'been',
    'has',
    'have',
    'had',
    'it',
    'its',
    'this',
    'that',
    'as',
    'not',
    'but',
    'what',
    'all',
  ]);

  tokenize(text: string): string[] {
    const regex = /[^a-zA-Z0-9]+/;

    const tokenizedText = text
      .toLowerCase()
      .split(regex)
      .filter((word) => word.length > 1 && !this.stopwords.has(word));

    return tokenizedText;
  }
}
