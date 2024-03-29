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
    expect(sortBreakpoints(breakpoints)).toStrictEqual([
      ['one', 1],
      ['two', 2],
      ['three', 3],
      ['four', 4],
      ['infinity', Infinity],
    ]);
  });
});
