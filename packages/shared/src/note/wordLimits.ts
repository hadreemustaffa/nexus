export const NOTE_WORD_MIN = 100;
export const NOTE_WORD_MAX = 7500;

export function countWords(text: string): number {
  return (text.match(/\b\w+\b/g) ?? []).length;
}

export function noteWordCountMessage(wordCount: number): string {
  return `Currently ${wordCount} words`;
}

export function noteWordCountTooFewMessage(): string {
  return `Note must be at least ${NOTE_WORD_MIN} words`;
}

export function noteWordCountTooManyMessage(): string {
  return `Note cannot exceed ${NOTE_WORD_MAX} words`;
}

export function noteContentMinWordsMessage(): string {
  return `Content must be at least ${NOTE_WORD_MIN} words`;
}

export function noteContentMaxWordsMessage(): string {
  return `Content cannot exceed ${NOTE_WORD_MAX} words`;
}
