export const NOTE_WORD_MIN = 100;
export const NOTE_WORD_MAX = 7500;
export const NOTE_TITLE_CHARS_MAX = 100;

export function noteWordCountMessage(wordCount: number): string {
  return `Currently ${wordCount} words`;
}

export function noteCharsCountMessage(charsCount: number): string {
  return `Currently ${charsCount} characters`;
}

export function noteTitleCharsCountTooManyMessage(): string {
  return `Note title cannot exceed ${NOTE_TITLE_CHARS_MAX} characters`;
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
