import { makeScreenClassTester } from './common';

const testScreenClass = makeScreenClassTester({
  defaultScreenClass: 'lg',
  cascadeMode: 'desktop-first',
});

describe('desktop-first', () => {
  it('no xs inherits sm', () => {
    testScreenClass('xs', 'sm');
  });
  it('sm inherits sm', () => {
    testScreenClass('sm', 'sm');
  });
  it('md inherits md', () => {
    testScreenClass('md', 'md');
  });
  it('no lg inherits base', () => {
    testScreenClass('lg', 'base');
  });
});
