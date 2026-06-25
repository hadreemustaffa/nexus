export default class Tokenizer {
  private readonly splitRegex = /[^a-z0-9]+/i;
  private readonly stopwords = new Set([
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
    'am',
    'being',
    'has',
    'have',
    'had',
    'does',
    'did',
    'do',
    'it',
    'its',
    'this',
    'that',
    'these',
    'those',
    'as',
    'all',
  ]);

  tokenize(text: string): string[] {
    const tokenizedText = text
      .toLowerCase()
      .split(this.splitRegex)
      .filter((word) => word.length > 1 && !this.stopwords.has(word));

    return tokenizedText;
  }
}
