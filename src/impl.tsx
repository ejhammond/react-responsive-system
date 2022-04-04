import * as React from 'react';

//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//

/**
 * A mapping of ScreenClass names to the maximum pixel-width where they apply
 *
 * Of course, your largest breakpoint will not have a maximum pixel-width--pass `Infinity` in order to indicate that there's no maximum.
 * Every instance of ScreenClassBreakpoints should have exactly one ScreenClass with a value of `Infinity`,
 * otherwise very-large screen sizes will manifest as having an `undefined` ScreenClass
 *
 * @example
 * {
 *   xs: 500, // 0 - 500px -> "xs"
 *   sm: 750, // 501 - 750px -> "sm"
 *   md: 1000, // 751 - 1000px -> "md"
 *   lg: Infinity, // 1001+ -> "lg"
 * }
 */
export type ScreenClassBreakpoints = {
  [screenClass: string]: number;
};

export type ScreenClass<B extends ScreenClassBreakpoints> = keyof B;

type CascadeMode = 'no-cascade' | 'mobile-first' | 'desktop-first';

export type ScreenClassConfiguration<B extends ScreenClassBreakpoints> = {
  /**
   * (SSR-only)
   *
   * If you are server-side rendering your application, you MUST provide an initial
   * screen class. We rely on the brower's `window` to determine the screen class; if the `window`
   * is not available (e.g. during SSR) then we have no way of deciding which screen class to
   * send to your app.
   *
   * If you are not server-side rendering your application, you should not provide an
   * `initialScreenClass`; instead, we'll determine the initial screen class automatically on the
   * first render.
   *
   * Note that users of the app may experience a layout shift if your `initialScreenClass` does not
   * match their device's actual screen class.
   *
   * Tips:
   * - If you are not SSR'ing your app, leave this blank or pass `undefined`
   * - If you must SSR your app
   *   - You can hard-code a value, but your users may experience a layout shift if you're wrong
   *   - You can make your responsive components "client components" by rendering a placeholder
   *   during SSR (e.g. https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85#option-2-lazily-show-component-with-uselayouteffect)
   *   - You could theoretically try to guess a good initial screen class by inspecting the User-Agent
   *   Request header to figure out if the request came from a mobile device vs a laptop/desktop browser
   */
  initialScreenClass?: ScreenClass<B>;

  /**
   * A mapping of ScreenClass names to the maximum pixel-width where they apply
   *
   * @example
   * {
   *   xs: 500,
   *   sm: 750,
   *   md: 1000,
   *   lg: Infinity
   * }
   */
  breakpoints: B;

  /**
   * Controls the way that overrides are applied
   *
   * "no-cascade" -> only apply overrides on the exact screen class
   * "mobile-first" -> override on matching screen class and larger
   * "desktop-first" -> override on matching screen class and smaller
   *
   * @default "no-cascade"
   */
  cascadeMode?: CascadeMode;
};

export type ScreenClassOverrides<B extends ScreenClassBreakpoints, T> = Partial<{
  [K in ScreenClass<B>]: T;
}>;

//
// ─── UNIT FNS ───────────────────────────────────────────────────────────────────
//

/**
 * Sorts the given breakpoints from smallest to largest e.g.
 * [
 *   ['xs', 100],
 *   ['sm', 200],
 *   ['md', 300],
 * ]
 */
export function sortBreakpoints<B extends ScreenClassBreakpoints>(
  breakpoints: B,
): [ScreenClass<B>, number][] {
  return Object.entries(breakpoints).sort(
    ([, maxPixelWidth1], [, maxPixelWidth2]) => maxPixelWidth1 - maxPixelWidth2,
  );
}

/**
 * Based on the cascade mode, determines which screen classes are relevant for the current screen
 * class and in what order they should be applied. e.g. on "md" screen, with cascade mode "desktop-first"
 * we should apply "xl" then "lg" then "md". But if cascade mode is "mobile-first" then we should
 * apply "xs" then "sm" then "md". Or if the cascade mode is "no-cascade" then just apply "md"
 */
export function getApplicableScreenClasses<B extends ScreenClassBreakpoints>({
  sortedScreenClasses,
  currentScreenClass,
  cascadeMode,
}: {
  currentScreenClass: ScreenClass<B>;
  sortedScreenClasses: ScreenClass<B>[];
  cascadeMode: CascadeMode;
}): ScreenClass<B>[] {
  let applicableScreenClasses: ScreenClass<B>[] = [];
  switch (cascadeMode) {
    case 'mobile-first':
      applicableScreenClasses = sortedScreenClasses.slice(
        0,
        sortedScreenClasses.indexOf(currentScreenClass) + 1,
      );
      break;
    case 'desktop-first':
      applicableScreenClasses = sortedScreenClasses
        .slice(sortedScreenClasses.indexOf(currentScreenClass))
        .reverse();
      break;
    case 'no-cascade':
    default:
      applicableScreenClasses = [currentScreenClass];
  }
  return applicableScreenClasses;
}

/**
 * Simply applies the given overrides in the specified order
 */
export function applyOverrides<B extends ScreenClassBreakpoints, T>({
  applicableScreenClasses,
  defaultValue,
  overrides,
}: {
  applicableScreenClasses: ScreenClass<B>[];
  defaultValue: T;
  overrides: ScreenClassOverrides<B, T>;
}): T {
  let responsiveValue = defaultValue;
  applicableScreenClasses.forEach((sc) => {
    if (Object.hasOwnProperty.call(overrides, sc)) {
      // TypeScript: since we checked hasOwnProperty, we know that this is type T
      responsiveValue = overrides[sc] as T;
    }
  });
  return responsiveValue;
}

//
// ─── FACTORY ────────────────────────────────────────────────────────────────────
//

export function createResponsiveSystem<B extends ScreenClassBreakpoints>(
  screenClassConfiguration: ScreenClassConfiguration<B>,
) {
  const { initialScreenClass, breakpoints, cascadeMode = 'no-cascade' } = screenClassConfiguration;

  //
  // ─── VALIDATE ───────────────────────────────────────────────────────────────────
  //

  const breakpointValues = Object.values(breakpoints);
  if (breakpointValues.length < 2) {
    throw new Error(
      'ScreenClassConfigurationError - `breakpoints` must have at least 2 keys e.g. `{ mobile: 320, desktop: Infinity }`',
    );
  }

  if (breakpointValues.filter((value) => value === Infinity).length !== 1) {
    throw new Error(
      'ScreenClassConfigurationError - `breakpoints` must have exactly 1 entry with a value of `Infinity` for the maximum pixel-width e.g. `{ mobile: 320, desktop: Infinity }`',
    );
  }

  //
  // ─── SORT ───────────────────────────────────────────────────────────────────────
  //

  const sortedBreakpoints = sortBreakpoints(breakpoints);

  const sortedScreenClasses = sortedBreakpoints.map(([screenClass]) => screenClass);

  type MediaQuery = string;
  const screenClassMediaQueries: [ScreenClass<B>, MediaQuery][] = sortedBreakpoints.map(
    ([screenClass, maxWidthPx], index) => {
      // the minWidth for this screenClass is the maxWidth of the previous breakpoint + 1
      const minWidthPx = index > 0 ? sortedBreakpoints[index - 1][1] + 1 : 0;

      const constraints: string[] = [];
      if (minWidthPx !== 0) {
        constraints.push(`(min-width: ${minWidthPx}px)`);
      }
      if (maxWidthPx !== Infinity) {
        constraints.push(`(max-width: ${maxWidthPx}px)`);
      }

      return [screenClass, constraints.join(' and ')];
    },
  );

  // no-unused-vars had a false positive on screenClass here
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type OnScreenClassChange = (screenClass: ScreenClass<B>) => void;

  function subscribeMediaQueries(onChange: OnScreenClassChange) {
    const unsubscribeFns: (() => void)[] = [];

    screenClassMediaQueries.forEach(([screenClass, mediaQuery]) => {
      const mediaQueryList = window.matchMedia(mediaQuery);

      // in order to set the correct initial state, we need to immediately check each mql
      // due to the non-overlapping nature of breakpoints, exactly one media query should match
      if (mediaQueryList.matches) {
        onChange(screenClass);
      }

      const listener = (event: MediaQueryListEvent) => {
        if (event.matches) {
          onChange(screenClass);
        }
      };

      mediaQueryList.addEventListener('change', listener);
      unsubscribeFns.push(() => mediaQueryList.removeEventListener('change', listener));
    });

    return () => unsubscribeFns.forEach((fn) => fn());
  }

  //
  // ─── CONTEXT ────────────────────────────────────────────────────────────────────
  //

  const screenClassContext = React.createContext<ScreenClass<B> | null>(null);

  //
  // ─── PROVIDER ───────────────────────────────────────────────────────────────────
  //

  const { Provider } = screenClassContext;

  const ScreenClassProvider: React.FC = ({ children }) => {
    const [currentScreenClass, setCurrentScreenClass] = React.useState<ScreenClass<B> | undefined>(
      initialScreenClass,
    );

    // initialScreenClass will be constant throughout the lifecycle of this component
    // so we can safely disable the rules-of-hooks here
    /* eslint-disable react-hooks/rules-of-hooks */
    if (initialScreenClass !== undefined) {
      // we have an initial screen class, so we'll render that on the first pass
      // then we'll hook up our media queries after the first render
      React.useEffect(() => {
        return subscribeMediaQueries((sc) => setCurrentScreenClass(sc));
      }, []);
    } else {
      // we didn't have an initial screen class, so we'll hook up our media queries
      // before we render anything (this had better be a client-side rendered app!)
      React.useLayoutEffect(() => {
        return subscribeMediaQueries((sc) => setCurrentScreenClass(sc));
      }, []);
    }
    /* eslint-enable react-hooks/rules-of-hooks */

    // if we got an initialScreenClass, we'll bypass this
    // if not, then our useLayoutEffect will ensure that this null is thrown away
    // and we'll immediately re-render with the proper screen class
    if (currentScreenClass === undefined) {
      return null;
    }

    return <Provider value={currentScreenClass}>{children}</Provider>;
  };

  function useScreenClass(): ScreenClass<B> {
    const screenClass = React.useContext(screenClassContext);

    if (screenClass === null) {
      throw new Error(
        "`useScreenClass` may only be used inside of a ScreenClassProvider. Make sure that you've rendered a ScreenClassProvider",
      );
    }

    return screenClass;
  }

  /**
   * Creates a responsive value.
   *
   * @param defaultValue the value to use when no appropriate override is found
   * @param overrides values to use under certain screen class conditions
   * @returns a single value that is most appropriate given the current screen class
   */
  function useResponsiveValue<T>(defaultValue: T, overrides: ScreenClassOverrides<B, T>): T {
    const screenClass = useScreenClass();

    const applicableScreenClasses = React.useMemo(
      () =>
        getApplicableScreenClasses({
          cascadeMode,
          currentScreenClass: screenClass,
          sortedScreenClasses,
        }),
      [screenClass],
    );

    // not worth memoizing because `overrides` is probably going to be a new object on each render.
    // we could consider doing a shallow-equals on that object but at the end of the day, this fn
    // is very simple and is unlikely to be a perf issue
    return applyOverrides({
      applicableScreenClasses,
      defaultValue,
      overrides,
    });
  }

  return {
    ScreenClassProvider,
    useScreenClass,
    useResponsiveValue,
  };
}
