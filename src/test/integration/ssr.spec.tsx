import { renderToString } from 'react-dom/server';

import { makeTestComponent, testSSR } from './common';

describe('SSR', () => {
  it('SSRs properly when initial screen class is correct', () => {
    testSSR({
      initialScreenClass: 'sm',
      actualScreenClass: 'sm',
    });
  });

  it('SSRs properly when initial screen class is incorrect', () => {
    testSSR({
      initialScreenClass: 'sm',
      actualScreenClass: 'md',
    });
  });

  it('SSR errors without initial screen class', () => {
    const { testComponent } = makeTestComponent({ cascadeMode: 'no-cascade' });

    // without initial screen class, SSRing should log an error
    console.error = jest.fn();
    renderToString(testComponent);
    expect(console.error).toBeCalledTimes(1);
    (console.error as jest.Mock).mockRestore();
  });
});
