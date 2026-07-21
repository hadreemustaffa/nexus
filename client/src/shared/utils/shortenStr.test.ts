import { shortenStr } from './shortenStr';

describe('shortenStr', () => {
  it('truncates string over maxLength and appends "..."', () => {
    const maxLength = 40;
    const longStr = Array(maxLength + 5)
      .fill('W')
      .join('');

    const strResult = Array(maxLength).fill('W').join('').concat('...');

    const result = shortenStr(longStr, maxLength);

    expect(result).toBe(strResult);
  });

  it('keeps string under or equal to maxLength unchanged', () => {
    const maxLength = 40;
    const str = Array(maxLength).fill('W').join('');

    const result = shortenStr(str, maxLength);

    expect(result).toBe(str);
  });
});
