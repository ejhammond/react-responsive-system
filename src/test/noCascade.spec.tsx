import { makeScreenClassTester } from './common';

const testScreenClass = makeScreenClassTester({
  defaultScreenClass: 'lg',
  cascadeMode: 'no-cascade',
});

describe('no-cascade', () => {
  it('no xs inherits base', () => {
    testScreenClass('xs', 'base');
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
