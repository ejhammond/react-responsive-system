import { makeScreenClassTester, DEFAULT_TEXT, SM_OVERRIDE_TEXT, MD_OVERRIDE_TEXT } from './common';

const testScreenClass = makeScreenClassTester({
  defaultScreenClass: 'lg',
  cascadeMode: 'no-cascade',
});

describe('no-cascade', () => {
  it('no xs inherits default', () => {
    testScreenClass('xs', DEFAULT_TEXT);
  });
  it('sm inherits sm', () => {
    testScreenClass('sm', SM_OVERRIDE_TEXT);
  });
  it('md inherits md', () => {
    testScreenClass('md', MD_OVERRIDE_TEXT);
  });
  it('no lg inherits default', () => {
    testScreenClass('lg', DEFAULT_TEXT);
  });
});
