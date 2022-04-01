import { sortBreakpoints } from '../../impl';

const breakpoints = {
  four: 4,
  infinity: Infinity,
  two: 2,
  one: 1,
  three: 3,
};

describe('sortBreakpoints', () => {
  it('sorts', () => {
    const b = sortBreakpoints(breakpoints);
    console.log(b);
    expect(b).toStrictEqual([
      ['one', 1],
      ['two', 2],
      ['three', 3],
      ['four', 4],
      ['infinity', Infinity],
    ]);
  });
});
