import { makeScreenClassTester } from './common';

const testScreenClass = makeScreenClassTester({
  defaultScreenClass: 'lg',
  cascadeMode: 'mobile-first',
});

describe('mobile-first', () => {
  it('no xs inherits base', () => {
    testScreenClass('xs', 'base');
  });
  it('sm inherits sm', () => {
    testScreenClass('sm', 'sm');
  });
  it('md inherits md', () => {
    testScreenClass('md', 'md');
  });
  it('no lg inherits md', () => {
    testScreenClass('lg', 'md');
  });
});
