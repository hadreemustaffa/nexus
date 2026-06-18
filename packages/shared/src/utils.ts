export function countWords(text: string): number {
  return (text.trim().match(/[\p{L}\p{N}]+(?:['_-][\p{L}\p{N}]+)*/gu) ?? [])
    .length;
}

export function countCharacters(text: string): number {
  const trimmed = text.trim();
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const segments = segmenter.segment(trimmed);

  return [...segments].length;
}
