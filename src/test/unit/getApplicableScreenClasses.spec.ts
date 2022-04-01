import { getApplicableScreenClasses } from '../../impl';

const sortedScreenClasses = ['xs', 'sm', 'md', 'lg', 'xl'];
const currentScreenClass = 'md';

describe('getApplicableScreenClasses', () => {
  it('no-cascade', () => {
    expect(
      getApplicableScreenClasses({
        cascadeMode: 'no-cascade',
        currentScreenClass,
        sortedScreenClasses,
      }),
    ).toStrictEqual(['md']);
  });
  it('desktop-first', () => {
    expect(
      getApplicableScreenClasses({
        cascadeMode: 'desktop-first',
        currentScreenClass,
        sortedScreenClasses,
      }),
    ).toStrictEqual(['xl', 'lg', 'md']);
  });
  it('mobile-first', () => {
    expect(
      getApplicableScreenClasses({
        cascadeMode: 'mobile-first',
        currentScreenClass,
        sortedScreenClasses,
      }),
    ).toStrictEqual(['xs', 'sm', 'md']);
  });
});
