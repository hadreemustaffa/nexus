export const PROMPT_CHARS_MIN = 100;
export const PROMPT_CHARS_MAX = 5000;
export const PROMPT_KEY_MAX = 50;

export function promptCharCountMessage(charCount: number): string {
  return `Currently ${charCount} characters`;
}

export function promptKeyCountTooManyMessage(): string {
  return `Prompt key cannot exceed ${PROMPT_KEY_MAX} characters`;
}

export function promptCharCountTooFewMessage(): string {
  return `Prompt must be at least ${PROMPT_CHARS_MIN} characters`;
}

export function promptCharCountTooManyMessage(): string {
  return `Prompt cannot exceed ${PROMPT_CHARS_MAX} characters`;
}

export function promptContentMinCharactersMessage(): string {
  return `Content must be at least ${PROMPT_CHARS_MIN} characters`;
}

export function promptContentMaxCharactersMessage(): string {
  return `Content cannot exceed ${PROMPT_CHARS_MAX} characters`;
}
