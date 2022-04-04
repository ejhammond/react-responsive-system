import * as React from 'react';
import { createResponsiveSystem, ScreenClass, ScreenClassConfiguration } from '../../..';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrate } from 'react-dom';

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
 * Mocks the window.matchMedia fn such that it will return `matches = true` when asked to match
 * the given screen class's media query
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

  return (window.matchMedia as jest.Mock).mockRestore;
}

const componentTestID = 'test-component';
function getComponentContents(container: Element) {
  const componentElement = container.querySelector(`[data-testid="${componentTestID}"]`);
  if (componentElement === null) {
    throw new Error('Could not find test component by testid in the given container');
  }
  return componentElement.innerHTML;
}

export function makeTestComponent({
  cascadeMode: cascadeModeFromArgs,
  initialScreenClass,
}: Omit<ScreenClassConfiguration<typeof breakpoints>, 'breakpoints'>): {
  testComponent: React.ReactElement;
  getExpectedInitialContent: (screenClass: ScreenClass<typeof breakpoints>) => string;
  getExpectedFinalContent: (screenClass: ScreenClass<typeof breakpoints>) => string;
} {
  // createResponsiveSystem will default to 'no-cascade'; if that ever changes
  // then this line will also need to change
  const cascadeMode = cascadeModeFromArgs ?? 'no-cascade';

  const { ScreenClassProvider, useResponsiveValue } = createResponsiveSystem({
    breakpoints,
    cascadeMode,
    initialScreenClass,
  });

  const DEFAULT_TEXT = 'default';
  const SM_OVERRIDE_TEXT = 'sm';
  const MD_OVERRIDE_TEXT = 'md';

  /**
   * This component is has overrides on small and medium screens
   *
   * Depending on the cascase mode, we will expect different values
   * on xs and lg screens
   *
   * no-cascade: xs and lg have DEFAULT_TEXT
   * mobile-first: xs has DEFAULT_TEXT, lg has MD_OVERRIDE_TEXT
   * desktop-first: lg has DEFAULT_TEXT, xs has SM_OVERRIDE_TEXT
   */
  const ResponsiveComp: React.FC<Record<string, never>> = () => {
    const responsiveValue = useResponsiveValue(DEFAULT_TEXT, {
      sm: SM_OVERRIDE_TEXT,
      md: MD_OVERRIDE_TEXT,
    });

    return <div data-testid={componentTestID}>{responsiveValue}</div>;
  };

  const expectedResults = {
    'no-cascade': {
      xs: DEFAULT_TEXT,
      sm: SM_OVERRIDE_TEXT,
      md: MD_OVERRIDE_TEXT,
      lg: DEFAULT_TEXT,
    },
    'mobile-first': {
      xs: DEFAULT_TEXT,
      sm: SM_OVERRIDE_TEXT,
      md: MD_OVERRIDE_TEXT,
      lg: MD_OVERRIDE_TEXT, // inherits from md
    },
    'desktop-first': {
      xs: SM_OVERRIDE_TEXT, // inherits from sm
      sm: SM_OVERRIDE_TEXT,
      md: MD_OVERRIDE_TEXT,
      lg: DEFAULT_TEXT,
    },
  };

  return {
    testComponent: (
      <ScreenClassProvider>
        <ResponsiveComp />
      </ScreenClassProvider>
    ),
    getExpectedInitialContent: (screenClass: ScreenClass<typeof breakpoints>) => {
      if (initialScreenClass !== undefined) {
        return initialScreenClass;
      }

      return expectedResults[cascadeMode][screenClass];
    },
    getExpectedFinalContent: (screenClass: ScreenClass<typeof breakpoints>) => {
      return expectedResults[cascadeMode][screenClass];
    },
  };
}

export function testCascade({
  cascadeMode,
  screenClass,
}: {
  cascadeMode: ScreenClassConfiguration<typeof breakpoints>['cascadeMode'];
  screenClass: ScreenClass<typeof breakpoints>;
}) {
  const unmockMatchMedia = mockMatchMedia(screenClass);

  const { testComponent, getExpectedFinalContent } = makeTestComponent({
    cascadeMode,
  });

  const { getByTestId } = render(testComponent);

  // expected final content and expected initial content will be the same thing since we're
  // not providing an initialScreenClass, so we can use either one here
  expect(getByTestId(componentTestID).innerHTML).toBe(getExpectedFinalContent(screenClass));

  unmockMatchMedia();
}

export function testSSR({
  initialScreenClass,
  actualScreenClass,
}: {
  initialScreenClass: ScreenClass<typeof breakpoints>;
  actualScreenClass: ScreenClass<typeof breakpoints>;
}) {
  // create a container for the test component and add it to the JestDOM document
  const containerID = 'test-root';
  const container = document.createElement('div');
  container.id = containerID;
  document.body.appendChild(container);

  // create the test component
  const { testComponent, getExpectedInitialContent, getExpectedFinalContent } = makeTestComponent({
    cascadeMode: 'no-cascade',
    initialScreenClass,
  });

  const expectedInitialContent = getExpectedInitialContent(initialScreenClass);
  const expectedFinalContent = getExpectedFinalContent(actualScreenClass);

  // SSR into Jest DOM
  const stringifiedDOM = renderToString(testComponent);
  container.innerHTML = stringifiedDOM;

  // confirm that our SSR'd content matches our expected initial content
  expect(getComponentContents(container)).toBe(expectedInitialContent);

  // mock window.matchMedia so that it returns the given "actual" screen class
  const unmockMatchMedia = mockMatchMedia(actualScreenClass);

  // hydrate the Jest DOM document
  // this should error if the initial hydrated DOM doesn't match the SSR'd DOM
  hydrate(testComponent, container);

  // confirm that our hydrated content matches our expected initial content
  expect(getComponentContents(container)).toBe(expectedInitialContent);

  // give React a moment to run useEffect and to render the final content
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      // confirm that the DOM now has the expected final content
      expect(getComponentContents(container)).toBe(expectedFinalContent);

      // clean up
      unmockMatchMedia();
      document.body.removeChild(container);
      resolve();
    }, 0),
  );
}
