export function countWords(text: string): number {
  return (text.match(/\b\w+\b/g) ?? []).length;
}

export function countCharacters(text: string): number {
  return text.trim().length;
}
