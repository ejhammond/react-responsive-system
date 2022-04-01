import { applyOverrides } from '../../impl';

const applicableScreenClasses = ['one', 'two'];

describe('getApplicableScreenClasses', () => {
  it('later values override earlier', () => {
    expect(
      applyOverrides({
        applicableScreenClasses,
        defaultValue: 'default',
        overrides: {
          one: 'one',
          two: 'two',
        },
      }),
    ).toBe('two');
  });
  it('no overrides', () => {
    expect(
      applyOverrides({
        applicableScreenClasses,
        defaultValue: 'default',
        overrides: {},
      }),
    ).toBe('default');
  });
});
