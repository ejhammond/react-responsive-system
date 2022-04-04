import { testCascade } from './common';

describe('no-cascade', () => {
  it('xs', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'xs' });
  });
  it('sm', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'sm' });
  });
  it('md', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'md' });
  });
  it('lg', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'lg' });
  });
});

describe('mobile-first', () => {
  it('xs', () => {
    testCascade({ cascadeMode: 'mobile-first', screenClass: 'xs' });
  });
  it('sm', () => {
    testCascade({ cascadeMode: 'mobile-first', screenClass: 'sm' });
  });
  it('md', () => {
    testCascade({ cascadeMode: 'mobile-first', screenClass: 'md' });
  });
  it('lg', () => {
    testCascade({ cascadeMode: 'mobile-first', screenClass: 'lg' });
  });
});

describe('desktop-first', () => {
  it('xs', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'xs' });
  });
  it('sm', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'sm' });
  });
  it('md', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'md' });
  });
  it('lg', () => {
    testCascade({ cascadeMode: 'no-cascade', screenClass: 'lg' });
  });
});
