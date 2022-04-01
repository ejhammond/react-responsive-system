import * as React from 'react';

//
// ─── HELPERS ────────────────────────────────────────────────────────────────────
//

// keep track of whether or not we have access to `window` (so that we don't crash during e.g. server-side rendering)
const windowExists = typeof window === 'object';

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

type CascadeMode = 'no-cascade' | 'mobile-first' | 'desktop-first';

export type ScreenClassConfiguration<B extends ScreenClassBreakpoints> = {
  /**
   * The ScreenClass that should be used if we're unable to determine the size of the window
   * (i.e. when `window` does not exist e.g. during server-side rendering or headless testing)
   *
   * Tip: during testing, use this prop to control the ScreenClass for a given test
   */
  defaultScreenClass: ScreenClass<B>;

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

export type ScreenClass<B extends ScreenClassBreakpoints> = keyof B;

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
    if (overrides.hasOwnProperty(sc)) {
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
  const { defaultScreenClass, breakpoints, cascadeMode = 'no-cascade' } = screenClassConfiguration;

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

  //
  // ─── CONTEXT ────────────────────────────────────────────────────────────────────
  //

  const screenClassContext = React.createContext<ScreenClass<B> | undefined>(undefined);

  //
  // ─── PROVIDER ───────────────────────────────────────────────────────────────────
  //

  const { Provider } = screenClassContext;

  const ScreenClassProvider: React.FC = ({ children }) => {
    const [currentScreenClass, setCurrentScreenClass] =
      React.useState<ScreenClass<B>>(defaultScreenClass);

    React.useLayoutEffect(() => {
      if (!windowExists) {
        return;
      }

      type MediaQueryListListener = (this: MediaQueryList, event: MediaQueryListEvent) => any;
      const listeners: [MediaQueryList, MediaQueryListListener][] = [];

      screenClassMediaQueries.forEach(([screenClass, mediaQuery]) => {
        const mediaQueryList = window.matchMedia(mediaQuery);

        // in order to set the correct initial state, we need to immediately check each mql
        if (mediaQueryList.matches) {
          setCurrentScreenClass(screenClass);
        }

        const listener: MediaQueryListListener = (event) => {
          if (event.matches) {
            setCurrentScreenClass(screenClass);
          }
        };

        mediaQueryList.addListener(listener);

        listeners.push([mediaQueryList, listener]);
      });

      return () => listeners.forEach(([mql, l]) => mql.removeListener(l));
    }, []);

    return <Provider value={currentScreenClass}>{children}</Provider>;
  };

  function useScreenClass(): ScreenClass<B> {
    const screenClass = React.useContext(screenClassContext);

    if (screenClass === undefined) {
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
      [cascadeMode, screenClass, sortedScreenClasses],
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
