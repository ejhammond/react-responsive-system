import { makeScreenClassTester, DEFAULT_TEXT, SM_OVERRIDE_TEXT, MD_OVERRIDE_TEXT } from './common';

const testScreenClass = makeScreenClassTester({
  defaultScreenClass: 'lg',
  cascadeMode: 'desktop-first',
});

describe('desktop-first', () => {
  it('no xs inherits sm', () => {
    testScreenClass('xs', SM_OVERRIDE_TEXT);
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
