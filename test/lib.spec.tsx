import * as React from 'react';
import { render } from '@testing-library/react';

import { createResponsiveSystem, ResponsiveProps } from '../src';

expect.extend({
  toBeInList(received, list) {
    const pass = list.some((item: any) => Object.is(received, item));

    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be in [${list.join(' , ')}]`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in [${list.join(' , ')}]`,
        pass: false,
      };
    }
  },
});

const breakpoints = {
  xs: 500,
  sm: 750,
  md: 1000,
  lg: Infinity,
};

const {
  ScreenClassProvider,
  responsive,
  useResponsiveProps,
} = createResponsiveSystem({
  breakpoints,
  defaultScreenClass: 'lg',
});

const expectedMediaQueries: { [K in keyof typeof breakpoints]: string } = {
  xs: '(max-width: 500px)',
  sm: '(min-width: 501px) and (max-width: 750px)',
  md: '(min-width: 751px) and (max-width: 1000px)',
  lg: '(min-width: 1001px)',
};

function setupEnv(screenClass: keyof typeof breakpoints) {
  window.matchMedia = jest.fn().mockImplementation(query => {
    // assert that every media query that we try to match is an "expected" media query
    // @ts-ignore
    expect(query).toBeInList(Object.values(expectedMediaQueries));

    return {
      // match only if we get the media query for the given screen class
      matches: query === expectedMediaQueries[screenClass],
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  });
}

const ResponsiveCompWithHOC = responsive(
  (props: React.PropsWithChildren<{ text: string }>) => (
    <div data-testid="hoc-comp">{props.text}</div>
  )
);

const ResponsiveCompWithHook: React.FC<ResponsiveProps<
  typeof breakpoints,
  { text: string }
>> = props => {
  const responsiveProps = useResponsiveProps(props);

  return <div data-testid="hook-comp">{responsiveProps.text}</div>;
};

function test(screenClass: keyof typeof breakpoints) {
  setupEnv(screenClass);

  const { queryByTestId } = render(
    <ScreenClassProvider>
      <ResponsiveCompWithHOC
        text="default"
        xs={{ text: 'xs' }}
        sm={{ text: 'sm' }}
        md={{ text: 'md' }}
        lg={{ text: 'lg' }}
      />
      <ResponsiveCompWithHook
        text="default"
        xs={{ text: 'xs' }}
        sm={{ text: 'sm' }}
        md={{ text: 'md' }}
        lg={{ text: 'lg' }}
      />
    </ScreenClassProvider>
  );

  expect(queryByTestId('hoc-comp')).toBeTruthy();
  expect(queryByTestId('hoc-comp')!.innerHTML).toBe(screenClass);
  expect(queryByTestId('hook-comp')).toBeTruthy();
  expect(queryByTestId('hook-comp')!.innerHTML).toBe(screenClass);
}

describe('it', () => {
  it('overrides on min screen class', () => {
    test('xs');
  });
  it('overrides on middle screen class', () => {
    test('sm');
  });
  it('overrides on max screen class', () => {
    test('lg');
  });
});
