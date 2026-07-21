/**
 *
 * @param str input string to shorten
 * @param maxLength max length of characters
 * @returns shorten string appended with '...'
 */
export function shortenStr(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '...';
}
