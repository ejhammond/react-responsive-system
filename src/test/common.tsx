import * as React from 'react';
import { ResponsiveProps, createResponsiveSystem, ScreenClassConfiguration } from '../..';
import { render } from '@testing-library/react';

const breakpoints = {
  xs: 500,
  sm: 750,
  md: 1000,
  lg: Infinity,
};

const expectedMediaQueries: { [K in keyof typeof breakpoints]: string } = {
  xs: '(max-width: 500px)',
  sm: '(min-width: 501px) and (max-width: 750px)',
  md: '(min-width: 751px) and (max-width: 1000px)',
  lg: '(min-width: 1001px)',
};

/**
 * Mocks the window.matchMedia fn such that it will return `matches = true` when asked to match the given screen class's media query
 *
 * This mock will assert that every input passed to matchMedia is one of our expected media queries
 * and will return `matches = true` only if the media query matches the expected media query
 * for the screenClass provided to `mockMatchMedia`
 */
function mockMatchMedia(screenClass: keyof typeof breakpoints) {
  window.matchMedia = jest.fn().mockImplementation((query) => {
    // assert that every media query that we try to match is an "expected" media query
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

export function makeScreenClassTester(
  responsiveSystemConfiguration: Omit<ScreenClassConfiguration<typeof breakpoints>, 'breakpoints'>,
) {
  const { ScreenClassProvider, responsive, useResponsiveProps } = createResponsiveSystem({
    breakpoints,
    ...responsiveSystemConfiguration,
  });

  const ResponsiveCompWithHOC = responsive((props: React.PropsWithChildren<{ text: string }>) => (
    <div data-testid="hoc-comp">{props.text}</div>
  ));

  const ResponsiveCompWithHook: React.FC<ResponsiveProps<typeof breakpoints, { text: string }>> = (
    props,
  ) => {
    const responsiveProps = useResponsiveProps(props);

    return <div data-testid="hook-comp">{responsiveProps.text}</div>;
  };

  return function testScreenClass(
    screenClass: keyof typeof breakpoints,
    expected: keyof typeof breakpoints | 'base',
  ) {
    mockMatchMedia(screenClass);

    const { getByTestId } = render(
      <ScreenClassProvider>
        <ResponsiveCompWithHOC text="base" sm={{ text: 'sm' }} md={{ text: 'md' }} />
        <ResponsiveCompWithHook text="base" sm={{ text: 'sm' }} md={{ text: 'md' }} />
      </ScreenClassProvider>,
    );

    expect(getByTestId('hoc-comp').innerHTML).toBe(expected);
    expect(getByTestId('hook-comp').innerHTML).toBe(expected);
  };
}
